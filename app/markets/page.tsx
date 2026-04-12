"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import {
  indices,
  topGainers,
  topLosers,
  mostTraded,
  volumeShockers,
  newsItems,
  marketBreadth,
  formatRelativeTime,
} from "@/lib/mockData";

const moversTabsMap = { GAINERS: topGainers, LOSERS: topLosers, VOLUME: volumeShockers };
type MoversTab = keyof typeof moversTabsMap;

export default function MarketsPage() {
  const [moversTab, setMoversTab] = useState<MoversTab>("GAINERS");
  const activeMovers = moversTabsMap[moversTab];
  const totalBreadth = marketBreadth.advances + marketBreadth.declines + marketBreadth.unchanged;
  const advPct = ((marketBreadth.advances / totalBreadth) * 100).toFixed(1);
  const decPct = ((marketBreadth.declines / totalBreadth) * 100).toFixed(1);

  return (
    <div className="py-6 md:py-8 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.1em] uppercase">
            MARKETS
          </h1>
          <p className="text-[10px] tracking-[0.15em] text-white/30 mt-1">LIVE OVERVIEW</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[#00D26A] animate-pulse" />
          <span className="text-[9px] tracking-[0.12em] text-white/30">MARKET OPEN</span>
        </div>
      </div>

      {/* Indices — hero cards */}
      <section className="mb-10">
        <div className="grid gap-[1px] bg-white/8 grid-cols-2 md:grid-cols-5">
          {indices.map((idx, i) => (
            <motion.div
              key={idx.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-bg p-4 md:p-5 group hover:bg-white/[0.02] transition-colors"
            >
              <p className="text-[8px] md:text-[9px] tracking-[0.15em] text-white/30 uppercase mb-2">
                {idx.name}
              </p>
              <p className="font-[var(--font-anton)] text-base md:text-lg tracking-tight mb-0.5">
                {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-medium ${
                    idx.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"
                  }`}
                >
                  {idx.changePercent >= 0 ? "+" : ""}
                  {idx.changePercent.toFixed(2)}%
                </span>
                <span className="text-[9px] text-white/20">
                  {idx.changePercent >= 0 ? "+" : ""}
                  {idx.change.toFixed(2)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Market Breadth */}
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-white/30" />
          <h2 className="text-[9px] tracking-[0.2em] text-white/30 uppercase">MARKET BREADTH</h2>
        </div>
        <div className="flex h-2 w-full overflow-hidden">
          <div
            className="bg-[#00D26A] transition-all"
            style={{ width: `${advPct}%` }}
          />
          <div
            className="bg-white/15 transition-all"
            style={{ width: `${((marketBreadth.unchanged / totalBreadth) * 100).toFixed(1)}%` }}
          />
          <div
            className="bg-[#FF5252] transition-all"
            style={{ width: `${decPct}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-[#00D26A]">{marketBreadth.advances} advances ({advPct}%)</span>
          <span className="text-[9px] text-white/25">{marketBreadth.unchanged} unchanged</span>
          <span className="text-[9px] text-[#FF5252]">{marketBreadth.declines} declines ({decPct}%)</span>
        </div>
      </motion.section>

      {/* Main content: 2-col */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8">
        {/* Left — Tabbed Movers */}
        <div>
          <div className="flex items-center gap-0 mb-4">
            {(Object.keys(moversTabsMap) as MoversTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setMoversTab(tab)}
                className={`px-4 py-2.5 text-[10px] tracking-[0.15em] border-b-2 transition-all duration-150 whitespace-nowrap ${
                  moversTab === tab
                    ? "text-white border-white"
                    : "text-white/40 border-transparent hover:text-white/60"
                }`}
              >
                {tab === "GAINERS" && <TrendingUp size={11} className="inline mr-1.5" />}
                {tab === "LOSERS" && <TrendingDown size={11} className="inline mr-1.5" />}
                {tab === "VOLUME" && <BarChart3 size={11} className="inline mr-1.5" />}
                {tab === "VOLUME" ? "VOLUME SHOCKERS" : tab}
              </button>
            ))}
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-[2fr_60px_1fr_80px] gap-3 px-4 py-2 text-[8px] tracking-[0.15em] text-white/25 uppercase border-b border-white/8 mb-0">
            <span>STOCK</span>
            <span className="text-center">CHART</span>
            <span className="text-right">PRICE</span>
            <span className="text-right">{moversTab === "VOLUME" ? "VOL" : "CHG%"}</span>
          </div>

          <div className="border border-white/8 border-t-0">
            {activeMovers.map((s, i) => (
              <motion.div
                key={`${moversTab}-${s.ticker}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link
                  href={`/stock/${s.ticker}`}
                  className="grid grid-cols-[2fr_60px_1fr_80px] gap-3 items-center px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] tracking-[0.05em] text-white/20 w-4">{i + 1}</span>
                      <div>
                        <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{s.ticker}</p>
                        <p className="text-[9px] text-white/30 truncate">{s.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Sparkline data={s.sparkline} width={44} height={16} positive={s.dayChangePercent >= 0} />
                  </div>
                  <p className="font-[var(--font-anton)] text-[12px] text-right">
                    {"\u20B9"}{s.price.toLocaleString("en-IN")}
                  </p>
                  <div className="text-right">
                    {moversTab === "VOLUME" ? (
                      <span className="text-[10px] font-medium text-white/50">{s.volume}</span>
                    ) : (
                      <span className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Most Traded — ranked list below movers */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-10"
          >
            <h2 className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">MOST TRADED TODAY</h2>
            <div className="space-y-0 border border-white/8">
              {mostTraded.map((s, i) => (
                <Link
                  key={s.ticker}
                  href={`/stock/${s.ticker}`}
                  className="flex items-center gap-4 px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <span className="font-[var(--font-anton)] text-[18px] text-white/10 w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{s.ticker}</p>
                    <p className="text-[9px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-[var(--font-anton)] text-[12px]">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right sidebar — Stocks in News */}
        <aside className="hidden md:block mt-8 md:mt-0">
          <h2 className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">STOCKS IN NEWS</h2>
          <div className="space-y-0">
            {newsItems.slice(0, 6).map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="border-b border-white/6 last:border-0 py-3"
              >
                <p className="text-[11px] text-white/60 leading-relaxed mb-1">{n.headline}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-white/20">{n.name}</span>
                  <span className="text-white/10">&middot;</span>
                  <span className="text-[9px] text-white/15">{formatRelativeTime(n.timestamp)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
