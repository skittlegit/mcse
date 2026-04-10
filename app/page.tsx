"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Target, Layers, ScanLine, Calendar } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import Sparkline from "@/components/Sparkline";
import { useAuth } from "@/lib/AuthContext";
import {
  investments,
  mostTraded,
  topGainers,
  topLosers,
  volumeShockers,
  productsAndTools,
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
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<MoverTab>("GAINERS");
  const [moverSort, setMoverSort] = useState<MoverSortKey>("dayChangePercent");
  const [moverSortDir, setMoverSortDir] = useState<SortDir>("desc");

  const moverData: Record<MoverTab, MoverStock[]> = {
    GAINERS: topGainers,
    LOSERS: topLosers,
    VOLUME: volumeShockers,
  };

  const currentMovers = useMemo(() => {
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

  const SortIcon = ({ col }: { col: MoverSortKey }) => (
    moverSort === col
      ? moverSortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />
  );

  return (
    <div className="flex gap-0 pb-20 md:pb-12">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-5 md:px-6 py-6 md:py-6">

        {/* Mobile: Investment Summary (only when logged in) */}
        {isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="lg:hidden mb-7 border border-white/10 p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase">YOUR INVESTMENTS</p>
            <Link href="/holdings" className="text-[10px] tracking-[0.15em] text-white/40 hover:text-white flex items-center gap-1">
              VIEW ALL <ChevronRight size={10} />
            </Link>
          </div>
          <p className="font-[var(--font-anton)] text-3xl tracking-tight mb-3">
            {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-5">
            <span className="text-[11px] text-white/50">
              1D: <span className="text-[#00D26A]">+{"\u20B9"}{investments.dayReturns.toLocaleString("en-IN")} (+{investments.dayReturnsPercent.toFixed(2)}%)</span>
            </span>
            <span className="text-[11px] text-white/50">
              Total: <span className="text-[#00D26A]">+{"\u20B9"}{investments.totalReturns.toLocaleString("en-IN")} (+{investments.totalReturnsPercent.toFixed(2)}%)</span>
            </span>
          </div>
        </motion.div>
        )}

        {/* MOST TRADED */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mb-9 md:mb-10"
        >
          <div className="flex items-center justify-between mb-5 md:mb-5">
            <h2 className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.1em] uppercase">
              MOST TRADED
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/8">
            {mostTraded.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="bg-[#0a0a0a] p-5 md:p-5 hover:bg-white/[0.03] transition-colors duration-150 active:bg-white/[0.06]"
              >
                <div className="w-10 h-10 border border-white/25 flex items-center justify-center mb-3">
                  <span className="text-[9px] tracking-[0.1em] text-white/50">
                    {stock.ticker.slice(0, 3)}
                  </span>
                </div>
                <p className="font-[var(--font-anton)] text-[11px] tracking-[0.08em] mb-1.5 truncate">
                  {stock.name.toUpperCase()}
                </p>
                <p className="font-[var(--font-anton)] text-xl md:text-2xl tracking-tight">
                  {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[11px] mt-1.5 font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {stock.dayChangePercent >= 0 ? "+" : ""}
                  {stock.dayChangePercent.toFixed(2)}%
                </p>
              </Link>
            ))}
          </div>
        </motion.div>

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

          {/* Mobile: card list */}
          <div className="md:hidden space-y-2">
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

          {/* Desktop table with sortable headers */}
          <div className="hidden md:block">
            <div className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-2 border-b border-white/12">
              <button onClick={() => toggleMoverSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
                COMPANY <SortIcon col="ticker" />
              </button>
              <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
              <button onClick={() => toggleMoverSort("price")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
                MKT PRICE <SortIcon col="price" />
              </button>
              <button onClick={() => toggleMoverSort("volume")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
                VOLUME <SortIcon col="volume" />
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

        {/* PRODUCTS & TOOLS (mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="lg:hidden"
        >
          <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-5">
            PRODUCTS & TOOLS
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
      </div>

      {/* Right sidebar (desktop) */}
      <aside className="hidden lg:block w-80 border-l border-white/8 shrink-0">
        {isLoggedIn ? (
        <div className="p-6 border-b border-white/8">
          <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-3">YOUR INVESTMENTS</p>
          <p className="text-[9px] tracking-[0.2em] text-white/40 mb-1">CURRENT VALUE</p>
          <p className="font-[var(--font-anton)] text-3xl tracking-tight mb-4">
            {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-white/40">1D RETURNS</span>
              <span className="text-[12px] font-[var(--font-anton)] text-[#00D26A]">
                +{"\u20B9"}{investments.dayReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                <span className="text-[#00D26A]/60 ml-1 text-[10px]">(+{investments.dayReturnsPercent.toFixed(2)}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-white/40">TOTAL RETURNS</span>
              <span className="text-[12px] font-[var(--font-anton)] text-[#00D26A]">
                +{"\u20B9"}{investments.totalReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                <span className="text-[#00D26A]/60 ml-1 text-[10px]">(+{investments.totalReturnsPercent.toFixed(2)}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-white/40">INVESTED</span>
              <span className="text-[12px] font-[var(--font-anton)] text-white">
                {"\u20B9"}{investments.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
        ) : (
        <div className="p-6 border-b border-white/8">
          <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-4">ACCOUNT</p>
          <p className="text-[11px] text-white/40 leading-relaxed mb-4">
            Log in to view your investments, holdings, and portfolio performance.
          </p>
          <Link
            href="/login"
            className="block w-full py-3 text-center text-[10px] tracking-[0.15em] font-semibold bg-white text-black border border-white hover:bg-transparent hover:text-white transition-all duration-200"
          >
            LOG IN
          </Link>
        </div>
        )}

        <div className="p-6">
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
        </div>
      </aside>
    </div>
  );
}
