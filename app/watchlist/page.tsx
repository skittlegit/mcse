"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { watchlist } from "@/lib/mockData";

type SortKey = "ticker" | "price" | "dayChangePercent" | "volume";
type SortDir = "asc" | "desc";

export default function WatchlistPage() {
  const { isLoggedIn } = useAuth();
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("ticker");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = watchlist.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "ticker") { av = a.ticker; bv = b.ticker; }
      else if (sortKey === "volume") {
        av = parseFloat(a.volume); bv = parseFloat(b.volume);
      }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />
  );

  if (!isLoggedIn) {
    return (
      <div className="pb-20 md:pb-12 px-5 md:px-6 py-6">
        <LoginPrompt message="Log in to view and manage your stock watchlist." />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
          WATCHLIST
        </h1>
        <span className="text-[10px] text-white/30 tracking-[0.1em]">{sorted.length} STOCKS</span>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH STOCKS..."
        className="w-full h-11 bg-transparent border border-white/15 px-4 text-[12px] tracking-[0.1em] text-white placeholder:text-white/20 outline-none focus:border-white transition-colors duration-150 mb-6"
      />

      {/* Mobile: Card list */}
      <div className="md:hidden space-y-2">
        {sorted.map((stock, i) => (
          <motion.div
            key={stock.ticker}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.3 }}
          >
            <Link
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
          </motion.div>
        ))}
      </div>

      {/* Desktop: Table with sortable headers */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1fr_80px_100px_90px_80px_120px] gap-4 px-4 py-2 border-b border-white/12">
          <button onClick={() => toggleSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
            COMPANY <SortIcon col="ticker" />
          </button>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
          <button onClick={() => toggleSort("price")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            MKT PRICE <SortIcon col="price" />
          </button>
          <button onClick={() => toggleSort("dayChangePercent")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            1D CHANGE <SortIcon col="dayChangePercent" />
          </button>
          <button onClick={() => toggleSort("volume")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            1D VOL <SortIcon col="volume" />
          </button>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">52W PERF</span>
        </div>

        {sorted.map((stock) => {
          const w52Range = stock.w52High - stock.w52Low;
          const w52Position = w52Range > 0 ? ((stock.price - stock.w52Low) / w52Range) * 100 : 50;

          return (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="grid grid-cols-[1fr_80px_100px_90px_80px_120px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.05em] text-white/40">{stock.ticker.slice(0, 3)}</span>
                  </div>
                  <div>
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {stock.name}
                      {stock.shares && (
                        <span className="text-white/20 ml-1">{"\u00B7"} {stock.shares} shares</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Sparkline data={stock.sparkline} width={60} height={20} positive={stock.dayChangePercent >= 0} />
              </div>

              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="text-right">
                <p className={`text-[11px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-white/20">
                  {stock.dayChange >= 0 ? "+" : ""}{"\u20B9"}{stock.dayChange.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-white/40">{stock.volume}</p>
              </div>

              {/* 52W Performance bar */}
              <div>
                <div className="relative h-[2px] bg-white/10 w-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-white"
                    style={{ left: `${Math.min(Math.max(w52Position, 0), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-white/20">{"\u20B9"}{stock.w52Low}</span>
                  <span className="text-[8px] text-white/20">{"\u20B9"}{stock.w52High}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {sorted.length === 0 && search.length > 0 && (
        <div className="py-16 text-center">
          <p className="text-[11px] tracking-[0.15em] text-white/20 uppercase">NO RESULTS FOR &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
