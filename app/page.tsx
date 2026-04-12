"use client";

import { useState, useMemo, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Target, Layers, ScanLine, Calendar, Landmark, Repeat, TrendingUp as TrendingUpIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const target = new Date("2026-04-24T15:00:00Z"); // 8:30 PM IST
    function tick() {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor(diff / 3600000) % 24,
        minutes: Math.floor(diff / 60000) % 60,
        seconds: Math.floor(diff / 1000) % 60,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="border border-emerald-500/20 mb-8 md:mb-10 relative overflow-hidden"
        >
          {/* Gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-emerald-900/10 to-transparent pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 65% 90% at -5% -5%, rgba(0,210,106,0.18), transparent 65%)" }} />

          <div className="relative z-10">
            {/* Top bar — date + logos + live badge */}
            <div className="flex items-center justify-between px-8 md:px-12 pt-8 md:pt-10">
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <span className="text-[9px] tracking-[0.3em] text-white/30">
                  24 {"\u2014"} 26 APRIL {"\u00B7"} MAHINDRA UNIVERSITY
                </span>
                <span className="hidden sm:flex items-center gap-2.5 ml-1">
                  <a href="https://www.mu-aeon.com" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                    <Image src="/aeon.png" alt="AEON" width={22} height={22} className="object-contain" />
                  </a>
                  <a href="https://mathsoc.in" target="_blank" rel="noopener noreferrer" className="opacity-40 hover:opacity-100 transition-opacity">
                    <Image src="/mathsoc.png" alt="MathSoc" width={22} height={22} className="object-contain" />
                  </a>
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="flex items-center gap-2"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full bg-[#00D26A] opacity-60" />
                  <span className="relative inline-flex h-2 w-2 bg-[#00D26A]" />
                </span>
                <span className="text-[8px] tracking-[0.2em] text-[#00D26A]/70 font-semibold">LIVE</span>
              </motion.div>
            </div>

            {/* Main grid */}
            <div className="grid md:grid-cols-[3fr_2fr]">
              {/* Left: Copy */}
              <div className="px-8 md:px-12 pt-6 pb-8 md:pb-12">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="font-[MonumentExtended] font-extrabold text-2xl sm:text-3xl md:text-[3rem] leading-[1.05] tracking-tight uppercase mb-6"
                >
                  THE EXCHANGE<br />IS LIVE @{" "}
                  <a
                    href="https://www.mu-aeon.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#A855F7] transition-colors duration-300"
                  >
                    AEON &rsquo;26
                  </a>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.4 }}
                  className="text-[12px] md:text-[13px] text-white/40 leading-relaxed max-w-md mb-6"
                >
                  University clubs, listed as equities. Buy shares, trade live across three evenings, and compete for a {""
                  }<span className="text-white/70 font-semibold">{"\u20B9"}70,000</span> prize pool.
                  Entry {"\u20B9"}100 {"—"} free for MU students.
                </motion.p>

                {/* Countdown */}
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mb-8"
                >
                  <p className="text-[8px] tracking-[0.25em] text-white/25 mb-2.5">OPENS APR 24 &#183; 8:30 PM IST</p>
                  <div className="flex items-baseline gap-0">
                    {([
                      { label: "D", value: timeLeft.days },
                      { label: "H", value: timeLeft.hours },
                      { label: "M", value: timeLeft.minutes },
                      { label: "S", value: timeLeft.seconds },
                    ] as { label: string; value: number }[]).map(({ label, value }, i) => (
                      <span key={label} className="flex items-baseline">
                        {i > 0 && <span className="font-[MonumentExtended] text-xl md:text-2xl text-white/20 mx-1.5 leading-none" style={{ lineHeight: 1 }}>:</span>}
                        <span className="flex items-baseline gap-0.5">
                          <span className="font-[MonumentExtended] font-extrabold text-2xl md:text-3xl tabular-nums leading-none" style={{ lineHeight: 1 }}>
                            {String(value).padStart(2, "0")}
                          </span>
                          <span className="text-[7px] tracking-[0.1em] text-white/30 self-end mb-0.5">{label}</span>
                        </span>
                      </span>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-4"
                >
                  <a
                    href="https://www.mu-aeon.com/events?event=mcse"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 text-[10px] tracking-[0.15em] font-semibold bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-300"
                  >
                    REGISTER NOW
                  </a>
                  <Link
                    href="/login"
                    className="px-6 py-3 text-[10px] tracking-[0.15em] font-semibold bg-transparent text-white/50 border border-white/15 hover:text-white hover:border-white transition-all duration-300"
                  >
                    LOG IN
                  </Link>
                </motion.div>
              </div>

              {/* Right: Stats grid (desktop) */}
              <div className="hidden md:grid grid-cols-2 border-l border-white/6">
                {[
                  { label: "SCHEDULE", value: "3 EVENINGS", sub: "8:30 PM onwards" },
                  { label: "ENTRY FEE", value: "\u20B9100", sub: "Free for MU" },
                  { label: "CLUBS LISTED", value: "30+", sub: "Across all schools" },
                  { label: "PRIZE POOL", value: "\u20B970,000", sub: "Top 3 portfolios" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex flex-col justify-center px-8 py-7 ${i < 2 ? "border-b border-white/6" : ""} ${i % 2 === 0 ? "border-r border-white/6" : ""}`}
                  >
                    <span className="text-[8px] tracking-[0.2em] text-white/25 mb-1.5">{stat.label}</span>
                    <span className="font-[var(--font-anton)] text-xl tracking-tight">{stat.value}</span>
                    <span className="text-[9px] text-white/20 mt-1">{stat.sub}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mobile stats strip */}
            <div className="md:hidden grid grid-cols-4 border-t border-white/6">
              {[
                { label: "SCHEDULE", value: "3 EVES" },
                { label: "ENTRY", value: "\u20B9100" },
                { label: "LISTED", value: "30+" },
                { label: "PRIZE", value: "\u20B970K" },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center py-4 ${i < 3 ? "border-r border-white/6" : ""}`}
                >
                  <p className="text-[7px] tracking-[0.15em] text-white/25 mb-0.5">{stat.label}</p>
                  <p className="font-[var(--font-anton)] text-[13px] tracking-tight">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
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
                  className={`px-4 py-2.5 text-[10px] tracking-[0.15em] border-b-2 transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab
                      ? "text-white border-white"
                      : "text-white/40 border-transparent hover:text-white/60"
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
                  className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-300 items-center"
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
