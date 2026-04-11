"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
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

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />) : null;

  return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"><ArrowLeft size={15} /></button>
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">SCREENER</h1>
      </div>

      {/* Mobile: Filters inline */}
      <div className="md:hidden border border-white/8 p-4 mb-6 space-y-4">
        <p className="text-[9px] tracking-[0.2em] text-white/25 mb-2">FILTERS</p>

        <div className="flex flex-wrap gap-1.5">
          {sectors.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`text-[9px] tracking-[0.1em] px-3 py-1.5 border transition-colors ${
                sector === s ? "border-white/50 text-white" : "border-white/8 text-white/30 hover:border-white/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">CHANGE % RANGE</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={minChange}
                onChange={(e) => setMinChange(Number(e.target.value))}
                className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
              />
              <span className="text-white/20 text-[10px]">to</span>
              <input
                type="number"
                value={maxChange}
                onChange={(e) => setMaxChange(Number(e.target.value))}
                className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1.5">MIN PRICE</p>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
      </div>

      {/* Desktop 2-column grid: 30% filter sidebar + 70% results */}
      <div className="md:grid md:grid-cols-[3fr_7fr] md:gap-8">
        {/* Left: Filter sidebar (desktop) */}
        <aside className="hidden md:block">
          <div className="border border-white/8 p-5 space-y-5 sticky top-24">
            <p className="text-[9px] tracking-[0.2em] text-white/25">FILTERS</p>

            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-2">SECTOR</p>
              <div className="flex flex-wrap gap-1.5">
                {sectors.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSector(s)}
                    className={`text-[9px] tracking-[0.1em] px-3 py-1.5 border transition-colors ${
                      sector === s ? "border-white/50 text-white" : "border-white/8 text-white/30 hover:border-white/20"
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
                <input
                  type="number"
                  value={minChange}
                  onChange={(e) => setMinChange(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
                />
                <span className="text-white/20 text-[10px]">to</span>
                <input
                  type="number"
                  value={maxChange}
                  onChange={(e) => setMaxChange(Number(e.target.value))}
                  className="w-16 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>

            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1.5">MIN PRICE</p>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-20 bg-white/5 border border-white/10 text-[11px] text-white/60 px-2 py-1 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
        </aside>

        {/* Right: Results */}
        <div>
      <p className="text-[9px] tracking-[0.2em] text-white/25 mb-3">{filtered.length} RESULTS</p>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_60px] gap-2 px-4 py-2 border-b border-white/8 text-[9px] tracking-[0.15em] text-white/25">
          <button onClick={() => toggleSort("ticker")} className="flex items-center gap-1 text-left">TICKER <SortIcon k="ticker" /></button>
          <button onClick={() => toggleSort("price")} className="flex items-center gap-1 text-right justify-end">PRICE <SortIcon k="price" /></button>
          <button onClick={() => toggleSort("change")} className="flex items-center gap-1 text-right justify-end">CHG% <SortIcon k="change" /></button>
          <button onClick={() => toggleSort("volume")} className="flex items-center gap-1 text-right justify-end">VOL <SortIcon k="volume" /></button>
          <button onClick={() => toggleSort("pe")} className="flex items-center gap-1 text-right justify-end">P/E <SortIcon k="pe" /></button>
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
              <span className={`text-[11px] text-right font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
              </span>
              <span className="text-[11px] text-right text-white/40">{(s.volume / 1000).toFixed(0)}K</span>
              <span className="text-[11px] text-right text-white/40">{s.pe.toFixed(1)}</span>
              <Sparkline data={s.sparkline} width={48} height={18} positive={s.dayChangePercent >= 0} />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.map((s) => (
          <Link key={s.ticker} href={`/stock/${s.ticker}`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[12px]">{s.ticker}</p>
                <p className="text-[10px] text-white/25">{s.sector} · P/E {s.pe.toFixed(1)}</p>
              </div>
              <Sparkline data={s.sparkline} width={44} height={18} positive={s.dayChangePercent >= 0} />
              <div className="text-right shrink-0">
                <p className="text-[12px]">{"\u20B9"}{s.price.toFixed(2)}</p>
                <p className={`text-[10px] font-medium ${s.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {s.dayChangePercent >= 0 ? "+" : ""}{s.dayChangePercent.toFixed(2)}%
                </p>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
      </div>{/* end right column */}
      </div>{/* end grid */}
    </div>
  );
}
