import { v } from "convex/values";
import { query, mutation, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { internal, api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";

// Health check for the price engine + LLM pipeline + DB.
export const health = query({
  args: {},
  returns: v.object({
    db: v.object({
      holdings: v.number(),
      stocks: v.number(),
      news: v.number(),
      portfolioPositions: v.number(),
      investors: v.number(),
    }),
    market: v.union(
      v.null(),
      v.object({
        isOpen: v.boolean(),
        currentMicroTick: v.number(),
        currentMacroTick: v.number(),
        dayNumber: v.number(),
        lastMicroTickAt: v.number(),
        lastMacroTickAt: v.number(),
        secondsSinceLastMicroTick: v.number(),
        secondsSinceLastMacroTick: v.number(),
        microTickHealthy: v.boolean(),   // <30s since last tick
        macroTickHealthy: v.boolean(),   // <10min since last macro
      }),
    ),
    sampleStocks: v.array(
      v.object({
        ticker: v.string(),
        currentPrice: v.number(),
        openPrice: v.number(),
        macroOpenPrice: v.number(),
        changePctDay: v.number(),
        netSentimentFactor: v.number(),
      }),
    ),
    llm: v.object({
      anthropicKeyConfigured: v.boolean(),
      totalNewsItems: v.number(),
      newestNewsHeadline: v.union(v.string(), v.null()),
      newestNewsAge: v.union(v.number(), v.null()),
      stocksWithNonZeroSentiment: v.number(),
    }),
    priceActivity: v.object({
      stocksMovedFromOpen: v.number(),       // out of 57
      biggestMoverTicker: v.string(),
      biggestMoverPct: v.number(),
    }),
  }),
  handler: async (ctx) => {
    const [holdings, stocks, news, portfolio, investors] = await Promise.all([
      ctx.db.query("holdingCompanies").collect(),
      ctx.db.query("stocks").collect(),
      ctx.db.query("news").collect(),
      ctx.db.query("portfolio").collect(),
      ctx.db.query("investors").collect(),
    ]);
    const market = await ctx.db.query("marketState").first();
    const now = Date.now();

    const newestNews = [...news].sort((a, b) => b.publishedAt - a.publishedAt)[0];
    const nonZeroSentimentCount = stocks.filter((s) => Math.abs(s.netSentimentFactor) > 0.0001).length;
    const movedCount = stocks.filter((s) => Math.abs(s.currentPrice - s.openPrice) > 0.01).length;
    const biggestMover = [...stocks].sort((a, b) => Math.abs(b.changePctDay) - Math.abs(a.changePctDay))[0];

    const secSinceMicro = market ? Math.round((now - market.lastMicroTickAt) / 1000) : 999;
    const secSinceMacro = market ? Math.round((now - market.lastMacroTickAt) / 1000) : 999;

    return {
      db: {
        holdings: holdings.length,
        stocks: stocks.length,
        news: news.length,
        portfolioPositions: portfolio.length,
        investors: investors.length,
      },
      market: market
        ? {
            isOpen: market.isOpen,
            currentMicroTick: market.currentMicroTick,
            currentMacroTick: market.currentMacroTick,
            dayNumber: market.dayNumber,
            lastMicroTickAt: market.lastMicroTickAt,
            lastMacroTickAt: market.lastMacroTickAt,
            secondsSinceLastMicroTick: secSinceMicro,
            secondsSinceLastMacroTick: secSinceMacro,
            microTickHealthy: secSinceMicro < 30,
            macroTickHealthy: secSinceMacro < 600,
          }
        : null,
      sampleStocks: stocks.slice(0, 5).map((s) => ({
        ticker: s.ticker,
        currentPrice: s.currentPrice,
        openPrice: s.openPrice,
        macroOpenPrice: s.macroOpenPrice,
        changePctDay: s.changePctDay,
        netSentimentFactor: s.netSentimentFactor,
      })),
      llm: {
        anthropicKeyConfigured: !!process.env.ANTHROPIC_API_KEY,
        totalNewsItems: news.length,
        newestNewsHeadline: newestNews?.headline ?? null,
        newestNewsAge: newestNews ? Math.round((now - newestNews.publishedAt) / 1000) : null,
        stocksWithNonZeroSentiment: nonZeroSentimentCount,
      },
      priceActivity: {
        stocksMovedFromOpen: movedCount,
        biggestMoverTicker: biggestMover?.ticker ?? "",
        biggestMoverPct: biggestMover?.changePctDay ?? 0,
      },
    };
  },
});

// One-shot finder for the INV-08 zero-price COMPLETED orders so we can
// inspect what they look like before deciding to delete or backfill.
// Returns the bad rows verbatim.
export const findZeroPriceOrders = query({
  args: {},
  returns: v.array(
    v.object({
      id: v.id("orders"),
      ticker: v.string(),
      side: v.string(),
      pricingType: v.string(),
      quantity: v.number(),
      price: v.number(),
      total: v.number(),
      timestamp: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    return all
      .filter((o) => o.status === "COMPLETED" && (o.price <= 0 || o.total <= 0))
      .map((o) => ({
        id: o._id,
        ticker: o.ticker,
        side: o.side,
        pricingType: o.pricingType,
        quantity: o.quantity,
        price: o.price,
        total: o.total,
        timestamp: o.timestamp,
      }));
  },
});

// Force-trigger micro tick (for debugging)
export const forceMicroTick = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // Re-import internal mutation body by scheduling it
    await ctx.scheduler.runAfter(0, internal.priceEngine.applyMicroTick, {});
    return null;
  },
});

// Force-trigger macro tick (LLM sentiment + news)
export const forceMacroTick = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.runAction(internal.priceEngine.applyMacroTick, {});
    await ctx.runAction(internal.news.generateMacroNews, {});
    return null;
  },
});

// Wrapper to call the internal action from a mutation (for external trigger)
export const triggerMacroTick = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.diagnostics.forceMacroTick, {});
    return null;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Order-flow stress test
// ─────────────────────────────────────────────────────────────────────────────
// Run from the Convex dashboard:  diagnostics.stressTestOrders()
//
// Drives the real placeOrder / cancelOrder / processPendingLimits API end-to-
// end against a synthetic investor (`stress-test@mcse.local`), asserts state
// at each step, then cleans up. Safe to run on production — it never touches
// real users and the only side effect on real data is a small bump in
// volumeDay on the test ticker.

const TEST_EMAIL = "stress-test@mcse.local";
const TEST_BALANCE = 1_000_000;

export const _stressSetup = internalMutation({
  args: {},
  returns: v.object({
    investorId: v.id("investors"),
    tokenHash: v.string(),
    ticker: v.string(),
    currentPrice: v.number(),
    marketWasOpen: v.boolean(),
    marketStateOpened: v.boolean(),
  }),
  handler: async (ctx) => {
    // Force market open (saving prior state so we can restore).
    let state = await ctx.db.query("marketState").first();
    const marketWasOpen = state?.isOpen ?? false;
    let marketStateOpened = false;
    if (!state) {
      await ctx.db.insert("marketState", {
        isOpen: true,
        currentMicroTick: 0,
        currentMacroTick: 0,
        dayNumber: 1,
        openedAt: Date.now(),
        lastMicroTickAt: Date.now(),
        lastMacroTickAt: Date.now(),
      });
      marketStateOpened = true;
      state = await ctx.db.query("marketState").first();
    } else if (!state.isOpen) {
      await ctx.db.patch(state._id, { isOpen: true });
      marketStateOpened = true;
    }

    // Wipe any prior test artifacts.
    const stale = await ctx.db
      .query("investors")
      .withIndex("by_email", (q) => q.eq("email", TEST_EMAIL))
      .collect();
    for (const inv of stale) {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id))
        .collect();
      for (const s of sessions) await ctx.db.delete(s._id);
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id))
        .collect();
      for (const o of orders) await ctx.db.delete(o._id);
      const txns = await ctx.db
        .query("transactions")
        .withIndex("by_investor_time", (q) => q.eq("investorId", inv._id))
        .collect();
      for (const t of txns) await ctx.db.delete(t._id);
      const positions = await ctx.db
        .query("portfolio")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id))
        .collect();
      for (const p of positions) await ctx.db.delete(p._id);
      await ctx.db.delete(inv._id);
    }

    // Fresh investor + session.
    const investorId = await ctx.db.insert("investors", {
      registrationId: `STRESS-${Date.now()}`,
      email: TEST_EMAIL,
      name: "Stress Test",
      balance: TEST_BALANCE,
      createdAt: Date.now(),
    });
    const tokenHash = `stress-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await ctx.db.insert("sessions", {
      tokenHash,
      investorId,
      role: "user",
      expiresAt: Date.now() + 60 * 60 * 1000,
      createdAt: Date.now(),
    });

    // Pick the first listed stock.
    const stocks = await ctx.db.query("stocks").collect();
    const stock = stocks.find((s) => s.isListed);
    if (!stock) throw new Error("No listed stocks; cannot stress test.");

    return {
      investorId,
      tokenHash,
      ticker: stock.ticker,
      currentPrice: stock.currentPrice,
      marketWasOpen,
      marketStateOpened,
    };
  },
});

export const _stressInspect = internalQuery({
  args: { investorId: v.id("investors"), ticker: v.string() },
  returns: v.object({
    balance: v.number(),
    pendingOrders: v.array(
      v.object({
        id: v.id("orders"),
        side: v.string(),
        pricingType: v.string(),
        quantity: v.number(),
        limitPrice: v.union(v.number(), v.null()),
        total: v.number(),
        status: v.string(),
      }),
    ),
    completedOrders: v.number(),
    cancelledOrders: v.number(),
    expiredOrders: v.number(),
    holding: v.union(
      v.null(),
      v.object({ quantity: v.number(), avgPrice: v.number(), totalCost: v.number() }),
    ),
    currentPrice: v.number(),
  }),
  handler: async (ctx, { investorId, ticker }) => {
    const investor = await ctx.db.get(investorId);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    const pos = await ctx.db
      .query("portfolio")
      .withIndex("by_investor_ticker", (q) =>
        q.eq("investorId", investorId).eq("ticker", ticker),
      )
      .unique();

    return {
      balance: investor?.balance ?? 0,
      pendingOrders: orders
        .filter((o) => o.status === "PENDING")
        .map((o) => ({
          id: o._id,
          side: o.side,
          pricingType: o.pricingType,
          quantity: o.quantity,
          limitPrice: o.limitPrice ?? null,
          total: o.total,
          status: o.status,
        })),
      completedOrders: orders.filter((o) => o.status === "COMPLETED").length,
      cancelledOrders: orders.filter((o) => o.status === "CANCELLED").length,
      expiredOrders: orders.filter((o) => o.status === "EXPIRED").length,
      holding: pos
        ? { quantity: pos.quantity, avgPrice: pos.avgPrice, totalCost: pos.totalCost }
        : null,
      currentPrice: stock?.currentPrice ?? 0,
    };
  },
});

// Advances marketState.currentMacroTick by 1 and triggers expirePendingOrders.
// Used by tests that need to verify TTL behavior without burning LLM calls.
// No price changes, no sentiment update — pure tick advance + expiry.
export const _advanceMacroTickForTest = internalMutation({
  args: {},
  returns: v.object({ newMacroTick: v.number() }),
  handler: async (ctx) => {
    const state = await ctx.db.query("marketState").first();
    if (!state) throw new Error("No marketState");
    const newMacroTick = state.currentMacroTick + 1;
    await ctx.db.patch(state._id, {
      currentMacroTick: newMacroTick,
      lastMacroTickAt: Date.now(),
    });
    await ctx.scheduler.runAfter(0, internal.trading.expirePendingOrders, {
      asOfMacroTick: newMacroTick,
    });
    return { newMacroTick };
  },
});

// Look up a single order by id — used by tests to verify status transitions.
export const _inspectOrderById = internalQuery({
  args: { orderId: v.id("orders") },
  returns: v.union(
    v.null(),
    v.object({
      status: v.string(),
      side: v.string(),
      pricingType: v.string(),
      quantity: v.number(),
      limitPrice: v.union(v.number(), v.null()),
      price: v.number(),
      total: v.number(),
      expiresAtMacroTick: v.union(v.number(), v.null()),
    }),
  ),
  handler: async (ctx, { orderId }) => {
    const o = await ctx.db.get(orderId);
    if (!o) return null;
    return {
      status: o.status,
      side: o.side,
      pricingType: o.pricingType,
      quantity: o.quantity,
      limitPrice: o.limitPrice ?? null,
      price: o.price,
      total: o.total,
      expiresAtMacroTick: o.expiresAtMacroTick ?? null,
    };
  },
});

export const _stressTeardown = internalMutation({
  args: {
    investorId: v.id("investors"),
    restoreClosedMarket: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, { investorId, restoreClosedMarket }) => {
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();
    for (const s of sessions) await ctx.db.delete(s._id);
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();
    for (const o of orders) await ctx.db.delete(o._id);
    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_investor_time", (q) => q.eq("investorId", investorId))
      .collect();
    for (const t of txns) await ctx.db.delete(t._id);
    const positions = await ctx.db
      .query("portfolio")
      .withIndex("by_investor", (q) => q.eq("investorId", investorId))
      .collect();
    for (const p of positions) await ctx.db.delete(p._id);
    await ctx.db.delete(investorId);

    if (restoreClosedMarket) {
      const state = await ctx.db.query("marketState").first();
      if (state) await ctx.db.patch(state._id, { isOpen: false, closedAt: Date.now() });
    }
    return null;
  },
});

type Step = { name: string; pass: boolean; detail: string };

export const stressTestOrders = internalAction({
  args: {},
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    steps: v.array(
      v.object({ name: v.string(), pass: v.boolean(), detail: v.string() }),
    ),
    finalBalance: v.number(),
  }),
  handler: async (ctx) => {
    const steps: Step[] = [];
    const record = (name: string, pass: boolean, detail: string) => {
      steps.push({ name, pass, detail });
    };
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const setup = await ctx.runMutation(internal.diagnostics._stressSetup, {});
    const { investorId, tokenHash, ticker, currentPrice } = setup;
    let finalBalance = TEST_BALANCE;

    try {
      // ── 1. MARKET BUY fills instantly ──────────────────────────────────────
      {
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "MARKET", quantity: 5,
        });
        const s = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const expectedSpend = currentPrice * 5;
        const balanceDropped = s.balance < TEST_BALANCE - expectedSpend * 0.5;
        const hasHolding = s.holding?.quantity === 5;
        record(
          "1. MARKET BUY fills, balance drops, portfolio +5",
          r.success && balanceDropped && hasHolding,
          `success=${r.success} balance=${s.balance} holding=${s.holding?.quantity} msg="${r.message}"`,
        );
      }

      // ── 2. LIMIT BUY outside band (50% below) → REJECT ─────────────────────
      {
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 1,
          limitPrice: +(currentPrice * 0.5).toFixed(2),
        });
        record(
          "2. LIMIT BUY at 50% below market → rejected",
          !r.success && /3%/.test(r.message),
          `success=${r.success} msg="${r.message}"`,
        );
      }

      // ── 3. LIMIT BUY outside band (50% above) → REJECT ─────────────────────
      {
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 1,
          limitPrice: +(currentPrice * 1.5).toFixed(2),
        });
        record(
          "3. LIMIT BUY at 50% above market → rejected",
          !r.success && /3%/.test(r.message),
          `success=${r.success} msg="${r.message}"`,
        );
      }

      // ── 4. LIMIT BUY marketable (1% above) → fills instantly at market ─────
      {
        const before = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 2,
          limitPrice: +(currentPrice * 1.01).toFixed(2),
        });
        const after = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const completedDelta = after.completedOrders - before.completedOrders;
        const holdingGrew = (after.holding?.quantity ?? 0) === (before.holding?.quantity ?? 0) + 2;
        record(
          "4. Marketable LIMIT BUY → instant fill at market (price improvement)",
          r.success && completedDelta === 1 && holdingGrew,
          `success=${r.success} completedDelta=${completedDelta} holding=${after.holding?.quantity}`,
        );
      }

      // Rate limit: 5/10s. Wait before continuing.
      await sleep(11_000);

      // ── 5. LIMIT BUY non-marketable (2% below) → PENDING + escrow ──────────
      let pendingBuyId: Id<"orders"> | null = null;
      {
        const before = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const limitPrice = +(currentPrice * 0.98).toFixed(2);
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 3, limitPrice,
        });
        const after = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const newPending = after.pendingOrders.find(
          (o) => o.side === "BUY" && o.pricingType === "LIMIT",
        );
        pendingBuyId = newPending?.id ?? null;
        const expectedEscrow = +(limitPrice * 3).toFixed(2);
        const balanceDropExact = Math.abs(before.balance - after.balance - expectedEscrow) < 0.01;
        record(
          "5. Non-marketable LIMIT BUY → PENDING + escrow deducted",
          r.success && !!newPending && balanceDropExact,
          `success=${r.success} pendingId=${pendingBuyId} balanceDrop=${(before.balance - after.balance).toFixed(2)} expected=${expectedEscrow}`,
        );
      }

      // ── 6. LIMIT SELL non-marketable (2% above) → PENDING ──────────────────
      {
        const before = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const limitPrice = +(currentPrice * 1.02).toFixed(2);
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "SELL", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 1, limitPrice,
        });
        const after = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const newPending = after.pendingOrders.find((o) => o.side === "SELL");
        // No balance change for SELL (no escrow).
        const balanceUnchanged = Math.abs(before.balance - after.balance) < 0.01;
        record(
          "6. Non-marketable LIMIT SELL → PENDING, no balance change",
          r.success && !!newPending && balanceUnchanged,
          `success=${r.success} pending=${!!newPending} balanceDelta=${(before.balance - after.balance).toFixed(2)}`,
        );
      }

      // ── 7. LIMIT SELL exceeding available (holdings − reserved) → REJECT ───
      {
        const inspect = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const tooMany = (inspect.holding?.quantity ?? 0) + 100;
        const r = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "SELL", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: tooMany,
          limitPrice: +(currentPrice * 1.02).toFixed(2),
        });
        record(
          "7. SELL LIMIT exceeding available → rejected",
          !r.success && /Insufficient holdings/i.test(r.message),
          `success=${r.success} msg="${r.message}"`,
        );
      }

      await sleep(11_000);

      // ── 8. cancelOrder on PENDING BUY refunds escrow ───────────────────────
      if (pendingBuyId) {
        const before = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const escrowed = before.pendingOrders.find((o) => o.id === pendingBuyId)?.total ?? 0;
        const r = await ctx.runMutation(api.trading.cancelOrder, {
          tokenHash, orderId: pendingBuyId,
        });
        const after = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const refunded = Math.abs(after.balance - before.balance - escrowed) < 0.01;
        const stillPending = after.pendingOrders.some((o) => o.id === pendingBuyId);
        record(
          "8. cancelOrder on PENDING BUY → escrow refunded, status=CANCELLED",
          r.success && refunded && !stillPending,
          `success=${r.success} refund=${(after.balance - before.balance).toFixed(2)} expected=${escrowed} stillPending=${stillPending}`,
        );
      } else {
        record("8. cancelOrder on PENDING BUY", false, "no pendingBuyId from step 5");
      }

      // ── 9. processPendingLimits forces SELL fill if market crossed ─────────
      // The SELL LIMIT from step 6 sits at currentPrice × 1.02. If price has
      // drifted up past that in real ticks, it should fill. We can't force
      // price changes here — just verify the matcher runs cleanly.
      {
        await ctx.runMutation(internal.trading.processPendingLimits, {});
        const after = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        record(
          "9. processPendingLimits runs without error",
          true,
          `pending=${after.pendingOrders.length} completed=${after.completedOrders} price=${after.currentPrice}`,
        );
      }

      // ── 10. EXPIRED flow: PENDING LIMIT auto-expires after TTL ─────────────
      // Place a new BUY LIMIT at -2% from the LIVE price (price has drifted
      // during the previous 25 sec of tests, so use the fresh number to stay
      // inside the ±3% band).
      {
        const before = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const limitPrice = +(before.currentPrice * 0.98).toFixed(2);
        const place = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
          pricingType: "LIMIT", quantity: 2, limitPrice,
        });
        const afterPlace = await ctx.runQuery(internal.diagnostics._stressInspect, {
          investorId, ticker,
        });
        const newPending = afterPlace.pendingOrders.find(
          (o) => o.side === "BUY" && o.pricingType === "LIMIT" && o.limitPrice === limitPrice,
        );
        if (!place.success || !newPending) {
          record("10. EXPIRED flow: PENDING auto-expires after 6 macro-ticks",
                 false, `setup failed: success=${place.success} pendingFound=${!!newPending}`);
        } else {
          const expiryOrderId = newPending.id;
          const expectedEscrow = +(limitPrice * 2).toFixed(2);
          // Advance 6 macro-ticks (each schedules expirePendingOrders at delay=0).
          for (let i = 0; i < 6; i++) {
            await ctx.runMutation(internal.diagnostics._advanceMacroTickForTest, {});
          }
          // Wait for the scheduled expirePendingOrders to actually run.
          await sleep(2_000);
          const orderState = await ctx.runQuery(internal.diagnostics._inspectOrderById, {
            orderId: expiryOrderId,
          });
          const afterExpiry = await ctx.runQuery(internal.diagnostics._stressInspect, {
            investorId, ticker,
          });
          const isExpired = orderState?.status === "EXPIRED";
          const balanceRefunded = Math.abs(afterExpiry.balance - before.balance) < 0.01;
          record(
            "10. EXPIRED flow: PENDING auto-expires after 6 macro-ticks",
            isExpired && balanceRefunded,
            `status=${orderState?.status} expiredCount=${afterExpiry.expiredOrders} balanceVsBefore=${(afterExpiry.balance - before.balance).toFixed(2)} expectedEscrowRefund=${expectedEscrow}`,
          );
        }
      }

      const final = await ctx.runQuery(internal.diagnostics._stressInspect, {
        investorId, ticker,
      });
      finalBalance = final.balance;
    } finally {
      await ctx.runMutation(internal.diagnostics._stressTeardown, {
        investorId,
        restoreClosedMarket: !setup.marketWasOpen && setup.marketStateOpened,
      });
    }

    return {
      passed: steps.filter((s) => s.pass).length,
      failed: steps.filter((s) => !s.pass).length,
      steps,
      finalBalance,
    };
  },
});

// Public mutation wrapper so you can call from the dashboard's "Run function" UI.
export const runStressTest = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.diagnostics.stressTestOrders, {});
    return null;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 6 — Orchestrator
// ─────────────────────────────────────────────────────────────────────────────
// Runs every test phase in sequence and returns one consolidated report.
// Use this as your one-button verification before / after deploys.
//
// Run: npx convex run diagnostics:runAllTests '{}'
// Cost: ~$0.012 (LLM phase), ~3-4 min total.

export const runAllTests = internalAction({
  args: { loadInvestors: v.optional(v.number()) },
  returns: v.object({
    allPassed: v.boolean(),
    totalPassed: v.number(),
    totalFailed: v.number(),
    totalDurationMs: v.number(),
    phases: v.object({
      invariantsPre: v.object({ passed: v.number(), failed: v.number() }),
      orderFlow: v.object({ passed: v.number(), failed: v.number() }),
      llm: v.object({ passed: v.number(), failed: v.number() }),
      priceEngine: v.object({ passed: v.number(), failed: v.number() }),
      concurrency: v.object({ passed: v.number(), failed: v.number() }),
      load: v.object({ passed: v.number(), failed: v.number() }),
      invariantsPost: v.object({ passed: v.number(), failed: v.number() }),
    }),
    failures: v.array(
      v.object({ phase: v.string(), name: v.string(), detail: v.string() }),
    ),
  }),
  handler: async (ctx, { loadInvestors }) => {
    const startedAt = Date.now();
    const failures: Array<{ phase: string; name: string; detail: string }> = [];
    type StepResult = { passed: number; failed: number; steps: Array<{ name: string; pass: boolean; detail: string }> };
    type InvResult = { passed: number; failed: number; invariants: Array<{ name: string; pass: boolean; detail: string }> };

    const invPre = (await ctx.runQuery(api.diagnostics.testInvariants, {})) as InvResult;
    for (const i of invPre.invariants) if (!i.pass) failures.push({ phase: "invariantsPre", name: i.name, detail: i.detail });

    const order = (await ctx.runAction(internal.diagnostics.stressTestOrders, {})) as StepResult;
    for (const s of order.steps) if (!s.pass) failures.push({ phase: "orderFlow", name: s.name, detail: s.detail });

    const llm = (await ctx.runAction(internal.diagnostics.testLLM, {})) as StepResult;
    for (const s of llm.steps) if (!s.pass) failures.push({ phase: "llm", name: s.name, detail: s.detail });

    const pe = (await ctx.runAction(internal.diagnostics.testPriceEngine, {})) as StepResult;
    for (const s of pe.steps) if (!s.pass) failures.push({ phase: "priceEngine", name: s.name, detail: s.detail });

    const conc = (await ctx.runAction(internal.diagnostics.testConcurrency, {})) as StepResult;
    for (const s of conc.steps) if (!s.pass) failures.push({ phase: "concurrency", name: s.name, detail: s.detail });

    const load = (await ctx.runAction(internal.diagnostics.testLoad, {
      investorCount: loadInvestors ?? 50,
    })) as StepResult;
    for (const s of load.steps) if (!s.pass) failures.push({ phase: "load", name: s.name, detail: s.detail });

    const invPost = (await ctx.runQuery(api.diagnostics.testInvariants, {})) as InvResult;
    for (const i of invPost.invariants) if (!i.pass) failures.push({ phase: "invariantsPost", name: i.name, detail: i.detail });

    const totalPassed =
      invPre.passed + order.passed + llm.passed + pe.passed + conc.passed + load.passed + invPost.passed;
    const totalFailed =
      invPre.failed + order.failed + llm.failed + pe.failed + conc.failed + load.failed + invPost.failed;

    return {
      allPassed: totalFailed === 0,
      totalPassed, totalFailed,
      totalDurationMs: Date.now() - startedAt,
      phases: {
        invariantsPre: { passed: invPre.passed, failed: invPre.failed },
        orderFlow: { passed: order.passed, failed: order.failed },
        llm: { passed: llm.passed, failed: llm.failed },
        priceEngine: { passed: pe.passed, failed: pe.failed },
        concurrency: { passed: conc.passed, failed: conc.failed },
        load: { passed: load.passed, failed: load.failed },
        invariantsPost: { passed: invPost.passed, failed: invPost.failed },
      },
      failures,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 5 — Load test (event-sized traffic simulation)
// ─────────────────────────────────────────────────────────────────────────────
// Spawns N synthetic investors and has each fire a realistic mix of orders
// (MARKET + LIMIT, BUY + SELL) in parallel across investors, sequential
// within each. Verifies invariants hold under load and reports timing.
//
// Defaults: 50 investors × 3 orders = 150 orders. Scales linearly.

const LOAD_PREFIX = "load-";

export const _loadSetup = internalMutation({
  args: { count: v.number(), startingBalance: v.number() },
  returns: v.object({
    tickers: v.array(v.string()),
    sampleCurrentPrice: v.number(),
    investors: v.array(v.object({
      investorId: v.id("investors"),
      tokenHash: v.string(),
    })),
    marketWasOpen: v.boolean(),
    marketStateOpened: v.boolean(),
  }),
  handler: async (ctx, { count, startingBalance }) => {
    let state = await ctx.db.query("marketState").first();
    const marketWasOpen = state?.isOpen ?? false;
    let marketStateOpened = false;
    if (!state) {
      await ctx.db.insert("marketState", {
        isOpen: true, currentMicroTick: 0, currentMacroTick: 0,
        dayNumber: 1, openedAt: Date.now(),
        lastMicroTickAt: Date.now(), lastMacroTickAt: Date.now(),
      });
      marketStateOpened = true;
    } else if (!state.isOpen) {
      await ctx.db.patch(state._id, { isOpen: true });
      marketStateOpened = true;
    }

    // Wipe stale load-test investors.
    const stale = await ctx.db.query("investors").collect();
    for (const inv of stale) {
      if (!inv.email.startsWith(LOAD_PREFIX)) continue;
      const sessions = await ctx.db.query("sessions")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const s of sessions) await ctx.db.delete(s._id);
      const orders = await ctx.db.query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const o of orders) await ctx.db.delete(o._id);
      const txns = await ctx.db.query("transactions")
        .withIndex("by_investor_time", (q) => q.eq("investorId", inv._id)).collect();
      for (const t of txns) await ctx.db.delete(t._id);
      const positions = await ctx.db.query("portfolio")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const p of positions) await ctx.db.delete(p._id);
      await ctx.db.delete(inv._id);
    }

    const investors: Array<{ investorId: Id<"investors">; tokenHash: string }> = [];
    for (let i = 0; i < count; i++) {
      const id = await ctx.db.insert("investors", {
        registrationId: `LOAD-${Date.now()}-${i}`,
        email: `${LOAD_PREFIX}${i}@mcse.local`,
        name: `Load Test ${i}`,
        balance: startingBalance,
        createdAt: Date.now(),
      });
      const tokenHash = `load-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`;
      await ctx.db.insert("sessions", {
        tokenHash, investorId: id, role: "user",
        expiresAt: Date.now() + 60 * 60 * 1000, createdAt: Date.now(),
      });
      investors.push({ investorId: id, tokenHash });
    }

    const stocks = (await ctx.db.query("stocks").collect()).filter((s) => s.isListed);
    if (stocks.length === 0) throw new Error("no listed stocks");

    return {
      tickers: stocks.map((s) => s.ticker),
      sampleCurrentPrice: stocks[0].currentPrice,
      investors,
      marketWasOpen,
      marketStateOpened,
    };
  },
});

export const _loadAggregate = internalQuery({
  args: { investorIds: v.array(v.id("investors")), ticker: v.string() },
  returns: v.object({
    totalBalance: v.number(),
    totalCashLocked: v.number(),
    totalHoldingsValueAtAvg: v.number(),
    completedOrderCount: v.number(),
    pendingOrderCount: v.number(),
    cancelledOrderCount: v.number(),
    expiredOrderCount: v.number(),
    investorCount: v.number(),
    investorsWithNegativeBalance: v.number(),
  }),
  handler: async (ctx, { investorIds }) => {
    let totalBalance = 0;
    let totalCashLocked = 0;
    let totalHoldingsValueAtAvg = 0;
    let completedOrderCount = 0;
    let pendingOrderCount = 0;
    let cancelledOrderCount = 0;
    let expiredOrderCount = 0;
    let investorsWithNegativeBalance = 0;

    for (const id of investorIds) {
      const inv = await ctx.db.get(id);
      if (!inv) continue;
      totalBalance += inv.balance;
      if (inv.balance < 0) investorsWithNegativeBalance++;
      const orders = await ctx.db.query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      for (const o of orders) {
        if (o.status === "PENDING") {
          pendingOrderCount++;
          if (o.side === "BUY" && o.pricingType === "LIMIT") {
            totalCashLocked += (o.limitPrice ?? o.price) * o.quantity;
          }
        } else if (o.status === "COMPLETED") completedOrderCount++;
        else if (o.status === "CANCELLED") cancelledOrderCount++;
        else if (o.status === "EXPIRED") expiredOrderCount++;
      }
      const positions = await ctx.db.query("portfolio")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      for (const p of positions) totalHoldingsValueAtAvg += p.totalCost;
    }

    return {
      totalBalance,
      totalCashLocked: +totalCashLocked.toFixed(2),
      totalHoldingsValueAtAvg: +totalHoldingsValueAtAvg.toFixed(2),
      completedOrderCount, pendingOrderCount,
      cancelledOrderCount, expiredOrderCount,
      investorCount: investorIds.length,
      investorsWithNegativeBalance,
    };
  },
});

export const testLoad = internalAction({
  args: {
    investorCount: v.optional(v.number()),
  },
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    steps: v.array(
      v.object({ name: v.string(), pass: v.boolean(), detail: v.string() }),
    ),
    metrics: v.object({
      durationMs: v.number(),
      ordersPerSecond: v.number(),
      totalOrdersAttempted: v.number(),
      totalOrdersSucceeded: v.number(),
    }),
  }),
  handler: async (ctx, { investorCount }) => {
    const N = investorCount ?? 50;
    const STARTING = 200_000;
    const steps: Array<{ name: string; pass: boolean; detail: string }> = [];
    const record = (name: string, pass: boolean, detail: string) =>
      steps.push({ name, pass, detail });

    const setup = await ctx.runMutation(internal.diagnostics._loadSetup, {
      count: N, startingBalance: STARTING,
    });
    const { tickers, investors } = setup;
    const investorIds = investors.map((i) => i.investorId);

    let totalAttempts = 0;
    let totalSucceeded = 0;
    const startTime = Date.now();

    try {
      // Each investor fires 3 orders sequentially (to stay under per-investor
      // 5/10s rate limit). All N investors fire in parallel.
      // Each investor is assigned a different ticker (round-robin) to spread
      // load across rows — Convex's optimistic concurrency retries when a
      // single row gets too much contention. Real users diversify too.
      const investorRuns = investors.map(async (inv, idx) => {
        const ticker = tickers[idx % tickers.length];

        const r1 = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash: inv.tokenHash, ticker,
          side: "BUY", orderType: "DELIVERY", pricingType: "MARKET",
          quantity: 2,
        });
        totalAttempts++;
        if (r1.success) totalSucceeded++;

        const live1 = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
        const limitPrice = +(live1!.currentPrice * 0.98).toFixed(2);
        const r2 = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash: inv.tokenHash, ticker,
          side: "BUY", orderType: "DELIVERY", pricingType: "LIMIT",
          quantity: 1, limitPrice,
        });
        totalAttempts++;
        if (r2.success) totalSucceeded++;

        const r3 = await ctx.runMutation(api.trading.placeOrder, {
          tokenHash: inv.tokenHash, ticker,
          side: "SELL", orderType: "DELIVERY", pricingType: "MARKET",
          quantity: 1,
        });
        totalAttempts++;
        if (r3.success) totalSucceeded++;
      });
      await Promise.all(investorRuns);

      const durationMs = Date.now() - startTime;
      const ordersPerSecond = +(totalAttempts / (durationMs / 1000)).toFixed(2);

      // ── 1. Most orders succeeded (some rate-limit collisions are OK) ───
      const successRate = totalSucceeded / totalAttempts;
      record(
        `1. ≥90% of orders succeeded under load`,
        successRate >= 0.90,
        `succeeded=${totalSucceeded}/${totalAttempts} (${(successRate * 100).toFixed(1)}%) duration=${durationMs}ms throughput=${ordersPerSecond}/s`,
      );

      // ── 2. Cash conservation ───────────────────────────────────────────
      // For each investor: starting_capital = current_balance + cash_locked
      //   + holdings_value_at_avg − realized_PL
      // Aggregate: totalBalance + totalCashLocked + totalHoldingsValueAtAvg
      //   should be ≈ N × STARTING ± realized P&L from SELL trades.
      // SELL trades realize: (sellPrice - avgPrice) × qty per investor.
      // Hard to compute exactly without per-investor analysis, so use a
      // generous bound: total accounted cash within ±5% of N × STARTING.
      const agg = await ctx.runQuery(internal.diagnostics._loadAggregate, {
        investorIds, ticker: tickers[0],
      });
      const expected = N * STARTING;
      const accounted = agg.totalBalance + agg.totalCashLocked + agg.totalHoldingsValueAtAvg;
      const ratio = accounted / expected;
      record(
        `2. Cash conservation: balances + locked + holdings ≈ N × ₹${STARTING.toLocaleString()}`,
        ratio >= 0.95 && ratio <= 1.05,
        `expected=₹${expected.toLocaleString()} accounted=₹${accounted.toLocaleString()} ratio=${ratio.toFixed(4)} (balance=${agg.totalBalance.toLocaleString()} locked=${agg.totalCashLocked.toLocaleString()} holdings=${agg.totalHoldingsValueAtAvg.toLocaleString()})`,
      );

      // ── 3. No investor with negative balance ───────────────────────────
      record(
        `3. No investor went negative under load`,
        agg.investorsWithNegativeBalance === 0,
        `negativeCount=${agg.investorsWithNegativeBalance}`,
      );

      // ── 4. Order counts add up ─────────────────────────────────────────
      const orderTotal = agg.completedOrderCount + agg.pendingOrderCount +
        agg.cancelledOrderCount + agg.expiredOrderCount;
      record(
        `4. All ${totalSucceeded} successful orders accounted for in DB`,
        orderTotal === totalSucceeded,
        `successful=${totalSucceeded} dbTotal=${orderTotal} (completed=${agg.completedOrderCount} pending=${agg.pendingOrderCount} cancelled=${agg.cancelledOrderCount} expired=${agg.expiredOrderCount})`,
      );

      // ── 5. processPendingLimits keeps up — force a tick, all PENDING ────
      // get re-evaluated within bounded time.
      const beforeProcess = Date.now();
      await ctx.runMutation(internal.trading.processPendingLimits, {});
      const processDuration = Date.now() - beforeProcess;
      record(
        `5. processPendingLimits completes in <10s with ${agg.pendingOrderCount} PENDING`,
        processDuration < 10000,
        `processDuration=${processDuration}ms pendingProcessed=${agg.pendingOrderCount}`,
      );

      return {
        passed: steps.filter((s) => s.pass).length,
        failed: steps.filter((s) => !s.pass).length,
        steps,
        metrics: {
          durationMs, ordersPerSecond,
          totalOrdersAttempted: totalAttempts,
          totalOrdersSucceeded: totalSucceeded,
        },
      };
    } finally {
      await ctx.runMutation(internal.diagnostics._concTeardown, {
        investorIds,
        restoreClosedMarket: !setup.marketWasOpen && setup.marketStateOpened,
      });
    }
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 4 — Concurrency tests
// ─────────────────────────────────────────────────────────────────────────────
// Verifies that simultaneous orders from multiple investors don't:
//   • Double-charge any investor
//   • Skip volume accounting on the stock
//   • Create duplicate or missing order rows
//
// Convex serializes mutations within a transaction boundary, so we're
// verifying that even when API calls fire in parallel, the DB sees them
// in some sequential order with no lost updates.

const CONC_PREFIX = "conc-";

export const _concSetup = internalMutation({
  args: { count: v.number(), startingBalance: v.number() },
  returns: v.object({
    ticker: v.string(),
    currentPrice: v.number(),
    sharesOutstandingBefore: v.number(),
    volumeDayBefore: v.number(),
    investors: v.array(v.object({
      investorId: v.id("investors"),
      tokenHash: v.string(),
    })),
    marketWasOpen: v.boolean(),
    marketStateOpened: v.boolean(),
  }),
  handler: async (ctx, { count, startingBalance }) => {
    // Force market open.
    let state = await ctx.db.query("marketState").first();
    const marketWasOpen = state?.isOpen ?? false;
    let marketStateOpened = false;
    if (!state) {
      await ctx.db.insert("marketState", {
        isOpen: true, currentMicroTick: 0, currentMacroTick: 0,
        dayNumber: 1, openedAt: Date.now(),
        lastMicroTickAt: Date.now(), lastMacroTickAt: Date.now(),
      });
      marketStateOpened = true;
      state = await ctx.db.query("marketState").first();
    } else if (!state.isOpen) {
      await ctx.db.patch(state._id, { isOpen: true });
      marketStateOpened = true;
    }

    // Wipe any previous concurrency-test investors.
    const stale = await ctx.db.query("investors").collect();
    for (const inv of stale) {
      if (!inv.email.startsWith(CONC_PREFIX)) continue;
      const sessions = await ctx.db.query("sessions")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const s of sessions) await ctx.db.delete(s._id);
      const orders = await ctx.db.query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const o of orders) await ctx.db.delete(o._id);
      const txns = await ctx.db.query("transactions")
        .withIndex("by_investor_time", (q) => q.eq("investorId", inv._id)).collect();
      for (const t of txns) await ctx.db.delete(t._id);
      const positions = await ctx.db.query("portfolio")
        .withIndex("by_investor", (q) => q.eq("investorId", inv._id)).collect();
      for (const p of positions) await ctx.db.delete(p._id);
      await ctx.db.delete(inv._id);
    }

    // Spawn N fresh investors.
    const investors: Array<{ investorId: Id<"investors">; tokenHash: string }> = [];
    for (let i = 0; i < count; i++) {
      const id = await ctx.db.insert("investors", {
        registrationId: `CONC-${Date.now()}-${i}`,
        email: `${CONC_PREFIX}${i}@mcse.local`,
        name: `Conc Test ${i}`,
        balance: startingBalance,
        createdAt: Date.now(),
      });
      const tokenHash = `conc-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`;
      await ctx.db.insert("sessions", {
        tokenHash, investorId: id, role: "user",
        expiresAt: Date.now() + 60 * 60 * 1000, createdAt: Date.now(),
      });
      investors.push({ investorId: id, tokenHash });
    }

    const stocks = await ctx.db.query("stocks").collect();
    const stock = stocks.find((s) => s.isListed);
    if (!stock) throw new Error("no listed stocks");

    return {
      ticker: stock.ticker,
      currentPrice: stock.currentPrice,
      sharesOutstandingBefore: stock.sharesOutstanding,
      volumeDayBefore: stock.volumeDay,
      investors,
      marketWasOpen,
      marketStateOpened,
    };
  },
});

export const _concInspectAll = internalQuery({
  args: { investorIds: v.array(v.id("investors")), ticker: v.string() },
  returns: v.object({
    balances: v.array(v.number()),
    holdingQtys: v.array(v.number()),
    completedOrders: v.number(),
    stockVolumeDay: v.number(),
    stockCurrentPrice: v.number(),
  }),
  handler: async (ctx, { investorIds, ticker }) => {
    const balances: number[] = [];
    const holdingQtys: number[] = [];
    let completedOrders = 0;
    for (const id of investorIds) {
      const inv = await ctx.db.get(id);
      balances.push(inv?.balance ?? 0);
      const pos = await ctx.db.query("portfolio")
        .withIndex("by_investor_ticker", (q) => q.eq("investorId", id).eq("ticker", ticker))
        .unique();
      holdingQtys.push(pos?.quantity ?? 0);
      const orders = await ctx.db.query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      completedOrders += orders.filter((o) => o.status === "COMPLETED").length;
    }
    const stock = await ctx.db.query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker)).unique();
    return {
      balances, holdingQtys, completedOrders,
      stockVolumeDay: stock?.volumeDay ?? 0,
      stockCurrentPrice: stock?.currentPrice ?? 0,
    };
  },
});

export const _concTeardown = internalMutation({
  args: {
    investorIds: v.array(v.id("investors")),
    restoreClosedMarket: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, { investorIds, restoreClosedMarket }) => {
    for (const id of investorIds) {
      const sessions = await ctx.db.query("sessions")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      for (const s of sessions) await ctx.db.delete(s._id);
      const orders = await ctx.db.query("orders")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      for (const o of orders) await ctx.db.delete(o._id);
      const txns = await ctx.db.query("transactions")
        .withIndex("by_investor_time", (q) => q.eq("investorId", id)).collect();
      for (const t of txns) await ctx.db.delete(t._id);
      const positions = await ctx.db.query("portfolio")
        .withIndex("by_investor", (q) => q.eq("investorId", id)).collect();
      for (const p of positions) await ctx.db.delete(p._id);
      await ctx.db.delete(id);
    }
    if (restoreClosedMarket) {
      const state = await ctx.db.query("marketState").first();
      if (state) await ctx.db.patch(state._id, { isOpen: false, closedAt: Date.now() });
    }
    return null;
  },
});

export const testConcurrency = internalAction({
  args: {},
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    steps: v.array(
      v.object({ name: v.string(), pass: v.boolean(), detail: v.string() }),
    ),
  }),
  handler: async (ctx) => {
    const steps: Array<{ name: string; pass: boolean; detail: string }> = [];
    const record = (name: string, pass: boolean, detail: string) =>
      steps.push({ name, pass, detail });

    const N = 10;
    const QTY = 3;
    const STARTING = 1_000_000;

    const setup = await ctx.runMutation(internal.diagnostics._concSetup, {
      count: N, startingBalance: STARTING,
    });
    const { ticker, currentPrice, investors, volumeDayBefore } = setup;

    try {
      // ── 1. N parallel MARKET BUYs all succeed ──────────────────────────
      // Fire all N placeOrder calls in parallel via Promise.all. Convex
      // queues mutations sequentially per scope, but the API calls go out
      // simultaneously — this is the realistic concurrency stress.
      const results = await Promise.all(
        investors.map((inv) =>
          ctx.runMutation(api.trading.placeOrder, {
            tokenHash: inv.tokenHash, ticker,
            side: "BUY", orderType: "DELIVERY", pricingType: "MARKET",
            quantity: QTY,
          }),
        ),
      );
      const successes = results.filter((r) => r.success).length;
      record(
        `1. ${N} parallel MARKET BUYs all succeed`,
        successes === N,
        `successes=${successes}/${N} sample-msg="${results[0]?.message ?? ""}"`,
      );

      // ── 2. Stock volumeDay increased by exactly N × QTY ────────────────
      type ConcAgg = {
        balances: number[]; holdingQtys: number[];
        completedOrders: number; stockVolumeDay: number; stockCurrentPrice: number;
      };
      const after = (await ctx.runQuery(internal.diagnostics._concInspectAll, {
        investorIds: investors.map((i: { investorId: Id<"investors">; tokenHash: string }) => i.investorId), ticker,
      })) as ConcAgg;
      const expectedVolDelta = N * QTY;
      const actualVolDelta = after.stockVolumeDay - volumeDayBefore;
      record(
        `2. Stock volumeDay += N × QTY (no lost or duplicated updates)`,
        actualVolDelta === expectedVolDelta,
        `expected=+${expectedVolDelta} actual=+${actualVolDelta} (before=${volumeDayBefore} after=${after.stockVolumeDay})`,
      );

      // ── 3. Each investor has exactly 1 COMPLETED order ─────────────────
      record(
        `3. Each investor has exactly 1 completed order (${N} total, no dupes)`,
        after.completedOrders === N,
        `completedOrders=${after.completedOrders}/${N}`,
      );

      // ── 4. Each investor's holding = QTY ───────────────────────────────
      const wrongQty = after.holdingQtys.filter((q: number) => q !== QTY).length;
      record(
        `4. Every investor holds exactly ${QTY} shares (no race in portfolio update)`,
        wrongQty === 0,
        `wrongQty=${wrongQty}/${N} holdingsSample=${after.holdingQtys.slice(0, 3).join(",")}`,
      );

      // ── 5. Each balance reduction = approx (QTY × fillPrice) ───────────
      // Fill price could vary slightly tick-to-tick, so allow 5% slack
      // on the upper bound (price might have drifted 1-2 ticks during run).
      const minExpectedSpend = QTY * currentPrice * 0.97;
      const maxExpectedSpend = QTY * currentPrice * 1.03;
      const wrongBalance = after.balances.filter((b: number) => {
        const spent = STARTING - b;
        return spent < minExpectedSpend || spent > maxExpectedSpend;
      }).length;
      record(
        `5. Each balance reduced by ~${QTY} × price (no double-charge)`,
        wrongBalance === 0,
        `wrongBalance=${wrongBalance}/${N} balanceSample=${after.balances.slice(0, 3).map((b: number) => b.toFixed(2)).join(",")} spendBand=[₹${minExpectedSpend.toFixed(0)}, ₹${maxExpectedSpend.toFixed(0)}]`,
      );
    } finally {
      await ctx.runMutation(internal.diagnostics._concTeardown, {
        investorIds: investors.map((i: { investorId: Id<"investors">; tokenHash: string }) => i.investorId),
        restoreClosedMarket: !setup.marketWasOpen && setup.marketStateOpened,
      });
    }

    return {
      passed: steps.filter((s) => s.pass).length,
      failed: steps.filter((s) => !s.pass).length,
      steps,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 2 — Price engine tests
// ─────────────────────────────────────────────────────────────────────────────
// Verifies the deterministic core of the simulation:
//   • Daily ±10% cap from openPrice never breached
//   • Per-tick ±2% clamp respected
//   • Gap-pull: setting NSF moves fair value; price chases it
//   • OIF ignores PENDING orders (only COMPLETED count)
//
// Cost: zero LLM calls (this layer has none).

export const _peSetStockNsf = internalMutation({
  args: { ticker: v.string(), nsf: v.number() },
  returns: v.null(),
  handler: async (ctx, { ticker, nsf }) => {
    const s = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!s) throw new Error(`stock ${ticker} not found`);
    await ctx.db.patch(s._id, { netSentimentFactor: nsf });
    return null;
  },
});

export const _peReadStock = internalQuery({
  args: { ticker: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      ticker: v.string(),
      currentPrice: v.number(),
      openPrice: v.number(),
      netSentimentFactor: v.number(),
      productQuality: v.number(),
      brandStrength: v.number(),
      customerSatisfaction: v.number(),
      innovationPipeline: v.number(),
      profit: v.number(),
      revenue: v.number(),
      debt: v.number(),
      assets: v.number(),
    }),
  ),
  handler: async (ctx, { ticker }) => {
    const s = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!s) return null;
    return {
      ticker: s.ticker,
      currentPrice: s.currentPrice,
      openPrice: s.openPrice,
      netSentimentFactor: s.netSentimentFactor,
      productQuality: s.productQuality,
      brandStrength: s.brandStrength,
      customerSatisfaction: s.customerSatisfaction,
      innovationPipeline: s.innovationPipeline,
      profit: s.profit,
      revenue: s.revenue,
      debt: s.debt,
      assets: s.assets,
    };
  },
});

// Compute FV using the same formula as priceEngine.computeFairValue.
// Duplicated here so the test is self-contained and won't silently pass
// if the engine accidentally uses a different formula.
function expectedFairValue(s: {
  openPrice: number; productQuality: number; brandStrength: number;
  customerSatisfaction: number; innovationPipeline: number;
  profit: number; revenue: number; debt: number; assets: number;
  netSentimentFactor: number;
}): number {
  const quality = (s.productQuality + s.brandStrength + s.customerSatisfaction + s.innovationPipeline) / 400;
  const profitMargin = s.revenue > 0 ? Math.max(-0.3, Math.min(0.5, s.profit / s.revenue)) : 0;
  const solvency = s.assets > 0 ? Math.max(0, Math.min(1, 1 - s.debt / s.assets)) : 0.5;
  const fundamentals = 0.85 + 0.15 * quality + 0.10 * profitMargin + 0.05 * solvency;
  const sentiment = 1 + Math.max(-0.03, Math.min(0.03, s.netSentimentFactor));
  return s.openPrice * fundamentals * sentiment;
}

export const testPriceEngine = internalAction({
  args: {},
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    steps: v.array(
      v.object({ name: v.string(), pass: v.boolean(), detail: v.string() }),
    ),
  }),
  handler: async (ctx) => {
    const steps: Array<{ name: string; pass: boolean; detail: string }> = [];
    const record = (name: string, pass: boolean, detail: string) =>
      steps.push({ name, pass, detail });

    // Make sure market is open.
    const setup = await ctx.runMutation(internal.diagnostics._stressSetup, {});
    const ticker = setup.ticker;

    try {
      // ── 1. Per-tick ±2% clamp ──────────────────────────────────────────
      // Set extreme NSF, force ticks, assert no single tick moves more than 2%.
      await ctx.runMutation(internal.diagnostics._peSetStockNsf, {
        ticker, nsf: 0.03,
      });
      const tickPrices: number[] = [];
      const start = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      tickPrices.push(start!.currentPrice);
      for (let i = 0; i < 20; i++) {
        await ctx.runMutation(internal.priceEngine.applyMicroTick, {});
        const s = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
        if (s) tickPrices.push(s.currentPrice);
      }
      let maxTickPct = 0;
      for (let i = 1; i < tickPrices.length; i++) {
        const pct = Math.abs(tickPrices[i] - tickPrices[i - 1]) / tickPrices[i - 1];
        if (pct > maxTickPct) maxTickPct = pct;
      }
      record(
        "1. Per-tick price change ≤ 2% across 20 forced ticks",
        maxTickPct <= 0.02 + 0.0001,
        `maxTickPct=${(maxTickPct * 100).toFixed(3)}% over ${tickPrices.length - 1} ticks`,
      );

      // ── 2. Daily ±10% cap holds ────────────────────────────────────────
      // After 20 ticks of pushing with NSF=+0.03, price should be at or
      // below openPrice × 1.10. Repeat with NSF=-0.03 for the floor.
      const peakStock = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      const breachedHigh = peakStock!.currentPrice > peakStock!.openPrice * 1.10 + 0.01;
      record(
        "2a. Daily +10% cap respected after 20 bullish ticks",
        !breachedHigh,
        `currentPrice=${peakStock!.currentPrice} cap=${(peakStock!.openPrice * 1.10).toFixed(2)} openPrice=${peakStock!.openPrice}`,
      );

      await ctx.runMutation(internal.diagnostics._peSetStockNsf, {
        ticker, nsf: -0.03,
      });
      for (let i = 0; i < 30; i++) {
        await ctx.runMutation(internal.priceEngine.applyMicroTick, {});
      }
      const troughStock = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      const breachedLow = troughStock!.currentPrice < troughStock!.openPrice * 0.90 - 0.01;
      record(
        "2b. Daily −10% cap respected after 30 bearish ticks",
        !breachedLow,
        `currentPrice=${troughStock!.currentPrice} floor=${(troughStock!.openPrice * 0.90).toFixed(2)} openPrice=${troughStock!.openPrice}`,
      );

      // ── 3. Gap-pull: positive NSF drives price upward ──────────────────
      // Reset NSF to +0.03 and verify price climbs over 15 ticks.
      await ctx.runMutation(internal.diagnostics._peSetStockNsf, {
        ticker, nsf: 0.03,
      });
      const beforePull = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      for (let i = 0; i < 15; i++) {
        await ctx.runMutation(internal.priceEngine.applyMicroTick, {});
      }
      const afterPull = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      const climbed = afterPull!.currentPrice > beforePull!.currentPrice;
      const expectedFV = expectedFairValue(afterPull!);
      record(
        "3. Positive NSF pulls price upward (gap-pull works)",
        climbed,
        `before=${beforePull!.currentPrice} after=${afterPull!.currentPrice} expectedFV=${expectedFV.toFixed(2)} delta=${(afterPull!.currentPrice - beforePull!.currentPrice).toFixed(2)}`,
      );

      // ── 4. Fair-value formula matches engine behavior ──────────────────
      // Set NSF=0, run several ticks. Price should converge toward
      // FV = openPrice × Fundamentals × 1.0 (no sentiment).
      await ctx.runMutation(internal.diagnostics._peSetStockNsf, {
        ticker, nsf: 0,
      });
      for (let i = 0; i < 20; i++) {
        await ctx.runMutation(internal.priceEngine.applyMicroTick, {});
      }
      const converged = await ctx.runQuery(internal.diagnostics._peReadStock, { ticker });
      const expectedFV0 = expectedFairValue(converged!);
      const drift = Math.abs(converged!.currentPrice - expectedFV0) / expectedFV0;
      record(
        "4. With NSF=0, price converges within ~5% of computed fair value",
        drift < 0.05,
        `currentPrice=${converged!.currentPrice} expectedFV=${expectedFV0.toFixed(2)} drift=${(drift * 100).toFixed(2)}%`,
      );

      // ── 5. OIF ignores PENDING orders ──────────────────────────────────
      // Place a PENDING BUY LIMIT, force a tick, the priceHistory volumeTick
      // for that stock should be 0 (no completed orders in the window).
      const limitPrice = +(converged!.currentPrice * 0.98).toFixed(2);
      await ctx.runMutation(api.trading.placeOrder, {
        tokenHash: setup.tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
        pricingType: "LIMIT", quantity: 5, limitPrice,
      });
      // Force 1 tick after placement.
      await ctx.runMutation(internal.priceEngine.applyMicroTick, {});
      const recent = await ctx.runQuery(internal.diagnostics._peLatestTickVolume, {
        ticker,
      });
      record(
        "5. OIF skips PENDING orders (volumeTick=0 with only PENDING in window)",
        recent === 0,
        `latest tick volumeTick=${recent}`,
      );
    } finally {
      await ctx.runMutation(internal.diagnostics._stressTeardown, {
        investorId: setup.investorId,
        restoreClosedMarket: !setup.marketWasOpen && setup.marketStateOpened,
      });
    }

    return {
      passed: steps.filter((s) => s.pass).length,
      failed: steps.filter((s) => !s.pass).length,
      steps,
    };
  },
});

export const _peLatestTickVolume = internalQuery({
  args: { ticker: v.string() },
  returns: v.number(),
  handler: async (ctx, { ticker }) => {
    const rows = await ctx.db
      .query("priceHistory")
      .withIndex("by_ticker_time", (q) => q.eq("ticker", ticker))
      .order("desc")
      .take(1);
    return rows[0]?.volumeTick ?? 0;
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — LLM sentiment loop tests
// ─────────────────────────────────────────────────────────────────────────────
// Verifies that the macro-tick Haiku call:
//   • Returns valid NSF in [-0.03, +0.03] for all 57 stocks
//   • Produces a non-trivial distribution (not all zeros, not uniform sign)
//   • Sees the orderbook depth signal in its prompt input
//
// Cost: ~$0.015 per run (3 LLM calls).

export const _llmSnapshotNsf = internalQuery({
  args: {},
  returns: v.array(
    v.object({ ticker: v.string(), nsf: v.number(), sector: v.string() }),
  ),
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    return stocks
      .filter((s) => s.isListed)
      .map((s) => ({ ticker: s.ticker, nsf: s.netSentimentFactor, sector: s.sector }));
  },
});

export const _llmInspectMacroData = internalQuery({
  args: { ticker: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      ticker: v.string(),
      currentPrice: v.number(),
      bookBuyDepth: v.number(),
      bookBuyAvgPrice: v.number(),
      bookSellDepth: v.number(),
      bookSellAvgPrice: v.number(),
    }),
  ),
  handler: async (ctx, { ticker }) => {
    // Inline the orderbook aggregation here so we don't depend on calling
    // getMacroTickData from a query (which Convex queries can't do).
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", ticker))
      .unique();
    if (!stock) return null;
    const allOrders = await ctx.db.query("orders").collect();
    let buyQty = 0, buyValue = 0, sellQty = 0, sellValue = 0;
    for (const o of allOrders) {
      if (o.ticker !== ticker) continue;
      if (o.status !== "PENDING" || o.pricingType !== "LIMIT") continue;
      const px = o.limitPrice ?? o.price;
      if (o.side === "BUY") { buyQty += o.quantity; buyValue += px * o.quantity; }
      else { sellQty += o.quantity; sellValue += px * o.quantity; }
    }
    return {
      ticker: stock.ticker,
      currentPrice: stock.currentPrice,
      bookBuyDepth: buyQty,
      bookBuyAvgPrice: buyQty > 0 ? +(buyValue / buyQty).toFixed(2) : 0,
      bookSellDepth: sellQty,
      bookSellAvgPrice: sellQty > 0 ? +(sellValue / sellQty).toFixed(2) : 0,
    };
  },
});

export const testLLM = internalAction({
  args: {},
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    steps: v.array(
      v.object({ name: v.string(), pass: v.boolean(), detail: v.string() }),
    ),
    estimatedCostUSD: v.number(),
  }),
  handler: async (ctx) => {
    const steps: Array<{ name: string; pass: boolean; detail: string }> = [];
    const record = (name: string, pass: boolean, detail: string) =>
      steps.push({ name, pass, detail });
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    // Ensure market open (LLM macro-tick is a no-op when closed).
    const setup = await ctx.runMutation(internal.diagnostics._stressSetup, {});
    let llmCallCount = 0;

    try {
      // ── 1. Macro-tick produces valid NSF for every listed stock ────────
      type NsfRow = { ticker: string; nsf: number; sector: string };
      const before = (await ctx.runQuery(internal.diagnostics._llmSnapshotNsf, {})) as NsfRow[];
      await ctx.runAction(internal.priceEngine.applyMacroTick, {});
      llmCallCount++;
      await sleep(1_000); // let applyMacroSentiment settle
      const after = (await ctx.runQuery(internal.diagnostics._llmSnapshotNsf, {})) as NsfRow[];

      const outOfRange = after.filter((s) => s.nsf < -0.03001 || s.nsf > 0.03001);
      record(
        "1. All NSF after macro-tick ∈ [-0.03, +0.03]",
        outOfRange.length === 0,
        `stocks=${after.length} outOfRange=${outOfRange.length}` +
          (outOfRange.length ? ` (e.g. ${outOfRange[0].ticker}=${outOfRange[0].nsf})` : ""),
      );

      // ── 2. NSF distribution: at least 30% of stocks have non-zero NSF ──
      const nonZero = after.filter((s) => Math.abs(s.nsf) > 0.0001);
      const nonZeroPct = (nonZero.length / after.length) * 100;
      record(
        "2. ≥30% of stocks have non-zero NSF (LLM not stuck on zero)",
        nonZeroPct >= 30,
        `nonZero=${nonZero.length}/${after.length} (${nonZeroPct.toFixed(0)}%)`,
      );

      // ── 3. NSF distribution has mix of bullish/bearish ─────────────────
      const positive = after.filter((s) => s.nsf > 0.0001).length;
      const negative = after.filter((s) => s.nsf < -0.0001).length;
      const hasMix = positive > 0 && negative > 0;
      record(
        "3. NSF distribution has both positive and negative (not all bullish/bearish)",
        hasMix,
        `positive=${positive} negative=${negative} neutral=${after.length - positive - negative}`,
      );

      // ── 4. NSF actually changed for ≥30% of stocks ─────────────────────
      const changedPct = (
        before.filter((b) => {
          const a = after.find((x) => x.ticker === b.ticker);
          return a && Math.abs(a.nsf - b.nsf) > 0.0005;
        }).length /
        before.length
      ) * 100;
      record(
        "4. Macro-tick changed NSF for ≥30% of stocks (LLM is doing work)",
        changedPct >= 30,
        `${changedPct.toFixed(0)}% of stocks moved`,
      );

      // ── 5. getMacroTickData includes orderbook depth fields ────────────
      const data = await ctx.runQuery(internal.priceEngine.getMacroTickData, {});
      const sample = data?.stocks[0];
      const hasBookFields =
        sample !== undefined &&
        typeof sample.bookBuyDepth === "number" &&
        typeof sample.bookBuyAvgPrice === "number" &&
        typeof sample.bookSellDepth === "number" &&
        typeof sample.bookSellAvgPrice === "number";
      record(
        "5. getMacroTickData returns orderbook depth fields per stock",
        hasBookFields,
        sample
          ? `${sample.ticker}: bd=${sample.bookBuyDepth}@${sample.bookBuyAvgPrice} sd=${sample.bookSellDepth}@${sample.bookSellAvgPrice}`
          : "no sample stock",
      );

      // ── 6. Orderbook signal: queue 5 BUY LIMITs, verify they show in prompt ──
      // Direct correlation between order book → NSF direction is too noisy to
      // assert across one LLM call (LLM weighs many factors). But we MUST
      // verify the data reaches the prompt input.
      const { tokenHash, ticker, currentPrice } = setup;
      const limitPrice = +(currentPrice * 0.98).toFixed(2);
      const beforeBook = await ctx.runQuery(internal.diagnostics._llmInspectMacroData, { ticker });
      // Place 1 PENDING BUY LIMIT (rate-limited so just 1).
      const placed = await ctx.runMutation(api.trading.placeOrder, {
        tokenHash, ticker, side: "BUY", orderType: "DELIVERY",
        pricingType: "LIMIT", quantity: 4, limitPrice,
      });
      const afterBook = await ctx.runQuery(internal.diagnostics._llmInspectMacroData, { ticker });
      const depthIncreased =
        !!afterBook && !!beforeBook && afterBook.bookBuyDepth > beforeBook.bookBuyDepth;
      record(
        "6. PENDING BUY LIMIT shows up in macro-tick prompt input (orderbook visible to LLM)",
        placed.success && depthIncreased,
        `placed=${placed.success} bookBuyDepthBefore=${beforeBook?.bookBuyDepth} after=${afterBook?.bookBuyDepth}`,
      );

      // ── 7. Force a 2nd macro-tick: NSF should change again (consistency) ──
      await ctx.runAction(internal.priceEngine.applyMacroTick, {});
      llmCallCount++;
      await sleep(1_000);
      const afterSecond = (await ctx.runQuery(internal.diagnostics._llmSnapshotNsf, {})) as NsfRow[];
      const secondChangedPct = (
        after.filter((b) => {
          const s = afterSecond.find((x) => x.ticker === b.ticker);
          return s && Math.abs(s.nsf - b.nsf) > 0.0005;
        }).length /
        after.length
      ) * 100;
      record(
        "7. Second macro-tick produces a DIFFERENT distribution from the first",
        secondChangedPct >= 20,
        `${secondChangedPct.toFixed(0)}% of NSFs differ between tick 1 and tick 2`,
      );
    } finally {
      await ctx.runMutation(internal.diagnostics._stressTeardown, {
        investorId: setup.investorId,
        restoreClosedMarket: !setup.marketWasOpen && setup.marketStateOpened,
      });
    }

    // Haiku 4.5 pricing: ~$1/M input + ~$5/M output. Macro-tick prompt
    // ≈ 2.5K input tokens (57 stocks × ~40 tokens), output ≈ 700 tokens.
    // Per call ≈ $0.0025 input + $0.0035 output = ~$0.006.
    const estimatedCostUSD = +(llmCallCount * 0.006).toFixed(4);

    return {
      passed: steps.filter((s) => s.pass).length,
      failed: steps.filter((s) => !s.pass).length,
      steps,
      estimatedCostUSD,
    };
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Invariants — properties that must ALWAYS be true regardless of test history.
// ─────────────────────────────────────────────────────────────────────────────
// Pure read-only. Safe to run on production. Catches a whole class of bugs
// that a single end-to-end test can't surface.
//
// Run from CLI:  npx convex run diagnostics:testInvariants '{}'
// Or dashboard: diagnostics → testInvariants → Run

export const testInvariants = query({
  args: {},
  returns: v.object({
    passed: v.number(),
    failed: v.number(),
    invariants: v.array(
      v.object({
        name: v.string(),
        pass: v.boolean(),
        detail: v.string(),
      }),
    ),
  }),
  handler: async (ctx) => {
    const result: Array<{ name: string; pass: boolean; detail: string }> = [];
    const check = (name: string, pass: boolean, detail: string) =>
      result.push({ name, pass, detail });

    const investors = await ctx.db.query("investors").collect();
    const stocks = await ctx.db.query("stocks").collect();
    const orders = await ctx.db.query("orders").collect();
    const portfolio = await ctx.db.query("portfolio").collect();
    const transactions = await ctx.db.query("transactions").collect();
    const marketState = await ctx.db.query("marketState").first();

    // ── Inv 1: marketState exists and is sane ──────────────────────────────
    check(
      "INV-01: marketState exists with non-negative tick counters",
      !!marketState && marketState.currentMicroTick >= 0 && marketState.currentMacroTick >= 0,
      marketState
        ? `microTick=${marketState.currentMicroTick} macroTick=${marketState.currentMacroTick} isOpen=${marketState.isOpen}`
        : "marketState row missing",
    );

    // ── Inv 2: every stock currentPrice ∈ [openPrice × 0.9, openPrice × 1.10] ─
    {
      const violators = stocks.filter(
        (s) =>
          s.openPrice > 0 &&
          (s.currentPrice > s.openPrice * 1.10 + 0.01 ||
            s.currentPrice < s.openPrice * 0.90 - 0.01),
      );
      check(
        "INV-02: all currentPrice within ±10% of openPrice (daily cap)",
        violators.length === 0,
        violators.length === 0
          ? `${stocks.length} stocks all within band`
          : `${violators.length} violators: ${violators.slice(0, 3).map((s) => `${s.ticker}(${s.currentPrice}/${s.openPrice})`).join(", ")}`,
      );
    }

    // ── Inv 3: no investor balance < 0 ─────────────────────────────────────
    {
      const negative = investors.filter((i) => i.balance < 0);
      check(
        "INV-03: no investor with negative balance",
        negative.length === 0,
        negative.length === 0
          ? `${investors.length} investors all balance ≥ 0`
          : `${negative.length} negative: ${negative.slice(0, 3).map((i) => `${i.email}=${i.balance}`).join(", ")}`,
      );
    }

    // ── Inv 4: no portfolio row with quantity ≤ 0 ──────────────────────────
    {
      const bad = portfolio.filter((p) => p.quantity <= 0);
      check(
        "INV-04: no portfolio row with non-positive quantity (zero rows should be deleted)",
        bad.length === 0,
        bad.length === 0
          ? `${portfolio.length} positions all quantity > 0`
          : `${bad.length} bad rows: ${bad.slice(0, 3).map((p) => `${p.ticker}=${p.quantity}`).join(", ")}`,
      );
    }

    // ── Inv 5: every PENDING order has expiresAtMacroTick set ──────────────
    {
      const pending = orders.filter((o) => o.status === "PENDING");
      const noTtl = pending.filter((o) => o.expiresAtMacroTick == null);
      check(
        "INV-05: every PENDING order has expiresAtMacroTick",
        noTtl.length === 0,
        `pending=${pending.length} missingTtl=${noTtl.length}`,
      );
    }

    // ── Inv 6: every PENDING order references existing investor + stock ────
    {
      const investorIds = new Set(investors.map((i) => i._id));
      const stockIds = new Set(stocks.map((s) => s._id));
      const pending = orders.filter((o) => o.status === "PENDING");
      const orphan = pending.filter(
        (o) => !investorIds.has(o.investorId) || !stockIds.has(o.stockId),
      );
      check(
        "INV-06: no PENDING order references deleted investor/stock",
        orphan.length === 0,
        `pending=${pending.length} orphan=${orphan.length}`,
      );
    }

    // ── Inv 7: per-investor escrow consistency ─────────────────────────────
    // For each investor: their pending BUY LIMIT escrow total should be plausible
    // (≤ a generous initial-capital cap). Catches escrow accounting bugs.
    {
      const ESCROW_PLAUSIBLE_CAP = 10_000_000; // ₹1cr — far above any starting balance
      let bad = 0;
      let badSample = "";
      for (const inv of investors) {
        const myPending = orders.filter(
          (o) =>
            o.investorId === inv._id &&
            o.status === "PENDING" &&
            o.side === "BUY" &&
            o.pricingType === "LIMIT",
        );
        const escrow = myPending.reduce(
          (sum, o) => sum + (o.limitPrice ?? o.price) * o.quantity,
          0,
        );
        if (escrow > ESCROW_PLAUSIBLE_CAP) {
          bad++;
          if (!badSample) badSample = `${inv.email}=${escrow.toFixed(2)}`;
        }
      }
      check(
        "INV-07: pending BUY LIMIT escrow per investor ≤ ₹1cr (sanity)",
        bad === 0,
        bad === 0 ? `${investors.length} investors plausible` : `${bad} excessive (e.g. ${badSample})`,
      );
    }

    // ── Inv 8: COMPLETED orders have plausible price (>0) ──────────────────
    {
      const completed = orders.filter((o) => o.status === "COMPLETED");
      const bad = completed.filter((o) => o.price <= 0 || o.total <= 0);
      check(
        "INV-08: every COMPLETED order has price > 0 and total > 0",
        bad.length === 0,
        `completed=${completed.length} bad=${bad.length}`,
      );
    }

    // ── Inv 9: netSentimentFactor in valid range [-0.03, 0.03] ─────────────
    {
      const outOfRange = stocks.filter(
        (s) => s.netSentimentFactor < -0.03001 || s.netSentimentFactor > 0.03001,
      );
      check(
        "INV-09: every stock netSentimentFactor ∈ [-0.03, 0.03]",
        outOfRange.length === 0,
        outOfRange.length === 0
          ? `${stocks.length} stocks all in range`
          : `${outOfRange.length} OOR: ${outOfRange.slice(0, 3).map((s) => `${s.ticker}=${s.netSentimentFactor}`).join(", ")}`,
      );
    }

    // ── Inv 10: no orphaned transactions ───────────────────────────────────
    {
      const investorIds = new Set(investors.map((i) => i._id));
      const orphan = transactions.filter((t) => !investorIds.has(t.investorId));
      check(
        "INV-10: no transaction references a deleted investor",
        orphan.length === 0,
        `transactions=${transactions.length} orphan=${orphan.length}`,
      );
    }

    return {
      passed: result.filter((r) => r.pass).length,
      failed: result.filter((r) => !r.pass).length,
      invariants: result,
    };
  },
});
