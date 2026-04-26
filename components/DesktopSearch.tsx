"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  SEARCH_FILTERS,
  type SearchFilter,
  type SearchStock,
  type SearchNews,
  computeResults,
  sectionCaption,
  ResultRow,
  resultKey,
} from "@/components/searchResults";
import { getScreener, getNews } from "@/lib/api";

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

export default function DesktopSearch() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("ALL");
  const [focused, setFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const hasQuery = query.trim().length > 0;
  const open = focused || hasQuery || filter !== "ALL";

  const debouncedQuery = useDebouncedValue(query, 150);

  // Fetch live stocks + news once when the search drawer opens.
  const [stocks, setStocks] = useState<SearchStock[]>([]);
  const [news, setNews] = useState<SearchNews[]>([]);
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([getScreener(), getNews({ limit: 50 })]).then(([sRes, nRes]) => {
      if (cancelled) return;
      if (sRes.data) {
        setStocks(
          sRes.data.map((s) => ({
            ticker: s.ticker,
            name: s.name,
            price: s.price ?? 0,
            changePercent: s.change_pct ?? 0,
          })),
        );
      }
      if (nRes.data) {
        setNews(
          nRes.data.map((n) => ({
            id: n.id,
            headline: n.headline,
            ticker: n.related_tickers[0] ?? "",
            timestamp: n.published_at ? new Date(n.published_at).getTime() : Date.now(),
          })),
        );
      }
    });
    return () => { cancelled = true; };
  }, [open]);

  const results = useMemo(
    () => computeResults(debouncedQuery, filter, stocks, news),
    [debouncedQuery, filter, stocks, news],
  );
  const caption = sectionCaption(filter, hasQuery);

  const reset = () => {
    setFocused(false);
    setQuery("");
    setFilter("ALL");
  };

  // Close on outside mousedown
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      reset();
      inputRef.current?.blur();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Close on Escape; Cmd/Ctrl+K focuses input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === "Escape" && open) {
        reset();
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reset on route change (render-time adjustment)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setQuery("");
    setFilter("ALL");
    setFocused(false);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 h-8 px-3 border border-white/20 focus-within:border-white/60 transition-colors duration-300 w-[280px] lg:w-[340px]">
        <Search size={14} strokeWidth={1.5} className="text-white/40 shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search stocks, news, events…"
          className="flex-1 min-w-0 bg-transparent text-[10px] tracking-[0.1em] text-white placeholder:text-white/30 outline-none"
        />
        {!hasQuery && (
          <span className="text-[9px] tracking-[0.1em] text-white/20 shrink-0">⌘K</span>
        )}
      </div>

      {open && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] bg-bg border border-white/15 flex flex-col shadow-2xl"
          style={{ maxHeight: "min(480px, calc(100dvh - 6rem))" }}
        >
          {/* Filter chips */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/10 shrink-0">
            {SEARCH_FILTERS.map((chip) => {
              const active = filter === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setFilter(chip)}
                  className={`px-3 py-1.5 text-[9px] tracking-[0.12em] font-medium border transition-colors duration-200 ${
                    active
                      ? "bg-white text-black border-white"
                      : "text-white/50 border-white/15 hover:text-white/80 hover:border-white/30"
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {!hasQuery && filter === "ALL" ? (
              <div className="py-10 text-center">
                <p className="text-[10px] text-white/25 tracking-[0.1em]">TYPE TO SEARCH</p>
                <p className="text-[9px] text-white/15 mt-1">or pick a filter to browse</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-[10px] text-white/25 tracking-[0.1em]">NO RESULTS FOUND</p>
                <p className="text-[9px] text-white/15 mt-1">Try a different search term</p>
              </div>
            ) : (
              <>
                {caption && (
                  <p className="text-[9px] tracking-[0.15em] text-white/30 font-medium px-4 pt-3 pb-1">
                    {caption}
                  </p>
                )}
                {results.map((r) => (
                  <ResultRow key={resultKey(r)} result={r} onNavigate={reset} />
                ))}
                <div className="px-4 py-2 text-center border-t border-white/6">
                  <span className="text-[9px] text-white/20 tracking-[0.1em]">
                    {results.length} RESULT{results.length !== 1 ? "S" : ""}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
