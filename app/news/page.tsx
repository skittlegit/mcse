"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { newsItems, formatRelativeTime, allStocksEnriched } from "@/lib/mockData";

const tickers = ["ALL", ...Array.from(new Set(newsItems.map((n) => n.ticker)))];

export default function NewsPage() {
  const [filter, setFilter] = useState("ALL");

  const filtered = useMemo(
    () => (filter === "ALL" ? newsItems : newsItems.filter((n) => n.ticker === filter)),
    [filter]
  );

  return (
    <div className="py-6">
      <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase mb-6">NEWS</h1>

      {/* Desktop 2-column grid */}
      <div className="md:grid md:grid-cols-[13fr_7fr] md:gap-8">
        {/* Left: News feed */}
        <div>
          {/* Mobile ticker filter */}
          <div className="md:hidden flex flex-wrap gap-1.5 mb-5">
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

        {/* Right sidebar (desktop): Filters + Upcoming Events */}
        <aside className="hidden md:block space-y-6">
          {/* Filter panel */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">FILTER BY STOCK</p>
            <div className="flex flex-wrap gap-1.5">
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
          </div>

          {/* Upcoming Events mini section */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">UPCOMING EVENTS</p>
            <div className="space-y-3">
              {[
                { ticker: "MATHSOC", event: "Annual General Meeting", date: "Jun 15" },
                { ticker: "ENIGMA", event: "Quarterly Results", date: "Jun 18" },
                { ticker: "GASMONKEYS", event: "Racing Event", date: "Jun 22" },
              ].map((ev) => (
                <Link key={ev.ticker} href={`/stock/${ev.ticker}`} className="block hover:bg-white/[0.02] -mx-2 px-2 py-1 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-[var(--font-anton)] text-[11px] tracking-[0.05em]">{ev.ticker}</p>
                      <p className="text-[9px] text-white/30">{ev.event}</p>
                    </div>
                    <span className="text-[9px] text-white/40">{ev.date}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/events"
              className="block mt-3 pt-3 border-t border-white/6 text-[10px] tracking-[0.1em] text-white/30 hover:text-white transition-colors text-center"
            >
              VIEW ALL EVENTS
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
