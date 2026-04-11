"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { useAuth } from "@/lib/AuthContext";
import {
  indices,
  topGainers,
  topLosers,
  mostTraded,
  newsItems,
  formatRelativeTime,
} from "@/lib/mockData";

export default function MarketsPage() {
  const { role } = useAuth();
  const isAdmin = role === "companyAdmin" || role === "totalAdmin";

  return (
    <div className="py-6">
      <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase mb-6">
        MARKETS TODAY
      </h1>

      {/* Indices Grid */}
      <section className="mb-10">
        <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4">
          INDICES
        </h2>
        <div className={`grid gap-[1px] bg-white/8 ${isAdmin ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"}`}>
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

      {/* 3-column grid: Gainers | Losers | Most Traded + News */}
      <div className="md:grid md:grid-cols-3 md:gap-6">
      {/* Top Gainers */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} className="text-[#00D26A]" />
            <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50">
              TOP GAINERS
            </h2>
          </div>
          <div className="border border-white/8">
            {topGainers.slice(0, 5).map((s, i) => (
              <motion.div
                key={s.ticker}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.04 }}
              >
                <Link
                  href={`/stock/${s.ticker}`}
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">
                      {s.ticker}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <Sparkline data={s.sparkline} width={44} height={16} positive />
                  <div className="text-right shrink-0 min-w-[55px]">
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
          <div className="flex items-center gap-2 mb-4 mt-8 md:mt-0">
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
                  className="flex items-center gap-3 px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">
                      {s.ticker}
                    </p>
                    <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <Sparkline data={s.sparkline} width={44} height={16} positive={false} />
                  <div className="text-right shrink-0 min-w-[55px]">
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

        {/* Most Traded + Stocks in News */}
        <section>
          <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4 mt-8 md:mt-0">
            MOST TRADED
          </h2>
          <div className="border border-white/8 mb-6">
            {mostTraded.slice(0, 4).map((s, i) => (
              <motion.div
                key={s.ticker}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
              >
                <Link
                  href={`/stock/${s.ticker}`}
                  className="flex items-center justify-between px-4 py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.03] transition-colors"
                >
                  <div>
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{s.ticker}</p>
                    <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-[var(--font-anton)] text-[12px]">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <h2 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50 mb-4">
            STOCKS IN NEWS
          </h2>
          <div className="space-y-2">
            {newsItems.slice(0, 3).map((news, i) => (
              <motion.div
                key={`${news.ticker}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + 0.04 * i }}
              >
                <Link
                  href={`/stock/${news.ticker}`}
                  className="block border border-white/8 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{news.name}</p>
                    <p className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2 mb-1">{news.headline}</p>
                  <p className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
