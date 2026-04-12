"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronUp, Plus, X, Eye } from "lucide-react";
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
  const [watchlists, setWatchlists] = useState<string[]>(["My Watchlist"]);
  const [activeList, setActiveList] = useState(0);
  const [newListName, setNewListName] = useState("");

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

  const sortIcon = (col: SortKey) =>
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />;

  const [hoveredTicker, setHoveredTicker] = useState<string | null>(null);
  const hoveredStock = watchlist.find(s => s.ticker === hoveredTicker);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback((ticker: string) => {
    if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; }
    setHoveredTicker(ticker);
  }, []);

  const handleMouseLeave = useCallback(() => {
    leaveTimer.current = setTimeout(() => setHoveredTicker(null), 300);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="py-6">
        <LoginPrompt message="Log in to view and manage your stock watchlist." />
      </div>
    );
  }

  return (
    <div className="py-6">
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
        className="w-full h-11 bg-transparent border border-white/15 px-4 text-[16px] tracking-[0.1em] text-white placeholder:text-white/20 outline-none focus:border-white transition-colors duration-150 mb-4"
      />

      {/* Watchlist tabs */}
      <div className="flex items-center gap-0 mb-6 overflow-x-auto scrollbar-hide">
        {watchlists.map((name, i) => (
          <button
            key={i}
            onClick={() => setActiveList(i)}
            className={`px-4 py-2 text-[10px] tracking-[0.15em] border-b-2 transition-all duration-150 whitespace-nowrap flex items-center gap-2 ${
              activeList === i
                ? "text-white border-white"
                : "text-white/40 border-transparent hover:text-white/60"
            }`}
          >
            {name.toUpperCase()}
            {watchlists.length > 1 && activeList === i && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  const next = watchlists.filter((_, idx) => idx !== i);
                  setWatchlists(next);
                  setActiveList(Math.max(0, i - 1));
                }}
                className="hover:text-red-400 cursor-pointer"
              >
                <X size={10} />
              </span>
            )}
          </button>
        ))}
        <div className="flex items-center gap-0 ml-1">
          {newListName !== "" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newListName.trim()) {
                  setWatchlists([...watchlists, newListName.trim()]);
                  setActiveList(watchlists.length);
                  setNewListName("");
                }
              }}
              className="flex"
            >
              <input
                autoFocus
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onBlur={() => setNewListName("")}
                placeholder="Name..."
                className="w-24 h-8 bg-transparent border border-white/15 px-2 text-[10px] tracking-[0.1em] text-white outline-none"
              />
            </form>
          ) : (
            <button
              onClick={() => setNewListName(" ")}
              className="w-8 h-8 border border-white/15 flex items-center justify-center text-white/30 hover:text-white hover:border-white transition-colors"
            >
              <Plus size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Desktop 2-column grid */}
      <div className="md:grid md:grid-cols-[3fr_2fr] md:gap-8">
      <div>

      {/* Mobile: sort + card list */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[9px] tracking-[0.15em] text-white/30 uppercase">SORT BY</span>
          <select
            value={sortKey}
            onChange={(e) => { setSortKey(e.target.value as SortKey); setSortDir("desc"); }}
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
                  {"₹"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[11px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                </p>
                {stock.shares && (
                  <p className="text-[9px] text-white/25">{stock.shares} shares</p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
        </div>
      </div>

      {/* Desktop: Table with sortable headers */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[1fr_80px_100px_90px_80px_120px] gap-4 px-4 py-2 border-b border-white/12">
          <button onClick={() => toggleSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
            COMPANY {sortIcon("ticker")}
          </button>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
          <button onClick={() => toggleSort("price")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            MKT PRICE {sortIcon("price")}
          </button>
          <button onClick={() => toggleSort("dayChangePercent")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            1D CHANGE {sortIcon("dayChangePercent")}
          </button>
          <button onClick={() => toggleSort("volume")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
            1D VOL {sortIcon("volume")}
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
              onMouseEnter={() => handleMouseEnter(stock.ticker)}
              onMouseLeave={handleMouseLeave}
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

      {sorted.length === 0 && search.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-20 md:py-28"
        >
          <div className="w-16 h-16 border border-white/15 flex items-center justify-center mb-6">
            <Eye size={24} strokeWidth={1.5} className="text-white/20" />
          </div>
          <h2 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.1em] uppercase mb-2">
            NO STOCKS WATCHED
          </h2>
          <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
            Your watchlist is empty. Explore the market and add stocks you want to track.
          </p>
          <Link
            href="/"
            className="px-8 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
          >
            EXPLORE STOCKS
          </Link>
        </motion.div>
      )}
      </div>

      {/* Right sidebar (desktop): Stock preview panel */}
      <aside className="hidden md:block" onMouseEnter={() => { if (leaveTimer.current) { clearTimeout(leaveTimer.current); leaveTimer.current = null; } }} onMouseLeave={handleMouseLeave}>
        <AnimatePresence mode="wait">
        {hoveredStock ? (
          <motion.div
            key={hoveredStock.ticker}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.2 }}
            className="border border-white/10 p-5 sticky top-24"
          >
            <p className="font-[var(--font-anton)] text-lg tracking-[0.05em] mb-1">{hoveredStock.ticker}</p>
            <p className="text-[11px] text-white/40 mb-4">{hoveredStock.name}</p>

            {/* Side-by-side: sparkline + details */}
            <div className="flex gap-5 items-start">
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-2xl tracking-tight mb-1">
                  {"\u20B9"}{hoveredStock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[11px] font-medium mb-4 ${hoveredStock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {hoveredStock.dayChangePercent >= 0 ? "+" : ""}{hoveredStock.dayChangePercent.toFixed(2)}%
                </p>
                <Sparkline data={hoveredStock.sparkline} width={180} height={56} positive={hoveredStock.dayChangePercent >= 0} />
              </div>
              <div className="w-[130px] shrink-0 space-y-2.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/40">VOLUME</span>
                  <span className="text-[10px] font-[var(--font-anton)]">{hoveredStock.volume}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/40">52W LOW</span>
                  <span className="text-[10px] font-[var(--font-anton)]">{"\u20B9"}{hoveredStock.w52Low}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-white/40">52W HIGH</span>
                  <span className="text-[10px] font-[var(--font-anton)]">{"\u20B9"}{hoveredStock.w52High}</span>
                </div>
                {hoveredStock.shares && (
                  <div className="flex justify-between">
                    <span className="text-[9px] text-white/40">HOLDING</span>
                    <span className="text-[10px] font-[var(--font-anton)]">{hoveredStock.shares} sh</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={`/stock/${hoveredStock.ticker}`}
              className="block mt-4 py-2.5 text-center text-[10px] tracking-[0.15em] border border-white/20 text-white/50 hover:text-white hover:border-white transition-all"
            >
              VIEW DETAILS
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-white/8 p-8 flex items-center justify-center min-h-[200px]"
          >
            <p className="text-[11px] tracking-[0.15em] text-white/15 text-center uppercase">HOVER A STOCK<br/>TO PREVIEW</p>
          </motion.div>
        )}
        </AnimatePresence>
      </aside>
      </div>
    </div>
  );
}
