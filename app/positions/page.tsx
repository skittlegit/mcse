"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";

type PageTab = "POSITIONS" | "ORDERS";

export default function PositionsPage() {
  const { isLoggedIn } = useAuth();
  const { orders, positions } = useTrading();
  const [pageTab, setPageTab] = useState<PageTab>("POSITIONS");

  return (
    <div className="py-6">
      {/* Page tabs: POSITIONS | ORDERS */}
      <div className="flex items-center gap-0 mb-6">
        {(["POSITIONS", "ORDERS"] as PageTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setPageTab(tab)}
            className={`px-5 py-2.5 text-[11px] tracking-[0.15em] border-b-2 transition-all duration-150 ${
              pageTab === tab
                ? "text-white border-white"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {tab}
            {tab === "ORDERS" && orders.length > 0 && (
              <span className="ml-2 text-[9px]">({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      <div className="md:grid md:grid-cols-[13fr_7fr] md:gap-8">
      <div>

      {pageTab === "ORDERS" ? (
        /* Orders content */
        isLoggedIn ? (
          orders.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-5">
                ORDER HISTORY ({orders.length})
              </h2>

              {/* Mobile: card list */}
              <div className="md:hidden space-y-2">
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                  >
                    <Link
                      href={`/stock/${order.ticker}`}
                      className="block border border-white/8 p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border ${
                            order.type === "BUY"
                              ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                              : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                          }`}>
                            {order.type}
                          </span>
                          <span className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{order.ticker}</span>
                        </div>
                        <span className="text-[9px] tracking-[0.1em] text-[#00D26A]">{order.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-white/50">{order.qty} shares @ {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          <p className="text-[9px] text-white/25 mt-0.5">{order.orderType} {"\u00B7"} {new Date(order.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <p className="font-[var(--font-anton)] text-[15px]">{"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[60px_1fr_100px_80px_120px_90px] gap-4 px-4 py-2 border-b border-white/12">
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">TYPE</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">STOCK</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">QTY</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">PRICE</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TOTAL</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">STATUS</span>
                </div>
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/stock/${order.ticker}`}
                    className="grid grid-cols-[60px_1fr_100px_80px_120px_90px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
                  >
                    <span className={`text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border w-fit ${
                      order.type === "BUY"
                        ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                        : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                    }`}>
                      {order.type}
                    </span>
                    <div>
                      <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{order.ticker}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{order.name} {"\u00B7"} {order.orderType}</p>
                    </div>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">{order.qty}</p>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="text-right">
                      <span className="text-[9px] tracking-[0.1em] text-[#00D26A]">{order.status}</span>
                      <p className="text-[9px] text-white/20 mt-0.5">{new Date(order.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Orders empty state */
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 md:py-24"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-18 h-18 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-6 relative"
              >
                <div className="w-8 md:w-10 h-[1px] bg-white" />
                <div className="absolute w-[1px] h-8 md:h-10 bg-white" />
                <div className="absolute w-3 md:w-4 h-3 md:h-4 border border-white bottom-1.5 md:bottom-2 left-1.5 md:left-2" />
              </motion.div>
              <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-3">
                NO OPEN ORDERS
              </h1>
              <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
                You have no pending or open orders. Place a buy or sell order to see it here.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
                >
                  EXPLORE STOCKS
                </Link>
                <Link
                  href="/holdings"
                  className="px-6 py-3 text-[10px] tracking-[0.15em] text-white/50 hover:text-white border border-white/20 hover:border-white transition-all duration-150"
                >
                  VIEW HOLDINGS
                </Link>
              </div>
            </motion.div>
          )
        ) : (
          <LoginPrompt message="Log in to view your order history and pending orders." />
        )
      ) : (
        /* Positions content */
        <>
      {isLoggedIn ? (
        positions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-5">
              OPEN POSITIONS ({positions.length})
            </h2>

            {/* Total P&L summary */}
            <div className="border border-white/10 p-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] tracking-[0.15em] text-white/30">TOTAL P&L</span>
                <span className={`font-[var(--font-anton)] text-lg ${
                  positions.reduce((s, p) => s + p.pnl, 0) >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"
                }`}>
                  {positions.reduce((s, p) => s + p.pnl, 0) >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(positions.reduce((s, p) => s + p.pnl, 0))).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Mobile: card list */}
            <div className="md:hidden space-y-2">
              {positions.map((pos, i) => (
                <motion.div
                  key={pos.ticker}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                >
                  <Link
                    href={`/stock/${pos.ticker}`}
                    className="block border border-white/8 p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{pos.ticker}</span>
                        <p className="text-[10px] text-white/40 mt-0.5">{pos.name}</p>
                      </div>
                      <span className={`font-[var(--font-anton)] text-[14px] ${pos.pnl >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {pos.pnl >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(pos.pnl)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-white/50">{pos.qty} shares @ {"\u20B9"}{Math.round(pos.avgPrice).toLocaleString("en-IN")}</p>
                      <p className={`text-[11px] font-medium ${pos.pnlPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-2 border-b border-white/12">
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">STOCK</span>
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">QTY</span>
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">AVG PRICE</span>
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">LTP</span>
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">P&L</span>
              </div>
              {positions.map((pos) => (
                <Link
                  key={pos.ticker}
                  href={`/stock/${pos.ticker}`}
                  className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
                >
                  <div>
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{pos.ticker}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{pos.name}</p>
                  </div>
                  <p className="text-right font-[var(--font-anton)] text-[13px]">{pos.qty}</p>
                  <p className="text-right font-[var(--font-anton)] text-[13px]">
                    {"\u20B9"}{Math.round(pos.avgPrice).toLocaleString("en-IN")}
                  </p>
                  <p className="text-right font-[var(--font-anton)] text-[13px]">
                    {"\u20B9"}{pos.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <div className="text-right">
                    <p className={`font-[var(--font-anton)] text-[13px] ${pos.pnl >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {pos.pnl >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(pos.pnl)).toLocaleString("en-IN")}
                    </p>
                    <p className={`text-[10px] font-medium ${pos.pnlPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-16 md:py-24"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-18 h-18 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-6 relative"
            >
              <div className="w-8 h-8 border border-white rotate-45" />
              <div className="absolute w-3 h-3 bg-white top-2 right-2" />
            </motion.div>
            <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-3">
              NO OPEN POSITIONS
            </h1>
            <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
              You have no open positions. Place a buy order to start trading.
            </p>
            <Link
              href="/"
              className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
            >
              EXPLORE STOCKS
            </Link>
          </motion.div>
        )
      ) : (
        <LoginPrompt message="Log in to view your open positions and intraday trades." />
      )}

        </>
      )}
      </div>{/* end left column */}

      {/* Right sidebar (desktop): P&L Summary */}
      {isLoggedIn && (
        <aside className="hidden md:block space-y-6">
          {/* P&L Summary card */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">INTRADAY SUMMARY</p>
            {positions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[10px] text-white/40">TOTAL P&L</span>
                  <span className={`font-[var(--font-anton)] text-lg ${
                    positions.reduce((s, p) => s + p.pnl, 0) >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"
                  }`}>
                    {positions.reduce((s, p) => s + p.pnl, 0) >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(positions.reduce((s, p) => s + p.pnl, 0))).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-white/40">OPEN POSITIONS</span>
                  <span className="font-[var(--font-anton)] text-sm">{positions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-white/40">TOTAL ORDERS</span>
                  <span className="font-[var(--font-anton)] text-sm">{orders.length}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-white/20">No open positions today</p>
            )}
          </div>

          {/* Quick links */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">QUICK LINKS</p>
            <div className="space-y-2">
              <Link href="/holdings" className="block text-[10px] tracking-[0.1em] text-white/40 hover:text-white transition-colors py-1">VIEW HOLDINGS</Link>
              <Link href="/" className="block text-[10px] tracking-[0.1em] text-white/40 hover:text-white transition-colors py-1">EXPLORE STOCKS</Link>
            </div>
          </div>
        </aside>
      )}
      </div>
    </div>
  );
}
