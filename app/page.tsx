"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Target, Layers, ScanLine, Calendar, Landmark, Repeat, TrendingUp as TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";
import { usePreferences } from "@/lib/PreferencesContext";
import { useAuth } from "@/lib/AuthContext";
import {
  mostTraded,
  topGainers,
  topLosers,
  volumeShockers,
  productsAndTools,
  newsItems,
  formatRelativeTime,
  investments,
  type MoverStock,
} from "@/lib/mockData";

const iconMap: Record<string, React.ElementType> = {
  target: Target, layers: Layers,
  scan: ScanLine, calendar: Calendar,
  landmark: Landmark, repeat: Repeat,
  "trending-up": TrendingUpIcon,
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
  const { showBalance } = usePreferences();
  const { isLoggedIn } = useAuth();

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
      {/* Marketing hero — non-logged-in users */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="border border-white/10 p-8 md:p-12 mb-8 md:mb-10 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/[0.06] to-transparent pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[9px] tracking-[0.3em] text-white/30 mb-3">MATH CLUB STOCK EXCHANGE</p>
            <h1 className="font-[var(--font-anton)] text-3xl md:text-5xl tracking-[0.04em] uppercase leading-[1.1] mb-4">
              THE EXCHANGE<br />IS LIVE.
            </h1>
            <p className="text-[12px] md:text-[13px] text-white/40 leading-relaxed max-w-md mb-8">
              A simulated trading platform where clubs become companies. Compete, trade, and win up to <span className="text-white/70 font-semibold">{"\u20B9"}70,000</span> in prizes.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.mu-aeon.com/events?event=mcse"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 text-[10px] tracking-[0.15em] font-semibold bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-150"
              >
                REGISTER NOW
              </a>
              <Link
                href="/login"
                className="px-6 py-3 text-[10px] tracking-[0.15em] font-semibold bg-transparent text-white/50 border border-white/15 hover:text-white hover:border-white transition-all duration-150"
              >
                LOG IN
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* Holdings summary strip — logged-in users */}
      {isLoggedIn && showBalance && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            href="/holdings"
            className="flex items-center justify-between mb-6 px-1 py-3 border border-white/6 hover:border-white/15 transition-colors group"
          >
            <div className="flex items-center gap-6 md:gap-10 px-3">
              <div>
                <p className="text-[8px] tracking-[0.2em] text-white/25 mb-0.5">CURRENT VALUE</p>
                <p className="font-[var(--font-anton)] text-base md:text-lg tracking-tight">
                  {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.2em] text-white/25 mb-0.5">INVESTED</p>
                <p className="font-[var(--font-anton)] text-base md:text-lg tracking-tight text-white/60">
                  {"\u20B9"}{investments.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[8px] tracking-[0.2em] text-white/25 mb-0.5">RETURNS</p>
                <p className={`font-[var(--font-anton)] text-base md:text-lg tracking-tight ${investments.totalReturns >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {investments.totalReturns >= 0 ? "+" : ""}{"\u20B9"}{investments.totalReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  <span className="text-[10px] ml-1.5 opacity-70">({investments.totalReturnsPercent >= 0 ? "+" : ""}{investments.totalReturnsPercent.toFixed(2)}%)</span>
                </p>
              </div>
            </div>
            <ChevronRight size={14} className="text-white/15 group-hover:text-white/40 transition-colors mr-2" />
          </Link>
        </motion.div>
      )}

      {/* Products & Tools — full-width feature grid */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-8 md:mb-10"
      >
        <h2 className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.1em] uppercase mb-5">
          PRODUCTS & TOOLS
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/8">
          {filteredProducts.map((item, i) => {
            const Icon = iconMap[item.icon] || Target;
            const route = productRoutes[item.label] || "/";
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.02 * i, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link
                  href={route}
                  className="flex flex-col gap-2.5 bg-bg p-5 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors group h-full"
                >
                  <Icon size={18} strokeWidth={1.5} className="text-white/30 group-hover:text-white/60 transition-colors" />
                  <div>
                    <p className="text-[10px] tracking-[0.12em] text-white/60 group-hover:text-white transition-colors font-medium">{item.label}</p>
                    <p className="text-[9px] text-white/20 mt-0.5 leading-relaxed hidden md:block">{item.description}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Desktop: 2-column grid (60% / 40%) */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8">
        {/* LEFT COLUMN */}
        <div className="min-w-0">
          {/* TOP MOVERS TODAY */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
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
                  <option value="ticker" className="bg-bg">NAME</option>
                  <option value="price" className="bg-bg">PRICE</option>
                  <option value="dayChangePercent" className="bg-bg">CHANGE %</option>
                  <option value="volume" className="bg-bg">VOLUME</option>
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

          {/* MOST TRADED (desktop, below movers) */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
            className="hidden md:block mb-10"
          >
            <h2 className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.1em] uppercase mb-5">
              MOST TRADED
            </h2>
            <div className="space-y-0">
              {mostTraded.map((s) => (
                <Link
                  key={s.ticker}
                  href={`/stock/${s.ticker}`}
                  className="flex items-center justify-between py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors group"
                >
                  <div>
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em]">{s.ticker}</p>
                    <p className="text-[9px] text-white/30">{s.name}</p>
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

          {/* STOCKS IN NEWS TODAY (mobile, below movers) */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
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

        </div>

        {/* RIGHT COLUMN (desktop only) */}
        <aside className="hidden md:block border-l border-white/8 pl-8 min-w-0">
          {/* Latest News */}
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
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
