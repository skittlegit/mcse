"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Newspaper, ArrowLeft } from "lucide-react";
import { newsItems, formatRelativeTime, allStocksEnriched } from "@/lib/mockData";

const tickers = ["ALL", ...Array.from(new Set(newsItems.map((n) => n.ticker)))];

export default function NewsPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? newsItems : newsItems.filter((n) => n.ticker === filter)),
    [filter]
  );

  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Newspaper size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">NEWS</h1>
        </div>
      </div>

      {/* Ticker filter */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {tickers.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-[9px] tracking-[0.1em] px-3 py-1.5 border transition-colors ${
              filter === t ? "border-white/50 text-white" : "border-white/8 text-white/30 hover:border-white/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <p className="text-[9px] tracking-[0.2em] text-white/25 mb-3">{filtered.length} STORIES</p>

      <div className="space-y-3">
        {filtered.map((news, i) => {
          const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);

          return (
            <motion.div
              key={`${news.ticker}-${i}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/stock/${news.ticker}`}
                className="block border border-white/8 p-5 hover:bg-white/[0.03] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[8px] tracking-[0.1em] text-white/40">{news.ticker.slice(0, 3)}</span>
                    </div>
                    <div>
                      <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{news.name}</p>
                      {stock && (
                        <p className="text-[9px] text-white/25">{stock.sector}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]">{"\u20B9"}{news.price.toFixed(2)}</p>
                    <p className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-white/40 leading-relaxed mb-2">{news.headline}</p>
                <p className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
