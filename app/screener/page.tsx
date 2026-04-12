"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { allStocksEnriched } from "@/lib/mockData";

type SortKey = "ticker" | "price" | "change" | "volume" | "pe";
type SortDir = "asc" | "desc";

const sectors = ["ALL", ...Array.from(new Set(allStocksEnriched.map((s) => s.sector)))];

export default function ScreenerPage() {
  const router = useRouter();
  const [sector, setSector] = useState("ALL");
  const [minChange, setMinChange] = useState(-10);
  const [maxChange, setMaxChange] = useState(10);
  const [minPrice, setMinPrice] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("change");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return allStocksEnriched
      .filter((s) => sector === "ALL" || s.sector === sector)
      .filter((s) => s.dayChangePercent >= minChange && s.dayChangePercent <= maxChange)
      .filter((s) => s.price >= minPrice)
      .sort((a, b) => {
        let av: number, bv: number;
        switch (sortKey) {
          case "ticker": return sortDir === "asc" ? a.ticker.localeCompare(b.ticker) : b.ticker.localeCompare(a.ticker);
          case "price": av = a.price; bv = b.price; break;
          case "change": av = a.dayChangePercent; bv = b.dayChangePercent; break;
          case "volume": av = a.volume; bv = b.volume; break;
          case "pe": av = a.pe; bv = b.pe; break;
          default: av = 0; bv = 0;
        }
        return sortDir === "asc" ? av - bv : bv - av;
      });
  }, [sector, minChange, maxChange, minPrice, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  }

  const sortIcon = (k: SortKey) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  const avgChange = filtered.length ? (filtered.reduce((s, x) => s + x.dayChangePercent, 0) / filtered.length) : 0;

  return (
    <div className="py-6 pb-24 md:pb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">SCREENER</h1>
            <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">INTRADAY SCANNER</p>
          </div>
        </div>
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="md:hidden px-4 py-2.5 text-[10px] tracking-[0.15em] border border-white/15 text-white/40 hover:text-white hover:border-white transition-all duration-150 flex items-center gap-1.5"
        >
          <SlidersHorizontal size={12} />
          FILTERS
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6 border border-white/6 p-3 px-4">
        <span className="text-[10px] tracking-[0.15em] text-white/40">
          <span className="font-[var(--font-anton)] text-base text-white mr-1.5">{filtered.length}</span>STOCKS MATCHING
        </span>
        <span className="text-white/10">&middot;</span>
        <span className="text-[10px] tracking-[0.1em] text-white/30">
          AVG CHG <span className={`font-medium ml-1 ${avgChange >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>{avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%</span>
        </span>
      </div>

      <AnimatePresence>
        {mobileFiltersOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden mb-6"
          >
            <div className="border border-white/8 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[9px] tracking-[0.2em] text-white/25">FILTERS</p>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-6 h-6 flex items-center justify-center">
                  <X size={12} className="text-white/30" />
                </button>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.15em] text-white/30 mb-2">SECTOR</p>
                <div className="flex flex-wrap gap-0">
                  {sectors.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSector(s)}
                      className={`px-3 py-2 text-[9px] tracking-[0.1em] border-b-2 transition-all duration-150 ${
                        sector === s
                          ? "text-white border-white"
                          : "text-white/40 border-transparent hover:text-white/60"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">CHANGE % RANGE</p>
                  <div className="flex items-center gap-2">
                    <input type="number" value={minChange} onChange={(e) => setMinChange(Number(e.target.value))}
                      className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                    <span className="text-white/20 text-[10px]">to</span>
                    <input type="number" value={maxChange} onChange={(e) => setMaxChange(Number(e.target.value))}
                      className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                  </div>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">MIN PRICE</p>
                  <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="md:grid md:grid-cols-[3fr_7fr] md:gap-8">
        <aside className="hidden md:block">
          <div className="border border-white/8 p-5 space-y-5 sticky top-24">
            <p className="text-[9px] tracking-[0.2em] text-white/25">FILTERS</p>
            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-2">SECTOR</p>
              <div className="flex flex-wrap gap-0">
                {sectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={`px-3 py-2 text-[9px] tracking-[0.1em] border-b-2 transition-all duration-150 ${
                      sector === s
                        ? "text-white border-white"
                        : "text-white/40 border-transparent hover:text-white/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1.5">CHANGE % RANGE</p>
              <div className="flex items-center gap-2">
                <input type="number" value={minChange} onChange={(e) => setMinChange(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
                <span className="text-white/20 text-[10px]">to</span>
                <input type="number" value={maxChange} onChange={(e) => setMaxChange(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
              </div>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1.5">MIN PRICE</p>
              <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-20 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30" />
            </div>
          </div>
        </aside>

        <div>
          <div className="hidden md:block">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-2 px-4 py-2 border-b border-white/8 text-[9px] tracking-[0.15em] text-[#666]">
              <button onClick={() => toggleSort("ticker")} className="flex items-center gap-1 text-left hover:text-white transition-colors">TICKER {sortIcon("ticker")}</button>
              <button onClick={() => toggleSort("price")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">PRICE {sortIcon("price")}</button>
              <button onClick={() => toggleSort("change")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">CHG% {sortIcon("change")}</button>
              <button onClick={() => toggleSort("volume")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">VOL {sortIcon("volume")}</button>
              <button onClick={() => toggleSort("pe")} className="flex items-center gap-1 text-right justify-end hover:text-white transition-colors">P/E {sortIcon("pe")}</button>
              <span />
            </div>
            {filtered.map((s) => (
              <Link key={s.ticker} href={`/stock/${s.ticker}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-2 px-4 py-3 border-b border-white/4 hover:bg-white/[0.02] transition-colors items-center"
                >
                  <div>
                    <span className="font-[var(--font-anton)] text-[12px]">{s.ticker}</span>
                    <span className="text-[10px] text-white/25 ml-2">{s.sector}</span>
                  </div>
                  <span className="text-[12px] text-right">{"\u20B9"}{s.price.toFixed(2)}</span>
                  <span className={`text-[11px] text-right font-medium px-2 py-0.5 ${
                    s.dayChangePercent >= 0
                      ? "text-[#00D26A] bg-[#00D26A]/5"
                      : "text-[#FF5252] bg-[#FF5252]/5"
                  }`}>
                    {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                  </span>
                  <span className="text-[11px] text-right text-white/40">{(s.volume / 1000).toFixed(0)}K</span>
                  <span className="text-[11px] text-right text-white/40">{s.pe.toFixed(1)}</span>
                  <Sparkline data={s.sparkline} width={48} height={18} positive={s.dayChangePercent >= 0} />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="md:hidden space-y-2">
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
                <option value="change" className="bg-bg">CHANGE %</option>
                <option value="volume" className="bg-bg">VOLUME</option>
                <option value="pe" className="bg-bg">P/E RATIO</option>
              </select>
            </div>
            {filtered.map((s) => (
              <Link key={s.ticker} href={`/stock/${s.ticker}`}>
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-4 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.1em] text-white/40">{s.ticker.slice(0, 3)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{s.ticker}</p>
                    <p className="text-[10px] text-white/30">{s.sector}</p>
                  </div>
                  <Sparkline data={s.sparkline} width={44} height={18} positive={s.dayChangePercent >= 0} />
                  <div className="text-right shrink-0 min-w-[70px]">
                    <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{s.price.toFixed(2)}</p>
                    <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
