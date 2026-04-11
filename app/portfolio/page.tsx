"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";
import { holdings, investments } from "@/lib/mockData";

type PortfolioTab = "HOLDINGS" | "POSITIONS";

export default function PortfolioPage() {
  const { isLoggedIn } = useAuth();
  const { orders, positions } = useTrading();
  const [tab, setTab] = useState<PortfolioTab>("HOLDINGS");

  if (!isLoggedIn) {
    return (
      <div className="py-6">
        <LoginPrompt message="Log in to view your portfolio." />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Sub-tabs */}
      <div className="flex items-center gap-0 mb-6">
        {(["HOLDINGS", "POSITIONS"] as PortfolioTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-[11px] tracking-[0.15em] border transition-all duration-150 ${
              tab === t
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "HOLDINGS" ? (
        /* Holdings content */
        holdings.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Portfolio summary */}
            <div className="border border-white/10 p-5 mb-5">
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">PORTFOLIO VALUE</p>
              <p className="font-[var(--font-anton)] text-2xl tracking-tight mb-3">
                {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </p>
              <div className="flex items-center gap-5">
                <span className="text-[11px] text-white/50">
                  1D: <span className="text-[#00D26A]">+{"\u20B9"}{investments.dayReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (+{investments.dayReturnsPercent.toFixed(2)}%)</span>
                </span>
                <span className="text-[11px] text-white/50">
                  Total: <span className="text-[#00D26A]">+{"\u20B9"}{investments.totalReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (+{investments.totalReturnsPercent.toFixed(2)}%)</span>
                </span>
              </div>
            </div>

            {/* Holdings list */}
            <div className="space-y-2">
              {holdings.map((h, i) => (
                <motion.div
                  key={h.ticker}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.3 }}
                >
                  <Link
                    href={`/stock/${h.ticker}`}
                    className="block border border-white/8 p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{h.ticker}</span>
                        <p className="text-[10px] text-white/40 mt-0.5">{h.name}</p>
                      </div>
                      <span className={`font-[var(--font-anton)] text-[14px] ${h.returns >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {h.returns >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(h.returns)).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-white/50">{h.qty} shares @ {"\u20B9"}{Math.round(h.avgPrice).toLocaleString("en-IN")}</p>
                      <p className={`text-[11px] font-medium ${h.returnsPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/holdings"
              className="block text-center mt-4 py-3 text-[10px] tracking-[0.15em] text-white/40 border border-white/10 hover:text-white hover:border-white transition-all"
            >
              VIEW DETAILED HOLDINGS
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <h2 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase mb-2">NO HOLDINGS</h2>
            <p className="text-[11px] text-white/40 mb-4">Start investing to see your holdings here.</p>
            <Link href="/" className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold border border-white hover:bg-transparent hover:text-white transition-all">
              EXPLORE STOCKS
            </Link>
          </div>
        )
      ) : (
        /* Positions content */
        positions.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* P&L summary */}
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

            <div className="space-y-2">
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

            <Link
              href="/positions"
              className="block text-center mt-4 py-3 text-[10px] tracking-[0.15em] text-white/40 border border-white/10 hover:text-white hover:border-white transition-all"
            >
              VIEW DETAILED POSITIONS
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <h2 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase mb-2">NO OPEN POSITIONS</h2>
            <p className="text-[11px] text-white/40 mb-4">Place a buy order to start trading.</p>
            <Link href="/" className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold border border-white hover:bg-transparent hover:text-white transition-all">
              EXPLORE STOCKS
            </Link>
          </div>
        )
      )}
    </div>
  );
}
