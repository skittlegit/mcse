import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

// LIMIT band: a LIMIT order is rejected if its price is more than this
// fraction away from the current market price at submission time.
const LIMIT_BAND = 0.03;

// Pending LIMIT orders auto-expire after this many macro-ticks (5 min each
// → ~30 min). Macro-ticks pause when the market is closed, so the clock
// pauses with the market.
export const ORDER_TTL_MACRO_TICKS = 6;

function fmtINR(n: number): string {
  return n.toLocaleString("en-IN", { minimumFractionDigits: 2 });
}

// ── Auth helper ───────────────────────────────────────────────────────────────

async function investorFromSession(
  ctx: QueryCtx | MutationCtx,
  tokenHash: string,
): Promise<Doc<"investors"> | null> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("tokenHash", tokenHash))
    .unique();
  if (!session || session.expiresAt < Date.now()) return null;
  return ctx.db.get(session.investorId);
}

// ── Place Order ───────────────────────────────────────────────────────────────

export const placeOrder = mutation({
  args: {
    tokenHash: v.string(),
    ticker: v.string(),
    side: v.union(v.literal("BUY"), v.literal("SELL")),
    orderType: v.union(v.literal("DELIVERY"), v.literal("INTRADAY")),
    pricingType: v.union(v.literal("MARKET"), v.literal("LIMIT")),
    quantity: v.number(),
    limitPrice: v.optional(v.number()),
  },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, args) => {
    const investor = await investorFromSession(ctx, args.tokenHash);
    if (!investor) return { success: false, message: "Session expired. Please log in again." };

    // Block company-role and admin-role accounts from trading. They run the
    // market — letting them trade is a conflict of interest. Read role from
    // the session row (server-side, can't be forged via localStorage).
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();
    const role = session?.role ?? "user";
    if (role === "admin" || role.startsWith("company")) {
      return {
        success: false,
        message: role === "admin"
          ? "Admin accounts cannot place trades."
          : "Company accounts cannot trade their own market. Switch to an investor account to buy/sell.",
      };
    }

    // Hard gate: no orders accepted while the market is closed.
    // Admin opens/closes via the /admin market start/pause buttons.
    const marketState = await ctx.db.query("marketState").first();
    if (!marketState || !marketState.isOpen) {
      return {
        success: false,
        message: "Market is closed. Orders cannot be placed right now.",
      };
    }

    if (args.quantity <= 0 || !Number.isInteger(args.quantity)) {
      return { success: false, message: "Quantity must be a positive whole number." };
    }

    // Per-user rate limit: max 5 orders in any rolling 10-second window.
    // Prevents runaway scripts and accidental double-submits under load.
    const recentWindow = Date.now() - 10_000;
    const recentOrders = await ctx.db
      .query("orders")
      .withIndex("by_investor_time", (q) =>
        q.eq("investorId", investor._id).gte("timestamp", recentWindow),
      )
      .collect();
    if (recentOrders.length >= 5) {
      return { success: false, message: "Too many orders. Please wait a few seconds." };
    }

    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker.toUpperCase()))
      .unique();
    if (!stock || !stock.isListed) {
      return { success: false, message: "Stock not found or not listed." };
    }

    const now = Date.now();

    // ── LIMIT order handling ────────────────────────────────────────────────
    // Marketable LIMITs (limit on the user-favorable side of market) fill
    // INSTANTLY at current market — user gets price improvement.
    //   • SELL @ ≤ market: fills at current (always ≥ limit)
    //   • BUY  @ ≥ market: fills at current (always ≤ limit)
    // Non-marketable LIMITs queue as PENDING and fill at the EXACT limit
    // price when market crosses to it.
    if (args.pricingType === "LIMIT") {
      if (!args.limitPrice || args.limitPrice <= 0) {
        return { success: false, message: "Limit order requires a positive limit price." };
      }
      const limitPrice = +args.limitPrice.toFixed(2);
      const submitMarket = stock.currentPrice;
      const drift = Math.abs(limitPrice - submitMarket) / submitMarket;
      if (drift > LIMIT_BAND) {
        return {
          success: false,
          message: `Limit price ₹${fmtINR(limitPrice)} is ${(drift * 100).toFixed(2)}% from market ₹${fmtINR(submitMarket)}. Limit must be within ±${(LIMIT_BAND * 100).toFixed(0)}% of current market price.`,
        };
      }

      // Marketable check — limit is on the user's favorable side?
      //   SELL @ ≤ market → user willing to take less; market gives them more.
      //   BUY  @ ≥ market → user willing to pay more; market charges them less.
      const marketable =
        (args.side === "BUY"  && limitPrice >= submitMarket) ||
        (args.side === "SELL" && limitPrice <= submitMarket);

      if (marketable) {
        // Fall through to the MARKET fill path below — fills instantly at
        // stock.currentPrice with price improvement vs the user's limit.
      } else if (args.side === "BUY") {
        // Always escrow at limitPrice — that's the most user could pay.
        const escrow = +(limitPrice * args.quantity).toFixed(2);
        if (escrow > investor.balance) {
          return {
            success: false,
            message: `Insufficient balance to escrow ₹${fmtINR(escrow)}. Have ₹${fmtINR(investor.balance)}.`,
          };
        }
        await ctx.db.patch(investor._id, {
          balance: +(investor.balance - escrow).toFixed(2),
        });
        await ctx.db.insert("orders", {
          investorId: investor._id,
          stockId: stock._id,
          ticker: stock.ticker,
          stockName: stock.name,
          side: "BUY",
          orderType: args.orderType,
          pricingType: "LIMIT",
          quantity: args.quantity,
          price: limitPrice,
          limitPrice,
          total: escrow,
          status: "PENDING",
          timestamp: now,
          expiresAtMacroTick: marketState.currentMacroTick + ORDER_TTL_MACRO_TICKS,
          submitPrice: submitMarket,
        });
        // Wake matcher within ~100ms in case limit ≈ current already.
        await ctx.scheduler.runAfter(100, internal.trading.processPendingLimits, {});
        const direction = limitPrice >= submitMarket
          ? "fills when market rises to"
          : "fills when market drops to";
        return {
          success: true,
          message: `BUY LIMIT placed: ${args.quantity} ${stock.ticker} @ ₹${fmtINR(limitPrice)}. PENDING — ${direction} ₹${fmtINR(limitPrice)}.`,
        };
      } else {
        // Non-marketable SELL: validate against (holdings − already-pending sells)
        const pos = await ctx.db
          .query("portfolio")
          .withIndex("by_investor_ticker", (q) =>
            q.eq("investorId", investor._id).eq("ticker", stock.ticker),
          )
          .unique();
        if (!pos) {
          return { success: false, message: `You don't hold ${stock.ticker}.` };
        }
        const myOrders = await ctx.db
          .query("orders")
          .withIndex("by_investor_time", (q) => q.eq("investorId", investor._id))
          .collect();
        const lockedQty = myOrders
          .filter(
            (o) =>
              o.status === "PENDING" &&
              o.pricingType === "LIMIT" &&
              o.side === "SELL" &&
              o.ticker === stock.ticker,
          )
          .reduce((sum, o) => sum + o.quantity, 0);
        const available = pos.quantity - lockedQty;
        if (args.quantity > available) {
          return {
            success: false,
            message: `Insufficient holdings. Hold ${pos.quantity}, ${lockedQty} reserved by pending limit orders, ${available} available.`,
          };
        }
        await ctx.db.insert("orders", {
          investorId: investor._id,
          stockId: stock._id,
          ticker: stock.ticker,
          stockName: stock.name,
          side: "SELL",
          orderType: args.orderType,
          pricingType: "LIMIT",
          quantity: args.quantity,
          price: limitPrice,
          limitPrice,
          total: +(limitPrice * args.quantity).toFixed(2),
          status: "PENDING",
          timestamp: now,
          expiresAtMacroTick: marketState.currentMacroTick + ORDER_TTL_MACRO_TICKS,
          submitPrice: submitMarket,
        });
        await ctx.scheduler.runAfter(100, internal.trading.processPendingLimits, {});
        const direction = limitPrice >= submitMarket
          ? "fills when market rises to"
          : "fills when market drops to";
        return {
          success: true,
          message: `SELL LIMIT placed: ${args.quantity} ${stock.ticker} @ ₹${fmtINR(limitPrice)}. PENDING — ${direction} ₹${fmtINR(limitPrice)}.`,
        };
      }
      // marketable LIMIT — fall through and fill at currentPrice
    }

    // MARKET orders fill instantly at current market. LIMIT orders never
    // reach this point — they all return PENDING above.
    const executionPrice = stock.currentPrice;
    const total = +(executionPrice * args.quantity).toFixed(2);

    if (args.side === "BUY") {
      if (total > investor.balance) {
        return {
          success: false,
          message: `Insufficient balance. Need ₹${total.toLocaleString("en-IN", { minimumFractionDigits: 2 })} but have ₹${investor.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        };
      }

      // Deduct balance
      const newBalance = +(investor.balance - total).toFixed(2);
      await ctx.db.patch(investor._id, { balance: newBalance });

      // Insert order
      await ctx.db.insert("orders", {
        investorId: investor._id,
        stockId: stock._id,
        ticker: stock.ticker,
        stockName: stock.name,
        side: "BUY",
        orderType: args.orderType,
        pricingType: args.pricingType,
        quantity: args.quantity,
        price: executionPrice,
        limitPrice: args.limitPrice,
        total,
        status: "COMPLETED",
        timestamp: now,
      });

      // Update portfolio
      const existingPos = await ctx.db
        .query("portfolio")
        .withIndex("by_investor_ticker", (q) =>
          q.eq("investorId", investor._id).eq("ticker", stock.ticker),
        )
        .unique();

      if (existingPos) {
        const newQty = existingPos.quantity + args.quantity;
        const newTotalCost = +(existingPos.totalCost + total).toFixed(2);
        await ctx.db.patch(existingPos._id, {
          quantity: newQty,
          totalCost: newTotalCost,
          avgPrice: +(newTotalCost / newQty).toFixed(2),
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("portfolio", {
          investorId: investor._id,
          stockId: stock._id,
          ticker: stock.ticker,
          stockName: stock.name,
          quantity: args.quantity,
          avgPrice: executionPrice,
          totalCost: total,
          updatedAt: now,
        });
      }

      // Log transaction
      await ctx.db.insert("transactions", {
        investorId: investor._id,
        type: "BUY",
        ticker: stock.ticker,
        stockName: stock.name,
        quantity: args.quantity,
        price: executionPrice,
        amount: -total,
        balanceAfter: newBalance,
        description: `Bought ${args.quantity} ${stock.ticker} @ ₹${executionPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        timestamp: now,
      });

      // Update stock volume
      await ctx.db.patch(stock._id, {
        volumeDay: stock.volumeDay + args.quantity,
        marketCap: stock.currentPrice * stock.sharesOutstanding,
      });

      return { success: true, message: `Bought ${args.quantity} ${stock.ticker} @ ₹${executionPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` };
    }

    // ── SELL ──────────────────────────────────────────────────────────────────
    const existingPos = await ctx.db
      .query("portfolio")
      .withIndex("by_investor_ticker", (q) =>
        q.eq("investorId", investor._id).eq("ticker", stock.ticker),
      )
      .unique();

    if (!existingPos || existingPos.quantity < args.quantity) {
      return {
        success: false,
        message: `Insufficient holdings. You hold ${existingPos?.quantity ?? 0} ${stock.ticker}.`,
      };
    }

    // Credit balance
    const newBalance = +(investor.balance + total).toFixed(2);
    await ctx.db.patch(investor._id, { balance: newBalance });

    // Insert order
    await ctx.db.insert("orders", {
      investorId: investor._id,
      stockId: stock._id,
      ticker: stock.ticker,
      stockName: stock.name,
      side: "SELL",
      orderType: args.orderType,
      pricingType: args.pricingType,
      quantity: args.quantity,
      price: executionPrice,
      limitPrice: args.limitPrice,
      total,
      status: "COMPLETED",
      timestamp: now,
    });

    // Update portfolio
    const newQty = existingPos.quantity - args.quantity;
    if (newQty === 0) {
      await ctx.db.delete(existingPos._id);
    } else {
      // Keep avgPrice unchanged on sell (realised P&L is implicit)
      await ctx.db.patch(existingPos._id, {
        quantity: newQty,
        totalCost: +(existingPos.avgPrice * newQty).toFixed(2),
        updatedAt: now,
      });
    }

    // Log transaction
    await ctx.db.insert("transactions", {
      investorId: investor._id,
      type: "SELL",
      ticker: stock.ticker,
      stockName: stock.name,
      quantity: args.quantity,
      price: executionPrice,
      amount: total,
      balanceAfter: newBalance,
      description: `Sold ${args.quantity} ${stock.ticker} @ ₹${executionPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      timestamp: now,
    });

    // Update stock volume
    await ctx.db.patch(stock._id, {
      volumeDay: stock.volumeDay + args.quantity,
      marketCap: stock.currentPrice * stock.sharesOutstanding,
    });

    return { success: true, message: `Sold ${args.quantity} ${stock.ticker} @ ₹${executionPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}` };
  },
});

// ── Admin: list every investor with live stats ───────────────────────────────
// Powers the admin USERS table. No auth here — auth is enforced by the
// Next.js /api/admin/users route via session role check.
export const adminListInvestors = query({
  args: {},
  returns: v.array(
    v.object({
      investorId: v.id("investors"),
      email: v.string(),
      name: v.string(),
      balance: v.number(),           // free cash
      cashLocked: v.number(),        // escrowed in PENDING BUY LIMITs
      tradesCount: v.number(),       // COMPLETED orders
      totalInvested: v.number(),     // Σ portfolio.totalCost
      currentValue: v.number(),      // Σ qty × currentPrice
      returns: v.number(),           // currentValue − totalInvested
      returnsPct: v.number(),
      joinedAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const investors = await ctx.db.query("investors").collect();
    const allOrders = await ctx.db.query("orders").collect();
    const allPositions = await ctx.db.query("portfolio").collect();
    const allStocks = await ctx.db.query("stocks").collect();
    const priceByTicker = new Map(allStocks.map((s) => [s.ticker, s.currentPrice]));

    return investors.map((inv) => {
      const myOrders = allOrders.filter((o) => o.investorId === inv._id);
      const tradesCount = myOrders.filter((o) => o.status === "COMPLETED").length;
      const cashLocked = +myOrders
        .filter(
          (o) => o.status === "PENDING" && o.side === "BUY" && o.pricingType === "LIMIT",
        )
        .reduce((sum, o) => sum + (o.limitPrice ?? o.price) * o.quantity, 0)
        .toFixed(2);

      const myPositions = allPositions.filter((p) => p.investorId === inv._id);
      let totalInvested = 0;
      let currentValue = 0;
      for (const p of myPositions) {
        totalInvested += p.totalCost;
        const px = priceByTicker.get(p.ticker) ?? p.avgPrice;
        currentValue += px * p.quantity;
      }
      const returns = +(currentValue - totalInvested).toFixed(2);
      const returnsPct = totalInvested > 0
        ? +((returns / totalInvested) * 100).toFixed(2)
        : 0;

      return {
        investorId: inv._id,
        email: inv.email,
        name: inv.name,
        balance: inv.balance,
        cashLocked,
        tradesCount,
        totalInvested: +totalInvested.toFixed(2),
        currentValue: +currentValue.toFixed(2),
        returns,
        returnsPct,
        joinedAt: inv.createdAt,
      };
    });
  },
});

// ── Cancel a PENDING limit order ─────────────────────────────────────────────

export const cancelOrder = mutation({
  args: { tokenHash: v.string(), orderId: v.id("orders") },
  returns: v.object({ success: v.boolean(), message: v.string() }),
  handler: async (ctx, { tokenHash, orderId }) => {
    const investor = await investorFromSession(ctx, tokenHash);
    if (!investor) return { success: false, message: "Session expired." };
    const order = await ctx.db.get(orderId);
    if (!order) return { success: false, message: "Order not found." };
    if (order.investorId !== investor._id) {
      return { success: false, message: "Not your order." };
    }
    if (order.status !== "PENDING") {
      return { success: false, message: "Only pending orders can be cancelled." };
    }
    if (order.side === "BUY" && order.pricingType === "LIMIT") {
      const escrow = +((order.limitPrice ?? order.price) * order.quantity).toFixed(2);
      await ctx.db.patch(investor._id, {
        balance: +(investor.balance + escrow).toFixed(2),
      });
    }
    await ctx.db.patch(orderId, { status: "CANCELLED" });
    return { success: true, message: "Order cancelled." };
  },
});

// ── Match PENDING limits against the latest market prices ────────────────────
// Scheduled by priceEngine.applyMicroTick after every price update.
// BUY LIMIT fills when currentPrice ≤ limitPrice (price improvement, refund diff).
// SELL LIMIT fills when currentPrice ≥ limitPrice (filled at the better current price).
export const processPendingLimits = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    const pending = all.filter(
      (o) => o.status === "PENDING" && o.pricingType === "LIMIT",
    );
    if (pending.length === 0) return null;

    const now = Date.now();
    const stockCache = new Map<string, Doc<"stocks">>();

    for (const order of pending) {
      let stock = stockCache.get(order.ticker);
      if (!stock) {
        const s = await ctx.db
          .query("stocks")
          .withIndex("by_ticker", (q) => q.eq("ticker", order.ticker))
          .unique();
        if (!s) continue;
        stock = s;
        stockCache.set(order.ticker, s);
      }

      const limit = order.limitPrice ?? order.price;
      const px = stock.currentPrice;
      // Trigger direction: if limit was ABOVE submit-time market, the user
      // wants to wait for market to RISE to limit. If BELOW, wait for it
      // to DROP to limit. Falls back to BUY/SELL semantics for legacy rows
      // (pre-submitPrice column).
      const submit = order.submitPrice ?? limit;
      const triggerOnRise = limit >= submit;
      const shouldFill = triggerOnRise ? px >= limit : px <= limit;
      if (!shouldFill) continue;

      const investor = await ctx.db.get(order.investorId);
      if (!investor) {
        await ctx.db.patch(order._id, { status: "CANCELLED" });
        continue;
      }

      // Fill at the EXACT limit price the user typed. No price improvement
      // — predictable for the user, matches the queue-then-fill mental
      // model. Even if market overshoots the limit by tick noise, the
      // user gets the price they asked for.
      const fillPrice = limit;
      const fillTotal = +(fillPrice * order.quantity).toFixed(2);

      if (order.side === "BUY") {
        // Escrowed `limit × qty` at submission. Refund any difference.
        const escrow = +(limit * order.quantity).toFixed(2);
        const refund = +(escrow - fillTotal).toFixed(2);
        if (refund > 0) {
          await ctx.db.patch(investor._id, {
            balance: +(investor.balance + refund).toFixed(2),
          });
        }
        const pos = await ctx.db
          .query("portfolio")
          .withIndex("by_investor_ticker", (q) =>
            q.eq("investorId", investor._id).eq("ticker", order.ticker),
          )
          .unique();
        if (pos) {
          const newQty = pos.quantity + order.quantity;
          const newTotalCost = +(pos.totalCost + fillTotal).toFixed(2);
          await ctx.db.patch(pos._id, {
            quantity: newQty,
            totalCost: newTotalCost,
            avgPrice: +(newTotalCost / newQty).toFixed(2),
            updatedAt: now,
          });
        } else {
          await ctx.db.insert("portfolio", {
            investorId: investor._id,
            stockId: stock._id,
            ticker: order.ticker,
            stockName: order.stockName,
            quantity: order.quantity,
            avgPrice: fillPrice,
            totalCost: fillTotal,
            updatedAt: now,
          });
        }
        const fresh = await ctx.db.get(investor._id);
        await ctx.db.insert("transactions", {
          investorId: investor._id,
          type: "BUY",
          ticker: order.ticker,
          stockName: order.stockName,
          quantity: order.quantity,
          price: fillPrice,
          amount: -fillTotal,
          balanceAfter: fresh?.balance ?? investor.balance,
          description: `Limit BUY filled: ${order.quantity} ${order.ticker} @ ₹${fmtINR(fillPrice)}`,
          timestamp: now,
        });
      } else {
        // SELL fill — verify holdings still cover it (defensive).
        const pos = await ctx.db
          .query("portfolio")
          .withIndex("by_investor_ticker", (q) =>
            q.eq("investorId", investor._id).eq("ticker", order.ticker),
          )
          .unique();
        if (!pos || pos.quantity < order.quantity) {
          await ctx.db.patch(order._id, { status: "CANCELLED" });
          continue;
        }
        await ctx.db.patch(investor._id, {
          balance: +(investor.balance + fillTotal).toFixed(2),
        });
        const newQty = pos.quantity - order.quantity;
        if (newQty === 0) {
          await ctx.db.delete(pos._id);
        } else {
          await ctx.db.patch(pos._id, {
            quantity: newQty,
            totalCost: +(pos.avgPrice * newQty).toFixed(2),
            updatedAt: now,
          });
        }
        const fresh = await ctx.db.get(investor._id);
        await ctx.db.insert("transactions", {
          investorId: investor._id,
          type: "SELL",
          ticker: order.ticker,
          stockName: order.stockName,
          quantity: order.quantity,
          price: fillPrice,
          amount: fillTotal,
          balanceAfter: fresh?.balance ?? investor.balance,
          description: `Limit SELL filled: ${order.quantity} ${order.ticker} @ ₹${fmtINR(fillPrice)}`,
          timestamp: now,
        });
      }

      await ctx.db.patch(order._id, {
        status: "COMPLETED",
        price: fillPrice,
        total: fillTotal,
        timestamp: now,
      });
      const freshStock = await ctx.db.get(stock._id);
      if (freshStock) {
        await ctx.db.patch(stock._id, {
          volumeDay: freshStock.volumeDay + order.quantity,
          marketCap: freshStock.currentPrice * freshStock.sharesOutstanding,
        });
        stockCache.set(order.ticker, {
          ...freshStock,
          volumeDay: freshStock.volumeDay + order.quantity,
        });
      }
    }

    return null;
  },
});

// Expire any PENDING limit order whose `expiresAtMacroTick` has been
// reached. Triggered from priceEngine.applyMacroSentiment after each
// macro-tick advances. Refunds BUY escrow, logs a transaction so users
// see why the order is gone.
export const expirePendingOrders = internalMutation({
  args: { asOfMacroTick: v.number() },
  returns: v.null(),
  handler: async (ctx, { asOfMacroTick }) => {
    const all = await ctx.db.query("orders").collect();
    const expired = all.filter(
      (o) =>
        o.status === "PENDING" &&
        o.expiresAtMacroTick != null &&
        o.expiresAtMacroTick <= asOfMacroTick,
    );
    if (expired.length === 0) return null;

    const now = Date.now();
    for (const order of expired) {
      const investor = await ctx.db.get(order.investorId);
      let balanceAfter = investor?.balance ?? 0;
      if (
        investor &&
        order.side === "BUY" &&
        order.pricingType === "LIMIT"
      ) {
        const escrow = +((order.limitPrice ?? order.price) * order.quantity).toFixed(2);
        balanceAfter = +(investor.balance + escrow).toFixed(2);
        await ctx.db.patch(investor._id, { balance: balanceAfter });
        await ctx.db.insert("transactions", {
          investorId: investor._id,
          type: "BUY",
          ticker: order.ticker,
          stockName: order.stockName,
          quantity: 0,
          price: order.limitPrice ?? order.price,
          amount: escrow,
          balanceAfter,
          description: `Limit BUY ${order.quantity} ${order.ticker} @ ₹${fmtINR(order.limitPrice ?? order.price)} expired (refunded ₹${fmtINR(escrow)}).`,
          timestamp: now,
        });
      } else if (investor) {
        await ctx.db.insert("transactions", {
          investorId: investor._id,
          type: "SELL",
          ticker: order.ticker,
          stockName: order.stockName,
          quantity: 0,
          price: order.limitPrice ?? order.price,
          amount: 0,
          balanceAfter,
          description: `Limit SELL ${order.quantity} ${order.ticker} @ ₹${fmtINR(order.limitPrice ?? order.price)} expired unfilled.`,
          timestamp: now,
        });
      }
      await ctx.db.patch(order._id, { status: "EXPIRED" });
    }
    return null;
  },
});

// Cancel every PENDING order — called when the market closes so escrows
// don't sit indefinitely.
export const cancelAllPendingOrders = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const all = await ctx.db.query("orders").collect();
    const pending = all.filter((o) => o.status === "PENDING");
    for (const order of pending) {
      if (order.side === "BUY" && order.pricingType === "LIMIT") {
        const investor = await ctx.db.get(order.investorId);
        if (investor) {
          const escrow = +((order.limitPrice ?? order.price) * order.quantity).toFixed(2);
          await ctx.db.patch(investor._id, {
            balance: +(investor.balance + escrow).toFixed(2),
          });
        }
      }
      await ctx.db.patch(order._id, { status: "CANCELLED" });
    }
    return null;
  },
});

// ── Portfolio ─────────────────────────────────────────────────────────────────

export const getPortfolio = query({
  args: { tokenHash: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      balance: v.number(),
      cashAvailable: v.number(),
      cashLocked: v.number(),
      holdings: v.array(
        v.object({
          ticker: v.string(),
          stockName: v.string(),
          quantity: v.number(),
          avgPrice: v.number(),
          currentPrice: v.number(),
          totalCost: v.number(),
          currentValue: v.number(),
          unrealisedPL: v.number(),
          unrealisedPLPct: v.number(),
          changeDay: v.number(),
          changePctDay: v.number(),
        }),
      ),
      totalInvested: v.number(),
      currentPortfolioValue: v.number(),
      totalPL: v.number(),
      totalPLPct: v.number(),
    }),
  ),
  handler: async (ctx, { tokenHash }) => {
    const investor = await investorFromSession(ctx, tokenHash);
    if (!investor) return null;

    const positions = await ctx.db
      .query("portfolio")
      .withIndex("by_investor", (q) => q.eq("investorId", investor._id))
      .collect();

    // Sum escrows held by PENDING BUY LIMITs so the UI can show
    // "₹X available · ₹Y locked in pending orders".
    const myOrders = await ctx.db
      .query("orders")
      .withIndex("by_investor", (q) => q.eq("investorId", investor._id))
      .collect();
    const cashLocked = +myOrders
      .filter(
        (o) => o.status === "PENDING" && o.side === "BUY" && o.pricingType === "LIMIT",
      )
      .reduce((sum, o) => sum + (o.limitPrice ?? o.price) * o.quantity, 0)
      .toFixed(2);

    let totalInvested = 0;
    let currentPortfolioValue = 0;

    const holdings = await Promise.all(
      positions.map(async (pos) => {
        const stock = await ctx.db
          .query("stocks")
          .withIndex("by_ticker", (q) => q.eq("ticker", pos.ticker))
          .unique();
        const currentPrice = stock?.currentPrice ?? pos.avgPrice;
        const currentValue = +(currentPrice * pos.quantity).toFixed(2);
        const unrealisedPL = +(currentValue - pos.totalCost).toFixed(2);
        const unrealisedPLPct = pos.totalCost > 0
          ? +((unrealisedPL / pos.totalCost) * 100).toFixed(2)
          : 0;

        totalInvested += pos.totalCost;
        currentPortfolioValue += currentValue;

        return {
          ticker: pos.ticker,
          stockName: pos.stockName,
          quantity: pos.quantity,
          avgPrice: pos.avgPrice,
          currentPrice,
          totalCost: pos.totalCost,
          currentValue,
          unrealisedPL,
          unrealisedPLPct,
          changeDay: stock?.changeDay ?? 0,
          changePctDay: stock?.changePctDay ?? 0,
        };
      }),
    );

    const totalPL = +(currentPortfolioValue - totalInvested).toFixed(2);
    const totalPLPct = totalInvested > 0
      ? +((totalPL / totalInvested) * 100).toFixed(2)
      : 0;

    return {
      balance: investor.balance,
      cashAvailable: investor.balance,
      cashLocked,
      holdings: holdings.sort((a, b) => b.currentValue - a.currentValue),
      totalInvested: +totalInvested.toFixed(2),
      currentPortfolioValue: +currentPortfolioValue.toFixed(2),
      totalPL,
      totalPLPct,
    };
  },
});

// ── Orders ────────────────────────────────────────────────────────────────────

export const getOrders = query({
  args: { tokenHash: v.string(), limit: v.optional(v.number()) },
  returns: v.union(
    v.null(),
    v.array(
      v.object({
        id: v.id("orders"),
        ticker: v.string(),
        stockName: v.string(),
        side: v.union(v.literal("BUY"), v.literal("SELL")),
        orderType: v.union(v.literal("DELIVERY"), v.literal("INTRADAY")),
        pricingType: v.union(v.literal("MARKET"), v.literal("LIMIT")),
        quantity: v.number(),
        price: v.number(),
        limitPrice: v.union(v.number(), v.null()),
        total: v.number(),
        status: v.union(
          v.literal("COMPLETED"),
          v.literal("PENDING"),
          v.literal("CANCELLED"),
          v.literal("EXPIRED"),
        ),
        timestamp: v.number(),
        expiresAtMacroTick: v.union(v.number(), v.null()),
        ticksUntilExpiry: v.union(v.number(), v.null()),
      }),
    ),
  ),
  handler: async (ctx, { tokenHash, limit = 50 }) => {
    const investor = await investorFromSession(ctx, tokenHash);
    if (!investor) return null;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_investor_time", (q) => q.eq("investorId", investor._id))
      .order("desc")
      .take(limit);

    const state = await ctx.db.query("marketState").first();
    const currentMacroTick = state?.currentMacroTick ?? 0;

    return orders.map((o) => ({
      id: o._id,
      ticker: o.ticker,
      stockName: o.stockName,
      side: o.side,
      orderType: o.orderType,
      pricingType: o.pricingType,
      quantity: o.quantity,
      price: o.price,
      limitPrice: o.limitPrice ?? null,
      total: o.total,
      status: o.status,
      timestamp: o.timestamp,
      expiresAtMacroTick: o.expiresAtMacroTick ?? null,
      ticksUntilExpiry:
        o.status === "PENDING" && o.expiresAtMacroTick != null
          ? Math.max(0, o.expiresAtMacroTick - currentMacroTick)
          : null,
    }));
  },
});

// ── Transactions ──────────────────────────────────────────────────────────────

export const getTransactions = query({
  args: { tokenHash: v.string(), limit: v.optional(v.number()) },
  returns: v.union(
    v.null(),
    v.array(
      v.object({
        id: v.id("transactions"),
        type: v.union(v.literal("BUY"), v.literal("SELL"), v.literal("DEPOSIT")),
        ticker: v.union(v.string(), v.null()),
        stockName: v.union(v.string(), v.null()),
        quantity: v.union(v.number(), v.null()),
        price: v.union(v.number(), v.null()),
        amount: v.number(),
        balanceAfter: v.number(),
        description: v.string(),
        timestamp: v.number(),
      }),
    ),
  ),
  handler: async (ctx, { tokenHash, limit = 100 }) => {
    const investor = await investorFromSession(ctx, tokenHash);
    if (!investor) return null;

    const txns = await ctx.db
      .query("transactions")
      .withIndex("by_investor_time", (q) => q.eq("investorId", investor._id))
      .order("desc")
      .take(limit);

    return txns.map((t) => ({
      id: t._id,
      type: t.type,
      ticker: t.ticker ?? null,
      stockName: t.stockName ?? null,
      quantity: t.quantity ?? null,
      price: t.price ?? null,
      amount: t.amount,
      balanceAfter: t.balanceAfter,
      description: t.description,
      timestamp: t.timestamp,
    }));
  },
});

// ── Holding for a single stock ─────────────────────────────────────────────────

export const getHolding = query({
  args: { tokenHash: v.string(), ticker: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      quantity: v.number(),
      avgPrice: v.number(),
      totalCost: v.number(),
    }),
  ),
  handler: async (ctx, { tokenHash, ticker }) => {
    const investor = await investorFromSession(ctx, tokenHash);
    if (!investor) return null;
    const pos = await ctx.db
      .query("portfolio")
      .withIndex("by_investor_ticker", (q) =>
        q.eq("investorId", investor._id).eq("ticker", ticker.toUpperCase()),
      )
      .unique();
    if (!pos) return null;
    return { quantity: pos.quantity, avgPrice: pos.avgPrice, totalCost: pos.totalCost };
  },
});
