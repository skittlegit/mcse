"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart2 } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import {
  indices,
  topGainers,
  topLosers,
  mostTraded,
  newsItems,
  formatRelativeTime,
} from "@/lib/mockData";

export default function MarketsPage() {
  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <BarChart2 size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">
            MARKETS TODAY
          </h1>
        </div>
      </div>

      {/* Indices Grid */}
      <section className="mb-10">
        <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4">
          INDICES
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/8">
          {indices.map((idx, i) => (
            <motion.div
              key={idx.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#0a0a0a] p-5"
            >
              <p className="text-[9px] tracking-[0.15em] text-white/30 uppercase mb-2">
                {idx.name}
              </p>
              <p className="font-[var(--font-anton)] text-xl tracking-tight mb-1">
                {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
              <p
                className={`text-[11px] font-medium ${
                  idx.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"
                }`}
              >
                {idx.changePercent >= 0 ? "+" : ""}
                {idx.change.toFixed(2)} ({idx.changePercent >= 0 ? "+" : ""}
                {idx.changePercent.toFixed(2)}%)
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Gainers & Losers side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Top Gainers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[#00D26A]" />
            <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50">
              TOP GAINERS
            </h2>
          </div>
          <div className="border border-white/8">
            {topGainers.slice(0, 4).map((s, i) => (
              <motion.div
                key={s.ticker}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link
                  href={`/stock/${s.ticker}`}
                  className="flex items-center gap-4 px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-9 h-9 border border-white/15 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.1em] text-white/35">
                      {s.ticker.slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">
                      {s.ticker}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <div className="shrink-0 mr-2">
                    <Sparkline data={s.sparkline} width={48} height={16} positive />
                  </div>
                  <div className="text-right shrink-0 min-w-[65px]">
                    <p className="font-[var(--font-anton)] text-[12px]">
                      {"\u20B9"}{s.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] font-medium text-[#00D26A]">
                      +{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Losers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={14} className="text-[#FF5252]" />
            <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50">
              TOP LOSERS
            </h2>
          </div>
          <div className="border border-white/8">
            {topLosers.map((s, i) => (
              <motion.div
                key={s.ticker}
                initial={{ opacity: 0, x: 6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link
                  href={`/stock/${s.ticker}`}
                  className="flex items-center gap-4 px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-9 h-9 border border-white/15 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.1em] text-white/35">
                      {s.ticker.slice(0, 3)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">
                      {s.ticker}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <div className="shrink-0 mr-2">
                    <Sparkline data={s.sparkline} width={48} height={16} positive={false} />
                  </div>
                  <div className="text-right shrink-0 min-w-[65px]">
                    <p className="font-[var(--font-anton)] text-[12px]">
                      {"\u20B9"}{s.price.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] font-medium text-[#FF5252]">
                      {s.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>

      {/* Most Traded */}
      <section className="mb-10">
        <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4">
          MOST TRADED ON MCSE
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/8">
          {mostTraded.map((s, i) => (
            <motion.div
              key={s.ticker}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
            >
              <Link
                href={`/stock/${s.ticker}`}
                className="block bg-[#0a0a0a] p-4 hover:bg-white/[0.03] transition-colors"
              >
                <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em] mb-1">
                  {s.ticker}
                </p>
                <p className="text-[10px] text-white/30 truncate mb-2">
                  {s.name}
                </p>
                <p className="font-[var(--font-anton)] text-[14px] mb-0.5">
                  {"\u20B9"}{s.price.toLocaleString("en-IN")}
                </p>
                <p
                  className={`text-[10px] font-medium ${
                    s.dayChangePercent >= 0
                      ? "text-[#00D26A]"
                      : "text-[#FF5252]"
                  }`}
                >
                  {s.dayChangePercent >= 0 ? "+" : ""}
                  {s.dayChangePercent.toFixed(2)}%
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stocks in News */}
      <section>
        <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4">
          STOCKS IN NEWS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {newsItems.map((news, i) => (
            <motion.div
              key={`${news.ticker}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + 0.04 * i }}
            >
              <Link
                href={`/stock/${news.ticker}`}
                className="block border border-white/8 p-5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border border-white/15 flex items-center justify-center shrink-0">
                      <span className="text-[8px] tracking-[0.1em] text-white/35">
                        {news.ticker.slice(0, 3)}
                      </span>
                    </div>
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">
                      {news.name}
                    </p>
                  </div>
                  <p
                    className={`text-[11px] font-medium ${
                      news.dayChangePercent >= 0
                        ? "text-[#00D26A]"
                        : "text-[#FF5252]"
                    }`}
                  >
                    {news.dayChangePercent >= 0 ? "+" : ""}
                    {news.dayChangePercent.toFixed(2)}%
                  </p>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mb-2">
                  {news.headline}
                </p>
                <p className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
