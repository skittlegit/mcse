import { internalAction, internalMutation, internalQuery, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

// ── Gaussian noise helper ─────────────────────────────────────────────────────
// Box-Muller transform for normally distributed noise
function gaussianNoise(mean: number, sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return mean + sigma * z;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

// ── Fair value formula ───────────────────────────────────────────────────────
// FV = openPrice × Fundamentals × (1 + NSF)
//
//   Fundamentals (per-stock, slow-moving): centered ≈ 1.0
//     0.85
//     + 0.15 × quality_score      where quality_score = (pq+bs+cs+ip)/400 ∈ [0,1]
//     + 0.10 × profit_margin      clamped to [-0.3, 0.5]
//     + 0.05 × solvency           = 1 - debt/assets, clamped [0,1]
//
//   Sentiment (LLM-driven, refreshed every macro-tick): 1 + NSF ∈ [0.97, 1.03]
//
// The micro-tick pulls currentPrice toward FV at 4% per tick. Combined with
// tiny OIF + tiny noise, this gives the market a fundamental anchor that the
// LLM can move via NSF — without touching individual orders.
export function computeFairValue(stock: Doc<"stocks">): number {
  const quality =
    (stock.productQuality +
      stock.brandStrength +
      stock.customerSatisfaction +
      stock.innovationPipeline) /
    400;
  const profitMargin =
    stock.revenue > 0
      ? clamp(stock.profit / stock.revenue, -0.3, 0.5)
      : 0;
  const solvency =
    stock.assets > 0
      ? clamp(1 - stock.debt / stock.assets, 0, 1)
      : 0.5;
  const fundamentals =
    0.85 + 0.15 * quality + 0.10 * profitMargin + 0.05 * solvency;
  const sentiment = 1 + clamp(stock.netSentimentFactor, -0.03, 0.03);
  return stock.openPrice * fundamentals * sentiment;
}

// ── Micro-tick: update all stock prices ──────────────────────────────────────
// Δ% = gap_pull(0.04) + tiny OIF + tiny noise
// Per-tick clamp ±2%, cumulative cap ±10% from day open.
// OIF only counts COMPLETED orders — PENDING limits don't move price.

export const applyMicroTick = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const state = await ctx.db.query("marketState").first();
    if (!state || !state.isOpen) return null;

    const stocks = await ctx.db.query("stocks").collect();
    const now = Date.now();
    const newMicroTick = state.currentMicroTick + 1;

    // Look at recent orders (last 15 seconds) to compute order imbalance
    const windowStart = now - 15_000;

    for (const stock of stocks) {
      if (!stock.isListed) continue;

      // Order imbalance from recent trades
      const recentOrders = await ctx.db
        .query("orders")
        .withIndex("by_ticker_time", (q) =>
          q.eq("ticker", stock.ticker).gte("timestamp", windowStart),
        )
        .collect();

      let buyVolume = 0;
      let sellVolume = 0;
      for (const o of recentOrders) {
        if (o.status !== "COMPLETED") continue;
        if (o.side === "BUY") buyVolume += o.quantity;
        else sellVolume += o.quantity;
      }
      const totalVolume = buyVolume + sellVolume;
      // OIF: tiny live-flow nudge so big real trades have *some* signal,
      // but the PRIMARY driver is fair-value pull below.
      const oif = totalVolume > 0
        ? ((buyVolume - sellVolume) / totalVolume) * 0.005
        : 0;

      // Pull toward fair value. FV is openPrice × Fundamentals × (1+NSF) —
      // the LLM moves NSF every macro-tick, which moves FV, which drags
      // currentPrice over ~25 ticks. This is what makes pending limits
      // wait realistically: the price tracks fundamentals + sentiment,
      // not random noise.
      const fairValue = computeFairValue(stock);
      const gap =
        stock.currentPrice > 0
          ? (fairValue - stock.currentPrice) / stock.currentPrice
          : 0;
      const pull = gap * 0.04;

      // Small noise so charts don't look mechanical.
      const noise = gaussianNoise(0, 0.003);

      const rawDelta = pull + oif + noise;

      // Per-tick circuit breaker: ±2%
      const tickDelta = clamp(rawDelta, -0.02, 0.02);

      // Cumulative circuit breaker anchored to DAY open: ±10%
      const proposedPrice = stock.currentPrice * (1 + tickDelta);
      const maxPrice = stock.openPrice * 1.10;
      const minPrice = stock.openPrice * 0.90;
      const newPrice = +clamp(proposedPrice, minPrice, maxPrice).toFixed(2);

      const newDayHigh = Math.max(stock.dayHigh, newPrice);
      const newDayLow = Math.min(stock.dayLow, newPrice);
      const changeDay = +(newPrice - stock.openPrice).toFixed(2);
      const changePctDay = +((changeDay / stock.openPrice) * 100).toFixed(2);

      await ctx.db.patch(stock._id, {
        currentPrice: newPrice,
        dayHigh: newDayHigh,
        dayLow: newDayLow,
        changeDay,
        changePctDay,
        marketCap: newPrice * stock.sharesOutstanding,
      });

      // Record price history
      await ctx.db.insert("priceHistory", {
        stockId: stock._id,
        ticker: stock.ticker,
        price: newPrice,
        volumeTick: totalVolume,
        timestamp: now,
        microTick: newMicroTick,
      });
    }

    // Advance micro-tick counter
    await ctx.db.patch(state._id, {
      currentMicroTick: newMicroTick,
      lastMicroTickAt: now,
    });

    // Match any PENDING limit orders against the new prices.
    await ctx.scheduler.runAfter(0, internal.trading.processPendingLimits, {});

    // Prune old price history (keep last 200 per stock — delete oldest)
    // Only prune every 20 ticks to avoid excessive DB writes
    if (newMicroTick % 20 === 0) {
      for (const stock of stocks) {
        const allHistory = await ctx.db
          .query("priceHistory")
          .withIndex("by_stock_time", (q) => q.eq("stockId", stock._id))
          .order("desc")
          .collect();
        if (allHistory.length > 200) {
          const toDelete = allHistory.slice(200);
          for (const row of toDelete) {
            await ctx.db.delete(row._id);
          }
        }
      }
    }

    return null;
  },
});

// ── Macro-tick: LLM sentiment update ──────────────────────────────────────────
// Calls Claude Haiku to generate net_sentiment_factor for each stock
// based on price trends, sector macro, and operational scores.

// Internal query to read market data for the macro-tick LLM call.
// Now also aggregates the PENDING limit-order book per stock so the LLM
// can see real demand/supply pressure when setting sentiment.
export const getMacroTickData = internalQuery({
  args: {},
  returns: v.union(
    v.null(),
    v.object({
      isOpen: v.boolean(),
      stocks: v.array(v.object({
        ticker: v.string(),
        sector: v.string(),
        currentPrice: v.number(),
        macroOpenPrice: v.number(),
        volumeDay: v.number(),
        productQuality: v.number(),
        brandStrength: v.number(),
        innovationPipeline: v.number(),
        isListed: v.boolean(),
        bookBuyDepth: v.number(),
        bookBuyAvgPrice: v.number(),
        bookSellDepth: v.number(),
        bookSellAvgPrice: v.number(),
      })),
    }),
  ),
  handler: async (ctx) => {
    const state = await ctx.db.query("marketState").first();
    if (!state || !state.isOpen) return null;
    const stocks = await ctx.db.query("stocks").collect();
    const allOrders = await ctx.db.query("orders").collect();
    const pendingByTicker = new Map<
      string,
      { buyQty: number; buyValue: number; sellQty: number; sellValue: number }
    >();
    for (const o of allOrders) {
      if (o.status !== "PENDING" || o.pricingType !== "LIMIT") continue;
      const px = o.limitPrice ?? o.price;
      const acc = pendingByTicker.get(o.ticker) ?? {
        buyQty: 0, buyValue: 0, sellQty: 0, sellValue: 0,
      };
      if (o.side === "BUY") {
        acc.buyQty += o.quantity;
        acc.buyValue += px * o.quantity;
      } else {
        acc.sellQty += o.quantity;
        acc.sellValue += px * o.quantity;
      }
      pendingByTicker.set(o.ticker, acc);
    }

    return {
      isOpen: state.isOpen,
      stocks: stocks
        .filter((s) => s.isListed)
        .map((s) => {
          const book = pendingByTicker.get(s.ticker);
          return {
            ticker: s.ticker,
            sector: s.sector,
            currentPrice: s.currentPrice,
            macroOpenPrice: s.macroOpenPrice,
            volumeDay: s.volumeDay,
            productQuality: s.productQuality,
            brandStrength: s.brandStrength,
            innovationPipeline: s.innovationPipeline,
            isListed: s.isListed,
            bookBuyDepth: book?.buyQty ?? 0,
            bookBuyAvgPrice: book && book.buyQty > 0
              ? +(book.buyValue / book.buyQty).toFixed(2) : 0,
            bookSellDepth: book?.sellQty ?? 0,
            bookSellAvgPrice: book && book.sellQty > 0
              ? +(book.sellValue / book.sellQty).toFixed(2) : 0,
          };
        }),
    };
  },
});

export const applyMacroTick = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    type MacroStock = {
      ticker: string; sector: string; currentPrice: number; macroOpenPrice: number;
      volumeDay: number; productQuality: number; brandStrength: number;
      innovationPipeline: number; isListed: boolean;
      bookBuyDepth: number; bookBuyAvgPrice: number;
      bookSellDepth: number; bookSellAvgPrice: number;
    };
    const data = await ctx.runQuery(internal.priceEngine.getMacroTickData, {}) as
      | null
      | { isOpen: boolean; stocks: MacroStock[] };
    if (!data || !data.isOpen) return null;

    const listedStocks = data.stocks;

    // Build compact context. Per-stock fields (colon-delimited):
    //   ticker:sector:price_change_pct:vol:pq:bs:ip
    //   :bd<qty>@<avgPx>      ← pending BUY-LIMIT depth + avg price (demand below market)
    //   :sd<qty>@<avgPx>      ← pending SELL-LIMIT depth + avg price (supply above market)
    const stockSummaries = listedStocks.map((s) => {
      const priceChange = ((s.currentPrice - s.macroOpenPrice) / (s.macroOpenPrice || 1) * 100).toFixed(1);
      const bd = s.bookBuyDepth > 0 ? `bd${s.bookBuyDepth}@${s.bookBuyAvgPrice}` : "bd0";
      const sd = s.bookSellDepth > 0 ? `sd${s.bookSellDepth}@${s.bookSellAvgPrice}` : "sd0";
      return `${s.ticker}:${s.sector}:${priceChange}%:vol${s.volumeDay}:pq${s.productQuality}:bs${s.brandStrength}:ip${s.innovationPipeline}:${bd}:${sd}`;
    }).join("\n");

    const prompt = `You are the MCSE Sentiment Modulator for the AEON fictional stock exchange.
Below are 57 listed stocks. For each: ticker, sector, price_change_pct_from_macro_open, day_volume, product_quality(0-100), brand_strength(0-100), innovation_pipeline(0-100), bd<qty>@<avg_px> = pending BUY LIMIT depth (real demand waiting below market), sd<qty>@<avg_px> = pending SELL LIMIT depth (supply waiting above market).

${stockSummaries}

Generate a net_sentiment_factor for each stock in range [-0.03, +0.03]. This factor moves the stock's fair value, and the live price drifts toward fair value over the next ~25 micro-ticks (about 6 minutes). Pending limit orders fill when the live price crosses them — so your sentiment literally decides whose orders get triggered.

Rules:
- Strong fundamentals (high pq+bs+ip) → mildly positive bias.
- Heavy bd (lots of buyers waiting below market) → mild upward sentiment (demand absorbs sells).
- Heavy sd (lots of sellers waiting above market) → mild downward sentiment (overhead supply caps rallies).
- Large positive price change → mild reversion (profit-taking).
- Large negative price change → mild recovery.
- Sector correlation: tech moves together slightly, etc.
- Add some randomness; do NOT make every stock positive. Mix bullish, neutral, bearish.

Respond with ONLY a compact JSON object mapping ticker to sentiment_factor (2 decimal places, e.g. 0.01):
{"ESOFT":0.01,"ECLOUD":-0.02,...}
No explanation, no markdown, just the JSON object.`;

    let sentimentMap: Record<string, number> = {};

    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 800,
          temperature: 0.4,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!response.ok) throw new Error(`Anthropic API error: ${response.status}`);
      const data = await response.json() as { content: Array<{ type: string; text: string }> };
      const text = data.content?.[0]?.text ?? "";

      // Extract JSON from response
      // Find first {...} block — use indexOf to avoid regex flag issues
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}");
      const jsonMatch = jsonStart !== -1 && jsonEnd > jsonStart ? [text.slice(jsonStart, jsonEnd + 1)] : null;
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
        for (const [ticker, val] of Object.entries(parsed)) {
          if (typeof val === "number") {
            sentimentMap[ticker] = clamp(val, -0.03, 0.03);
          }
        }
      }
    } catch (err) {
      console.error("LLM sentiment call failed, using fallback:", err);
      // Fallback: small random sentiment per stock
      for (const s of listedStocks) {
        sentimentMap[s.ticker] = clamp(gaussianNoise(0, 0.008), -0.03, 0.03);
      }
    }

    // Apply sentiment updates and reset macro open price
    await ctx.runMutation(internal.priceEngine.applyMacroSentiment, { sentimentMap });

    return null;
  },
});

export const applyMacroSentiment = internalMutation({
  args: { sentimentMap: v.any() },
  returns: v.null(),
  handler: async (ctx, { sentimentMap }) => {
    const state = await ctx.db.query("marketState").first();
    if (!state) return null;

    const stocks = await ctx.db.query("stocks").collect();
    const now = Date.now();

    for (const stock of stocks) {
      const nsf = (sentimentMap as Record<string, number>)[stock.ticker];
      const updates: Record<string, unknown> = {
        macroOpenPrice: stock.currentPrice, // reset circuit breaker window
      };
      if (typeof nsf === "number") {
        updates.netSentimentFactor = nsf;
      }
      await ctx.db.patch(stock._id, updates);
    }

    const newMacroTick = state.currentMacroTick + 1;
    await ctx.db.patch(state._id, {
      currentMacroTick: newMacroTick,
      lastMacroTickAt: now,
    });

    // Expire any PENDING limit orders that have outlived their TTL.
    await ctx.scheduler.runAfter(0, internal.trading.expirePendingOrders, {
      asOfMacroTick: newMacroTick,
    });

    return null;
  },
});

// ── Admin: open / close market ────────────────────────────────────────────────

export const openMarket = mutation({
  args: {},
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx) => {
    const state = await ctx.db.query("marketState").first();
    const now = Date.now();

    if (state) {
      await ctx.db.patch(state._id, {
        isOpen: true,
        openedAt: now,
        closedAt: undefined,
      });
    } else {
      await ctx.db.insert("marketState", {
        isOpen: true,
        currentMicroTick: 0,
        currentMacroTick: 0,
        dayNumber: 1,
        openedAt: now,
        lastMicroTickAt: now,
        lastMacroTickAt: now,
      });
    }

    // Resume price activity. Do NOT reset openPrice — that would shift the
    // ±15% circuit-breaker anchor and let prices ratchet up across multiple
    // open/close cycles. Only seed netSentimentFactor so movement resumes.
    //
    // To start a fresh trading day with new openPrice, use resetPrices()
    // explicitly. Plain Start Market just resumes from the current state.
    const stocks = await ctx.db.query("stocks").collect();
    for (const s of stocks) {
      const initialNsf = (Math.random() - 0.5) * 0.01; // ±0.005
      await ctx.db.patch(s._id, {
        netSentimentFactor: initialNsf,
      });
    }

    // Schedule the first LLM macro tick in 30 seconds (instead of waiting 5 min)
    await ctx.scheduler.runAfter(30_000, internal.priceEngine.applyMacroTick, {});
    await ctx.scheduler.runAfter(45_000, internal.news.generateMacroNews, {});

    return { success: true };
  },
});

export const closeMarket = mutation({
  args: {},
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx) => {
    const state = await ctx.db.query("marketState").first();
    if (!state) return { success: false };
    await ctx.db.patch(state._id, { isOpen: false, closedAt: Date.now() });
    // Refund every PENDING limit order — the market is gone.
    await ctx.scheduler.runAfter(0, internal.trading.cancelAllPendingOrders, {});
    return { success: true };
  },
});

// Admin-driven sentiment shock. Maps an event type to an NSF delta and
// applies it to a single stock OR every listed stock ("ALL"). Optionally
// posts an APPROVED news item so users see why prices are moving.
//
// Effect lasts until the next macro-tick (~5 min) when the LLM
// re-evaluates sentiment from fundamentals. To keep a sustained mood,
// re-fire the injection every few minutes.
//
// Run from CLI:
//   npx convex run --prod priceEngine:injectMarketEvent '{"ticker":"ALL","eventType":"EARNINGS_MISS","message":"Sector-wide earnings disappointment"}'
const EVENT_NSF_DELTA: Record<string, number> = {
  EARNINGS_BEAT:      +0.025,
  DIVIDEND_ANNOUNCE:  +0.020,
  PRODUCT_LAUNCH:     +0.020,
  ACQUISITION:        +0.010, // ambiguous; mild bullish
  LEADERSHIP_CHANGE:    0.000, // neutral
  EARNINGS_MISS:      -0.025,
  REGULATORY_FINE:    -0.020,
  SCANDAL:            -0.030, // strongest bearish
};

const EVENT_HEADLINE: Record<string, string> = {
  EARNINGS_BEAT:     "Earnings beat expectations",
  EARNINGS_MISS:     "Earnings miss disappoints market",
  DIVIDEND_ANNOUNCE: "Dividend announcement",
  PRODUCT_LAUNCH:    "Product launch announced",
  ACQUISITION:       "Acquisition news breaks",
  REGULATORY_FINE:   "Regulatory fine imposed",
  LEADERSHIP_CHANGE: "Leadership change announced",
  SCANDAL:           "Scandal hits company",
};

export const injectMarketEvent = mutation({
  args: {
    ticker: v.string(), // ticker symbol, or "ALL" for the entire listed market
    eventType: v.string(),
    message: v.optional(v.string()),
  },
  returns: v.object({
    success: v.boolean(),
    stocksAffected: v.number(),
    nsfDelta: v.number(),
    newsId: v.union(v.id("news"), v.null()),
    message: v.string(),
  }),
  handler: async (ctx, { ticker, eventType, message }) => {
    const delta = EVENT_NSF_DELTA[eventType];
    if (delta === undefined) {
      return {
        success: false, stocksAffected: 0, nsfDelta: 0, newsId: null,
        message: `Unknown event type "${eventType}". Valid: ${Object.keys(EVENT_NSF_DELTA).join(", ")}`,
      };
    }

    const target = ticker.toUpperCase();
    const isMarketWide = target === "ALL";

    const allStocks = await ctx.db.query("stocks").collect();
    const stocks = isMarketWide
      ? allStocks.filter((s) => s.isListed)
      : allStocks.filter((s) => s.ticker === target && s.isListed);

    if (stocks.length === 0) {
      return {
        success: false, stocksAffected: 0, nsfDelta: delta, newsId: null,
        message: isMarketWide ? "No listed stocks found." : `Stock ${target} not found or not listed.`,
      };
    }

    // Apply NSF directly (overwrite, not delta — we want the shock to be
    // visible immediately). LLM will pull it back toward neutral on next
    // macro-tick (~5 min) so re-fire if you want a sustained mood.
    for (const s of stocks) {
      await ctx.db.patch(s._id, { netSentimentFactor: delta });
    }

    // Post a news headline so users see WHY prices moved.
    const state = await ctx.db.query("marketState").first();
    const newsId = await ctx.db.insert("news", {
      headline: isMarketWide
        ? `Market-wide: ${EVENT_HEADLINE[eventType] ?? eventType}`
        : `${target}: ${EVENT_HEADLINE[eventType] ?? eventType}`,
      body: message?.trim() ||
        (isMarketWide
          ? "Admin-injected market-wide sentiment event. Affecting all listed stocks."
          : `Admin-injected event for ${target}.`),
      relatedTickers: isMarketWide
        ? stocks.slice(0, 5).map((s) => s.ticker)
        : [target],
      sentiment: delta,
      confidence: 0.9,
      source: "ADMIN",
      status: "APPROVED",
      macroTick: state?.currentMacroTick ?? 0,
      publishedAt: Date.now(),
    });

    // Schedule a micro-tick immediately so users see the price react
    // within seconds rather than waiting for the next 15 s cron.
    await ctx.scheduler.runAfter(0, internal.priceEngine.applyMicroTick, {});

    return {
      success: true,
      stocksAffected: stocks.length,
      nsfDelta: delta,
      newsId,
      message: `${isMarketWide ? "Market-wide" : target} sentiment set to ${delta >= 0 ? "+" : ""}${delta}. ${stocks.length} stock${stocks.length === 1 ? "" : "s"} affected. News posted.`,
    };
  },
});

// Reset every investor's balance to the starting capital. Use to fix
// accounts created before STARTING_BALANCE was set, or to give everyone
// a fresh wallet at the start of an event.
//
// Defaults: amount = ₹2,00,000, clearHoldings = false.
//   • clearHoldings: false → keeps portfolios + completed transactions
//     intact, just sets balance. Pending limits cancelled (escrow wiped).
//   • clearHoldings: true  → also deletes every portfolio row, transaction
//     row, and order row. Total wipe back to "Day 1" state.
//
// Run from Convex dashboard:
//   priceEngine.resetAllBalances {}
//   priceEngine.resetAllBalances { "amount": 500000 }
//   priceEngine.resetAllBalances { "clearHoldings": true }
export const resetAllBalances = mutation({
  args: {
    amount: v.optional(v.number()),
    clearHoldings: v.optional(v.boolean()),
  },
  returns: v.object({
    investorCount: v.number(),
    amount: v.number(),
    pendingCancelled: v.number(),
    holdingsCleared: v.number(),
  }),
  handler: async (ctx, { amount, clearHoldings }) => {
    const target = amount ?? 200_000;
    const wipe = clearHoldings ?? false;

    // Cancel every PENDING order — escrows would otherwise be inconsistent
    // with the new balances.
    const allOrders = await ctx.db.query("orders").collect();
    const pending = allOrders.filter((o) => o.status === "PENDING");
    for (const o of pending) {
      await ctx.db.patch(o._id, { status: "CANCELLED" });
    }

    // Optionally wipe portfolios + transactions + all order rows.
    let holdingsCleared = 0;
    if (wipe) {
      const positions = await ctx.db.query("portfolio").collect();
      for (const p of positions) await ctx.db.delete(p._id);
      holdingsCleared = positions.length;
      const txns = await ctx.db.query("transactions").collect();
      for (const t of txns) await ctx.db.delete(t._id);
      for (const o of allOrders) await ctx.db.delete(o._id);
    }

    const investors = await ctx.db.query("investors").collect();
    for (const inv of investors) {
      await ctx.db.patch(inv._id, { balance: target });
    }

    return {
      investorCount: investors.length,
      amount: target,
      pendingCancelled: pending.length,
      holdingsCleared,
    };
  },
});

// Day-1 wipe in safe batches — handles tables with thousands of rows
// without hitting the 4096-op-per-mutation Convex limit. Each call deletes
// up to BATCH_SIZE rows from each table, then re-schedules itself until
// every table is empty. Finally resets every investor's balance.
//
// Use when `resetAllBalances {"clearHoldings": true}` errors out with
// "Too many reads in a single function execution".
//
// Run:  npx convex run --prod priceEngine:fullWipeAndReset '{}'
const WIPE_BATCH = 1000;

export const fullWipeAndReset = mutation({
  args: { amount: v.optional(v.number()) },
  returns: v.object({
    deletedThisBatch: v.number(),
    moreToGo: v.boolean(),
    balancesReset: v.number(),
    targetBalance: v.number(),
  }),
  handler: async (ctx, { amount }) => {
    const target = amount ?? 200_000;
    let deleted = 0;

    const orders = await ctx.db.query("orders").take(WIPE_BATCH);
    for (const o of orders) await ctx.db.delete(o._id);
    deleted += orders.length;

    const txns = await ctx.db.query("transactions").take(WIPE_BATCH);
    for (const t of txns) await ctx.db.delete(t._id);
    deleted += txns.length;

    const positions = await ctx.db.query("portfolio").take(WIPE_BATCH);
    for (const p of positions) await ctx.db.delete(p._id);
    deleted += positions.length;

    const moreToGo = orders.length === WIPE_BATCH ||
      txns.length === WIPE_BATCH ||
      positions.length === WIPE_BATCH;

    let balancesReset = 0;
    if (!moreToGo) {
      // Final pass — reset every investor balance.
      const investors = await ctx.db.query("investors").collect();
      for (const inv of investors) {
        await ctx.db.patch(inv._id, { balance: target });
      }
      balancesReset = investors.length;
    } else {
      // Schedule the next batch immediately.
      await ctx.scheduler.runAfter(0, internal.priceEngine._fullWipeContinue, { amount: target });
    }

    return {
      deletedThisBatch: deleted,
      moreToGo,
      balancesReset,
      targetBalance: target,
    };
  },
});

export const _fullWipeContinue = internalMutation({
  args: { amount: v.number() },
  returns: v.null(),
  handler: async (ctx, { amount }) => {
    let deleted = 0;
    const orders = await ctx.db.query("orders").take(WIPE_BATCH);
    for (const o of orders) await ctx.db.delete(o._id);
    deleted += orders.length;
    const txns = await ctx.db.query("transactions").take(WIPE_BATCH);
    for (const t of txns) await ctx.db.delete(t._id);
    deleted += txns.length;
    const positions = await ctx.db.query("portfolio").take(WIPE_BATCH);
    for (const p of positions) await ctx.db.delete(p._id);
    deleted += positions.length;

    const moreToGo = orders.length === WIPE_BATCH ||
      txns.length === WIPE_BATCH ||
      positions.length === WIPE_BATCH;
    if (moreToGo) {
      await ctx.scheduler.runAfter(0, internal.priceEngine._fullWipeContinue, { amount });
    } else {
      const investors = await ctx.db.query("investors").collect();
      for (const inv of investors) {
        await ctx.db.patch(inv._id, { balance: amount });
      }
    }
    return null;
  },
});

// Reset all stock prices back to their original seed prices.
// Useful when prices have drifted too far during testing.
// Prices are computed from the original seed formula (sector_base × tier × quality).
export const resetPrices = mutation({
  args: {},
  returns: v.object({ resetCount: v.number() }),
  handler: async (ctx) => {
    const SECTOR_BASE: Record<string, number> = {
      Technology: 2200, Finance: 1400, Automotive: 1100,
      Pharmaceutical: 1900, Defense: 1700, Media: 750,
      "Consumer Goods": 550,
    };
    const TIER_MUL: Record<string, number> = { FLAGSHIP: 1.6, SECONDARY: 1.0, EMERGING: 0.55 };

    const stocks = await ctx.db.query("stocks").collect();
    let count = 0;
    for (const s of stocks) {
      const base = SECTOR_BASE[s.sector] ?? 1000;
      const qf = (s.productQuality * 0.4 + s.brandStrength * 0.3 + s.customerSatisfaction * 0.3) / 100;
      const tierMul = TIER_MUL[s.tier] ?? 1.0;
      const seedPrice = Math.round((base * tierMul * qf) / 5) * 5;

      await ctx.db.patch(s._id, {
        currentPrice: seedPrice,
        openPrice: seedPrice,
        macroOpenPrice: seedPrice,
        dayHigh: seedPrice,
        dayLow: seedPrice,
        changeDay: 0,
        changePctDay: 0,
        volumeDay: 0,
        netSentimentFactor: 0,
        marketCap: seedPrice * s.sharesOutstanding,
      });
      count++;
    }

    // Clear price history in small batches (Convex mutations cap at 4096 reads/writes).
    // Delete up to 2000 rows here; schedule follow-up batches if more remain.
    const batch = await ctx.db.query("priceHistory").take(2000);
    for (const h of batch) await ctx.db.delete(h._id);
    if (batch.length === 2000) {
      await ctx.scheduler.runAfter(0, internal.priceEngine.prunePriceHistoryBatch, {});
    }

    // Reset tick counters
    const state = await ctx.db.query("marketState").first();
    if (state) {
      await ctx.db.patch(state._id, {
        currentMicroTick: 0,
        currentMacroTick: 0,
        lastMicroTickAt: Date.now(),
        lastMacroTickAt: Date.now(),
      });
    }

    return { resetCount: count };
  },
});

// Internal mutation to delete price history in 2k-row batches.
// Re-schedules itself until the table is empty. Safe to run concurrently
// with live ticks (they just insert new rows the next batch will pick up).
export const prunePriceHistoryBatch = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const batch = await ctx.db.query("priceHistory").take(2000);
    for (const h of batch) await ctx.db.delete(h._id);
    if (batch.length === 2000) {
      await ctx.scheduler.runAfter(0, internal.priceEngine.prunePriceHistoryBatch, {});
    }
    return null;
  },
});
