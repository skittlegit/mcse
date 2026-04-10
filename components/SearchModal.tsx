"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { stockDirectory } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

const allStocks = Object.values(stockDirectory);

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return allStocks;
    const q = query.toLowerCase();
    return allStocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-[#0a0a0a] border border-white/15 z-50 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <Search size={16} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stocks..."
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20 font-[var(--font-anton)] tracking-[0.05em]"
              />
              <button
                onClick={onClose}
                className="w-7 h-7 border border-white/15 flex items-center justify-center hover:border-white transition-colors shrink-0"
              >
                <X size={12} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[11px] text-white/25 tracking-[0.1em]">NO RESULTS</p>
                </div>
              ) : (
                results.map((s) => (
                  <Link
                    key={s.ticker}
                    href={`/stock/${s.ticker}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-white/6 hover:bg-white/[0.04] transition-colors"
                  >
                    <div className="w-9 h-9 border border-white/20 flex items-center justify-center shrink-0">
                      <span className="text-[8px] tracking-[0.1em] text-white/40">
                        {s.ticker.slice(0, 3)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">
                        {s.ticker}
                      </p>
                      <p className="text-[10px] text-white/30 truncate">{s.name}</p>
                    </div>
                    <div className="shrink-0 mr-2">
                      <Sparkline
                        data={s.chartData["1D"].map((d) => d.price)}
                        width={50}
                        height={18}
                        positive={s.changePercent >= 0}
                      />
                    </div>
                    <div className="text-right shrink-0 min-w-[70px]">
                      <p className="font-[var(--font-anton)] text-[13px]">
                        {"\u20B9"}{s.price.toLocaleString("en-IN")}
                      </p>
                      <p
                        className={`text-[10px] font-medium ${
                          s.changePercent >= 0
                            ? "text-[#00D26A]"
                            : "text-[#FF5252]"
                        }`}
                      >
                        {s.changePercent >= 0 ? "+" : ""}
                        {s.changePercent.toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
              <span className="text-[9px] text-white/20 tracking-[0.1em]">
                {results.length} STOCK{results.length !== 1 ? "S" : ""}
              </span>
              <span className="text-[9px] text-white/15 tracking-[0.1em]">
                ESC TO CLOSE
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
