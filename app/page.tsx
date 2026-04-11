"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Target, Layers, ScanLine, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";
import {
  mostTraded,
  topGainers,
  topLosers,
  volumeShockers,
  productsAndTools,
  newsItems,
  formatRelativeTime,
  type MoverStock,
} from "@/lib/mockData";

const iconMap: Record<string, React.ElementType> = {
  target: Target, layers: Layers,
  scan: ScanLine, calendar: Calendar,
};

type MoverTab = "GAINERS" | "LOSERS" | "VOLUME";
type MoverSortKey = "ticker" | "price" | "dayChangePercent" | "volume";
type SortDir = "asc" | "desc";

const filteredProducts = productsAndTools.filter(
  (p) => !["BONDS", "STOCKS SIP", "MTF STOCKS"].includes(p.label)
);

const productRoutes: Record<string, string> = {
  "IPO": "/ipo",
  "ETFs": "/etfs",
  "INTRADAY SCREENER": "/screener",
  "EVENTS CALENDAR": "/events",
};

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<MoverTab>("GAINERS");
  const [moverSort, setMoverSort] = useState<MoverSortKey>("dayChangePercent");
  const [moverSortDir, setMoverSortDir] = useState<SortDir>("desc");

  const currentMovers = useMemo(() => {
    const moverData: Record<MoverTab, MoverStock[]> = {
      GAINERS: topGainers,
      LOSERS: topLosers,
      VOLUME: volumeShockers,
    };
    const arr = [...moverData[activeTab]];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (moverSort === "ticker") { av = a.ticker; bv = b.ticker; }
      else if (moverSort === "volume") {
        av = parseFloat(a.volume); bv = parseFloat(b.volume);
      }
      else { av = a[moverSort]; bv = b[moverSort]; }
      if (typeof av === "string") return moverSortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return moverSortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [activeTab, moverSort, moverSortDir]);

  function toggleMoverSort(key: MoverSortKey) {
    if (moverSort === key) setMoverSortDir(d => d === "asc" ? "desc" : "asc");
    else { setMoverSort(key); setMoverSortDir("desc"); }
  }

  function sortIcon(col: MoverSortKey) {
    return moverSort === col
      ? moverSortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />;
  }

  return (
    <div className="py-6">
      {/* Desktop: 2-column grid (60% / 40%) */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          {/* TOP MOVERS TODAY */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-9 md:mb-10"
          >
            <h2 className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.1em] uppercase mb-5">
              TOP MOVERS TODAY
            </h2>

            <div className="flex items-center gap-0 mb-5 overflow-x-auto scrollbar-hide">
              {(["GAINERS", "LOSERS", "VOLUME"] as MoverTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-[10px] tracking-[0.15em] border transition-all duration-150 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-black border-white"
                      : "bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white"
                  }`}
                >
                  {tab === "VOLUME" ? "VOLUME SHOCKERS" : tab}
                </button>
              ))}
            </div>

            {/* Mobile: sort + card list */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[9px] tracking-[0.15em] text-white/30 uppercase">SORT BY</span>
                <select
                  value={moverSort}
                  onChange={(e) => { setMoverSort(e.target.value as MoverSortKey); setMoverSortDir("desc"); }}
                  className="bg-transparent border border-white/15 text-[10px] tracking-[0.1em] text-white/60 px-3 py-1.5 outline-none appearance-none cursor-pointer"
                  style={{ fontSize: '16px' }}
                >
                  <option value="ticker" className="bg-[#0a0a0a]">NAME</option>
                  <option value="price" className="bg-[#0a0a0a]">PRICE</option>
                  <option value="dayChangePercent" className="bg-[#0a0a0a]">CHANGE %</option>
                  <option value="volume" className="bg-[#0a0a0a]">VOLUME</option>
                </select>
              </div>
              <div className="space-y-2">
              {currentMovers.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="flex items-center gap-4 bg-white/[0.02] border border-white/6 p-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
                >
                  <div className="w-11 h-11 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[9px] tracking-[0.1em] text-white/40">{stock.ticker.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                    <p className="text-[11px] text-white/40 truncate mt-0.5">{stock.name}</p>
                  </div>
                  <Sparkline data={stock.sparkline} width={52} height={22} positive={stock.dayChangePercent >= 0} />
                  <div className="text-right shrink-0 min-w-[80px]">
                    <p className="font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[11px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              ))}
              </div>
            </div>

            {/* Desktop table with sortable headers */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-2 border-b border-white/12">
                <button onClick={() => toggleMoverSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
                  COMPANY {sortIcon("ticker")}
                </button>
                <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
                <button onClick={() => toggleMoverSort("price")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
                  MKT PRICE {sortIcon("price")}
                </button>
                <button onClick={() => toggleMoverSort("volume")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
                  VOLUME {sortIcon("volume")}
                </button>
              </div>
              {currentMovers.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stock/${stock.ticker}`}
                  className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
                >
                  <div>
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{stock.name}</p>
                  </div>
                  <div className="flex justify-end">
                    <Sparkline data={stock.sparkline} width={80} height={24} positive={stock.dayChangePercent >= 0} />
                  </div>
                  <div className="text-right">
                    <p className="font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className={`text-[10px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-white/40">{stock.volume}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* MOST TRADED (desktop only, below movers) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="hidden md:block mb-10"
          >
            <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-4">
              MOST TRADED
            </h2>
            <div className="grid grid-cols-2 gap-[1px] bg-white/8">
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
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em] mb-1">{s.ticker}</p>
                    <p className="text-[10px] text-white/30 truncate mb-2">{s.name}</p>
                    <p className="font-[var(--font-anton)] text-[14px] mb-0.5">{"\u20B9"}{s.price.toLocaleString("en-IN")}</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* STOCKS IN NEWS TODAY (mobile, below movers) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="md:hidden mt-6 mb-8"
          >
            <Link href="/news" className="flex items-center justify-between mb-5 group">
              <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase">
                STOCKS IN NEWS
              </h2>
              <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors" />
            </Link>
            <div className="space-y-3">
              {newsItems.slice(0, 3).map((news, i) => (
                <Link
                  key={`${news.ticker}-${i}`}
                  href={`/stock/${news.ticker}`}
                  className="block border border-white/8 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{news.name}</p>
                    <p className={`text-[11px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mb-1">{news.headline}</p>
                  <p className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* PRODUCTS & TOOLS (mobile: 2×2 grid) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="md:hidden"
          >
            <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-5">
              QUICK LINKS
            </h2>
            <div className="grid grid-cols-2 gap-[1px] bg-white/8">
              {filteredProducts.map((item) => {
                const Icon = iconMap[item.icon] || Target;
                const route = productRoutes[item.label] || "/";
                return (
                  <Link
                    key={item.label}
                    href={route}
                    className="bg-[#0a0a0a] p-5 flex flex-col items-center gap-3 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                  >
                    <Icon size={20} strokeWidth={1.5} className="text-white/40" />
                    <span className="text-[9px] tracking-[0.12em] text-white/50 text-center leading-tight">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* PRODUCTS & TOOLS (desktop: list) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="hidden md:block mt-8"
          >
            <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-4">PRODUCTS & TOOLS</p>
            <div className="space-y-0">
              {filteredProducts.map((item) => {
                const Icon = iconMap[item.icon] || Target;
                const route = productRoutes[item.label] || "/";
                return (
                  <Link
                    key={item.label}
                    href={route}
                    className="w-full flex items-center justify-between py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={14} strokeWidth={1.5} className="text-[#666] group-hover:text-white transition-colors" />
                      <span className="text-[11px] tracking-[0.1em] text-white/40 group-hover:text-white transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ChevronRight size={10} className="text-[#444]" />
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <aside className="hidden md:block border-l border-white/8 pl-8 min-w-0">
          {/* Latest News */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/news" className="flex items-center justify-between mb-4 group">
              <h3 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50">
                LATEST NEWS
              </h3>
              <ChevronRight size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </Link>
            <div className="space-y-3">
              {newsItems.slice(0, 4).map((news, i) => (
                <Link
                  key={`${news.ticker}-${i}`}
                  href={`/stock/${news.ticker}`}
                  className="block border border-white/8 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-[var(--font-anton)] text-[11px] tracking-[0.05em]">{news.ticker}</span>
                    <span className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed line-clamp-2 mb-1">{news.headline}</p>
                  <p className="text-[9px] text-white/20">{formatRelativeTime(news.timestamp)}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Events */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mb-8"
          >
            <Link href="/events" className="flex items-center justify-between mb-4 group">
              <h3 className="font-[var(--font-anton)] text-sm tracking-[0.12em] uppercase text-white/50">
                UPCOMING EVENTS
              </h3>
              <ChevronRight size={12} className="text-white/20 group-hover:text-white/50 transition-colors" />
            </Link>
            <div className="space-y-2">
              {[
                { day: 15, month: "JUN", title: "MATHSOC ANNUAL MEET", ticker: "MATHSOC", type: "AGM" },
                { day: 18, month: "JUN", title: "ENIGMA Q2 Results", ticker: "ENIGMA", type: "RESULTS" },
                { day: 22, month: "JUN", title: "GASMONKEYS Racing", ticker: "GASMONKEYS", type: "EVENT" },
              ].map((ev, i) => (
                <Link
                  key={i}
                  href={`/stock/${ev.ticker}`}
                  className="flex items-center gap-3 border border-white/6 p-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-10 text-center shrink-0">
                    <p className="text-[8px] tracking-[0.12em] text-white/25">{ev.month}</p>
                    <p className="font-[var(--font-anton)] text-base">{ev.day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white/60 truncate">{ev.title}</p>
                    <p className="text-[9px] text-white/25">{ev.ticker}</p>
                  </div>
                  <span className="text-[8px] tracking-[0.1em] text-white/25 shrink-0">{ev.type}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}
