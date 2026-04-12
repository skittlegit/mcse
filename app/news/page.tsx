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

  const featured = filtered[0];
  const rest = filtered.slice(1);
  const featuredStock = featured ? allStocksEnriched.find((s) => s.ticker === featured.ticker) : null;

  return (
    <div className="py-6">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">NEWS</h1>
        <span className="text-[9px] tracking-[0.2em] text-white/20">{filtered.length} STORIES</span>
      </div>

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
                className={`text-[9px] tracking-[0.1em] px-3 py-1.5 border-b-2 transition-colors ${
                  filter === t ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/60"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Featured story */}
          {featured && (
            <motion.div
              key={`featured-${featured.ticker}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Link
                href={`/stock/${featured.ticker}`}
                className="block border border-white/10 hover:border-white/20 transition-colors duration-300"
              >
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-[var(--font-anton)] text-[11px] tracking-[0.08em]">{featured.name}</span>
                    <span className="text-[8px] tracking-[0.1em] text-white/25 border border-white/10 px-2 py-0.5">
                      {featured.ticker}
                    </span>
                    {featuredStock && (
                      <span className="text-[8px] tracking-[0.1em] text-white/20">{featuredStock.sector}</span>
                    )}
                  </div>
                  <p className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.02em] leading-tight mb-4 max-w-lg">
                    {featured.headline}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-white/50">
                      {"\u20B9"}{featured.price.toFixed(2)}
                    </span>
                    <span className={`text-[11px] font-medium ${featured.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {featured.dayChangePercent >= 0 ? "+" : ""}{featured.dayChangePercent.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-white/20 ml-auto">{formatRelativeTime(featured.timestamp)}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Rest of stories — compact list */}
          <div>
            {rest.map((news, i) => {
              const stock = allStocksEnriched.find((s) => s.ticker === news.ticker);
              return (
                <motion.div
                  key={`${news.ticker}-${i}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={`/stock/${news.ticker}`}
                    className="flex items-start gap-4 py-4 border-b border-white/6 hover:bg-white/[0.02] transition-colors duration-300 -mx-2 px-2"
                  >
                    <div className={`w-0.5 h-10 shrink-0 mt-0.5 ${news.dayChangePercent >= 0 ? "bg-[#00D26A]/40" : "bg-[#FF5252]/40"}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-[var(--font-anton)] text-[10px] tracking-[0.06em]">{news.ticker}</span>
                        {stock && (
                          <span className="text-[8px] text-white/20">{stock.sector}</span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/45 leading-relaxed line-clamp-2">{news.headline}</p>
                    </div>
                    <div className="shrink-0 text-right pt-0.5">
                      <p className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                      </p>
                      <p className="text-[9px] text-white/20 mt-0.5">{formatRelativeTime(news.timestamp)}</p>
                    </div>
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
