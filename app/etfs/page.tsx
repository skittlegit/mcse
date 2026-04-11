"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, ChevronDown, PieChart } from "lucide-react";
import Sparkline from "@/components/Sparkline";

interface ETF {
  name: string;
  ticker: string;
  price: number;
  change: number;
  sparkline: number[];
  expenseRatio: number;
  aum: string;
  holdings: { name: string; weight: number }[];
}

const etfs: ETF[] = [
  {
    name: "AEON 50 ETF", ticker: "AEON50ETF", price: 235.40, change: 1.2,
    sparkline: [230, 231, 232, 234, 235, 235, 235],
    expenseRatio: 0.05, aum: "₹1,240 Cr",
    holdings: [
      { name: "MATHSOC", weight: 22 }, { name: "ENIGMA", weight: 18 },
      { name: "MASTERSHOT", weight: 15 }, { name: "GASMONKEYS", weight: 14 },
      { name: "CELESTE", weight: 12 }, { name: "Others", weight: 19 },
    ],
  },
  {
    name: "BANKAEON ETF", ticker: "BANKETF", price: 508.90, change: -0.3,
    sparkline: [512, 511, 510, 509, 509, 509, 508],
    expenseRatio: 0.12, aum: "₹860 Cr",
    holdings: [
      { name: "INSIGHT", weight: 30 }, { name: "ERUDITE", weight: 28 },
      { name: "MATHSOC", weight: 20 }, { name: "Others", weight: 22 },
    ],
  },
  {
    name: "GOLD ETF", ticker: "GOLDETF", price: 62.15, change: 0.8,
    sparkline: [61, 61.2, 61.5, 61.8, 62, 62.1, 62.1],
    expenseRatio: 0.50, aum: "₹310 Cr",
    holdings: [
      { name: "Physical Gold", weight: 95 }, { name: "Cash", weight: 5 },
    ],
  },
  {
    name: "IT SECTOR ETF", ticker: "ITETF", price: 44.80, change: 1.5,
    sparkline: [43, 43.5, 44, 44.2, 44.5, 44.7, 44.8],
    expenseRatio: 0.20, aum: "₹520 Cr",
    holdings: [
      { name: "ENIGMA", weight: 35 }, { name: "CELESTE", weight: 25 },
      { name: "MASTERSHOT", weight: 20 }, { name: "Others", weight: 20 },
    ],
  },
];

export default function ETFsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="pb-20 md:pb-12 py-6">
      <div className="flex items-center gap-3 mb-8">
        <Layers size={18} className="text-white/40" />
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">ETFs</h1>
        <span className="text-[10px] tracking-[0.1em] text-white/25 ml-1">{etfs.length} FUNDS</span>
      </div>

      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8">
        {/* Left: ETF cards */}
        <div className="space-y-2">
          {etfs.map((etf) => {
            const isOpen = expanded === etf.ticker;
            return (
              <motion.div
                key={etf.ticker}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-white/6 overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : etf.ticker)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.1em] text-white/40">{etf.ticker.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{etf.name}</p>
                    <p className="text-[10px] text-white/40">{etf.ticker}</p>
                  </div>
                  {/* Desktop inline metrics */}
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[9px] tracking-[0.1em] text-white/20">EXP RATIO</p>
                      <p className="text-[12px] text-white/50">{etf.expenseRatio.toFixed(2)}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] tracking-[0.1em] text-white/20">AUM</p>
                      <p className="text-[12px] text-white/50">{etf.aum}</p>
                    </div>
                  </div>
                  <Sparkline data={etf.sparkline} width={52} height={22} positive={etf.change >= 0} />
                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{etf.price.toFixed(2)}</p>
                    <p className={`text-[11px] font-medium ${etf.change >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {etf.change >= 0 ? "+" : ""}{etf.change.toFixed(2)}%
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-white/25 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-white/6 pt-4">
                        {/* Mobile-only metrics (shown inline on desktop) */}
                        <div className="flex items-center gap-6 mb-4 md:hidden">
                          <div>
                            <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">EXPENSE RATIO</p>
                            <p className="text-[12px] text-white/60">{etf.expenseRatio.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">AUM</p>
                            <p className="text-[12px] text-white/60">{etf.aum}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3">
                          <PieChart size={11} className="text-white/25" />
                          <p className="text-[9px] tracking-[0.15em] text-white/25">TOP HOLDINGS</p>
                        </div>
                        <div className="space-y-1.5">
                          {etf.holdings.map((h) => (
                            <div key={h.name} className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-white/6 overflow-hidden">
                                <div className="h-full bg-white/20" style={{ width: `${h.weight}%` }} />
                              </div>
                              <span className="text-[10px] text-white/50 w-24 truncate">{h.name}</span>
                              <span className="text-[10px] text-white/30 w-8 text-right">{h.weight}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Right sidebar (desktop): Education + comparison */}
        <aside className="hidden md:block space-y-6">
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">WHAT ARE ETFs?</p>
            <p className="text-[12px] text-white/40 leading-relaxed">
              Exchange-Traded Funds are investment funds traded on stock exchanges, holding a diversified basket of assets. They offer low-cost exposure to indices, sectors, or commodities.
            </p>
          </div>

          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-4">COMPARISON</p>
            <div className="space-y-0">
              {/* Header */}
              <div className="grid grid-cols-[1fr_80px_70px_80px] gap-2 pb-2 border-b border-white/10">
                <span className="text-[9px] tracking-[0.15em] text-white/20">FUND</span>
                <span className="text-[9px] tracking-[0.15em] text-white/20 text-right">PRICE</span>
                <span className="text-[9px] tracking-[0.15em] text-white/20 text-right">EXP %</span>
                <span className="text-[9px] tracking-[0.15em] text-white/20 text-right">AUM</span>
              </div>
              {etfs.map((etf) => (
                <div key={etf.ticker} className="grid grid-cols-[1fr_80px_70px_80px] gap-2 py-2.5 border-b border-white/6">
                  <div>
                    <p className="text-[11px] text-white/60 truncate">{etf.name}</p>
                  </div>
                  <p className="text-[11px] text-white/50 text-right font-[var(--font-anton)]">{"\u20B9"}{etf.price.toFixed(2)}</p>
                  <p className="text-[11px] text-white/40 text-right">{etf.expenseRatio.toFixed(2)}%</p>
                  <p className="text-[11px] text-white/40 text-right">{etf.aum}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">KEY TERMS</p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-white/50 font-medium">Expense Ratio</p>
                <p className="text-[10px] text-white/25 mt-0.5">Annual fee charged by the fund, expressed as a percentage of assets.</p>
              </div>
              <div>
                <p className="text-[11px] text-white/50 font-medium">AUM</p>
                <p className="text-[10px] text-white/25 mt-0.5">Assets Under Management — the total market value of the fund&apos;s investments.</p>
              </div>
              <div>
                <p className="text-[11px] text-white/50 font-medium">NAV</p>
                <p className="text-[10px] text-white/25 mt-0.5">Net Asset Value — the per-unit value of the fund, calculated at end of day.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
