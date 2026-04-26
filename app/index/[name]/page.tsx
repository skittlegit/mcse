"use client";

import { useState, use, useMemo, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getScreener, type ScreenerItem } from "@/lib/api";
import { usePoll } from "@/lib/usePoll";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface LiveIndex {
  slug: string;
  name: string;
  value: number;
  changePercent: number;
  constituentCount: number;
}

interface LiveNewsItem {
  id: string;
  headline: string;
  body: string;
  related_tickers: string[];
  sentiment: number;
  published_at: string | null;
}

export default function IndexDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  const router = useRouter();
  const [sectionTab, setSectionTab] = useState<"OVERVIEW" | "CONSTITUENTS" | "NEWS">("OVERVIEW");
  const [indices, setIndices] = useState<LiveIndex[]>([]);
  const [stocks, setStocks] = useState<ScreenerItem[]>([]);
  const [liveNews, setLiveNews] = useState<LiveNewsItem[]>([]);

  // Poll live data every 5s.
  usePoll(async () => {
    if (!API_BASE) return;
    try {
      const [iRes, sRes, nRes] = await Promise.all([
        fetch(`${API_BASE}/market/indices`).then((r) => r.ok ? r.json() : null).catch(() => null),
        getScreener(),
        fetch(`${API_BASE}/market/news?limit=80`).then((r) => r.ok ? r.json() : []).catch(() => []),
      ]);
      if (Array.isArray(iRes)) setIndices(iRes as LiveIndex[]);
      if (sRes.data) setStocks(sRes.data);
      if (Array.isArray(nRes)) setLiveNews(nRes as LiveNewsItem[]);
    } catch {
      /* ignore */
    }
  }, 5000);

  const idx = useMemo(() => indices.find((i) => i.slug === name) ?? null, [indices, name]);

  // Constituents = stocks in this index's sector. Special-case "mcse" = all stocks.
  const constituents = useMemo(() => {
    if (!idx) return [];
    if (idx.slug === "mcse") return stocks;
    // Index slug is the sector lowercased; match against stock.sector
    const sectorKey = idx.name.toUpperCase();
    return stocks.filter((s) => s.sector.toUpperCase() === sectorKey);
  }, [idx, stocks]);

  const indexNews = useMemo(() => {
    if (constituents.length === 0) return [];
    const tickerSet = new Set(constituents.map((s) => s.ticker));
    return liveNews.filter((n) => n.related_tickers.some((t) => tickerSet.has(t)));
  }, [constituents, liveNews]);

  const sorted = useMemo(
    () => [...constituents].sort((a, b) => (b.change_pct ?? 0) - (a.change_pct ?? 0)),
    [constituents],
  );
  const gainers = sorted.filter((s) => (s.change_pct ?? 0) > 0).slice(0, 5);
  const losers = sorted.filter((s) => (s.change_pct ?? 0) < 0).slice(-5).reverse();

  // Aggregate fundamentals from live constituents.
  const fundamentals = useMemo(() => {
    if (constituents.length === 0) return null;
    let totalCap = 0;
    let totalVolume = 0;
    const sectors: Record<string, number> = {};
    for (const s of constituents) {
      totalCap += s.market_cap ?? 0;
      totalVolume += s.volume ?? 0;
      sectors[s.sector] = (sectors[s.sector] || 0) + 1;
    }
    return {
      totalMarketCap: `₹${(totalCap / 1_00_00_000).toFixed(1)}Cr`,
      totalVolume: totalVolume.toLocaleString("en-IN"),
      sectors: Object.entries(sectors).sort((a, b) => b[1] - a[1]),
      stockCount: constituents.length,
    };
  }, [constituents]);

  if (indices.length > 0 && !idx) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[var(--font-anton)] text-2xl tracking-[0.1em] uppercase mb-2"
        >
          INDEX NOT FOUND
        </motion.h1>
        <p className="text-[11px] text-white/40 mb-4">{name}</p>
        <Link
          href="/"
          className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
        >
          BACK TO EXPLORE
        </Link>
      </div>
    );
  }

  if (!idx) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-[11px] text-white/40 tracking-[0.15em]">LOADING…</p>
      </div>
    );
  }

  const visibleTabs = (["OVERVIEW", "CONSTITUENTS", "NEWS"] as const).filter((tab) => {
    if (tab === "NEWS") return indexNews.length > 0;
    return true;
  });

  return (
    <div className="mobile-content-pad">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 py-4 border-b border-white/8">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button
            onClick={() => router.back()}
            aria-label="Go back"
            className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white active:bg-white/[0.04] transition-colors duration-150"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <span className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.05em]">{idx.name}</span>
            <p className="text-[10px] text-white/40">Live Sector Index</p>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="lg:grid lg:grid-cols-[7fr_3fr] lg:gap-0 py-6">
        <div className="min-w-0 lg:pr-6">
          {/* Index value */}
          <div className="mb-7 md:mb-8">
            <p className="font-[var(--font-anton)] text-3xl md:text-4xl tracking-tight mb-1.5">
              {idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-3">
              <p className={`text-[12px] font-medium ${idx.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                {idx.changePercent >= 0 ? "+" : ""}{idx.changePercent.toFixed(2)}%
              </p>
              <span className="text-[10px] tracking-[0.15em] text-[#00D26A] border border-[#00D26A]/40 bg-[#00D26A]/10 px-2 py-0.5">LIVE</span>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex items-center gap-0 mb-6 md:mb-8 border-b border-white/8 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
            {visibleTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setSectionTab(tab)}
                className={`px-5 py-3 text-[10px] tracking-[0.15em] font-medium border-b-2 transition-all duration-150 whitespace-nowrap ${
                  sectionTab === tab
                    ? "text-white border-white"
                    : "text-white/35 border-transparent hover:text-white/60"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {sectionTab === "OVERVIEW" && (
            <>
              <div className="mb-7 md:mb-8">
                <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">OVERVIEW</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/8">
                  {[
                    { label: "VALUE", val: idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 }) },
                    { label: "CHANGE %", val: `${idx.changePercent >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%` },
                    { label: "STOCKS", val: String(constituents.length) },
                    { label: "TOTAL CAP", val: fundamentals?.totalMarketCap ?? "—" },
                  ].map((item) => (
                    <div key={item.label} className="bg-bg p-4 md:p-5">
                      <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-1.5">{item.label}</p>
                      <p className="font-[var(--font-anton)] text-lg md:text-xl">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              {gainers.length > 0 && (
                <div className="mb-7 md:mb-8">
                  <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4 text-[#00D26A]/80">TOP GAINERS</h3>
                  <div className="space-y-0">
                    {gainers.map((s) => (
                      <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.02] transition-colors -mx-1 px-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 border border-[#00D26A]/20 flex items-center justify-center text-[10px] font-[var(--font-anton)] tracking-wider text-[#00D26A]/60 shrink-0">
                            {s.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium truncate">{s.ticker}</p>
                            <p className="text-[9px] text-white/40 truncate">{s.name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-[11px] font-[var(--font-anton)] tracking-wide">₹{(s.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          <p className="text-[9px] font-medium text-[#00D26A]">+{(s.change_pct ?? 0).toFixed(2)}%</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {losers.length > 0 && (
                <div className="mb-7 md:mb-8">
                  <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4 text-[#FF5252]/80">TOP LOSERS</h3>
                  <div className="space-y-0">
                    {losers.map((s) => (
                      <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.02] transition-colors -mx-1 px-1">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 border border-[#FF5252]/20 flex items-center justify-center text-[10px] font-[var(--font-anton)] tracking-wider text-[#FF5252]/60 shrink-0">
                            {s.ticker.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium truncate">{s.ticker}</p>
                            <p className="text-[9px] text-white/40 truncate">{s.name}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-[11px] font-[var(--font-anton)] tracking-wide">₹{(s.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          <p className="text-[9px] font-medium text-[#FF5252]">{(s.change_pct ?? 0).toFixed(2)}%</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* CONSTITUENTS */}
          {sectionTab === "CONSTITUENTS" && (
            <div>
              <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">CONSTITUENTS ({constituents.length})</h3>
              <div className="space-y-0">
                {constituents.map((s) => (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 hover:bg-white/[0.02] transition-colors -mx-1 px-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 border border-white/15 flex items-center justify-center text-[10px] font-[var(--font-anton)] tracking-wider text-white/60 shrink-0">
                        {s.ticker.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium truncate">{s.ticker}</p>
                        <p className="text-[9px] text-white/40 truncate">{s.name}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[11px] font-[var(--font-anton)] tracking-wide">₹{(s.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      <p className={`text-[9px] font-medium ${(s.change_pct ?? 0) >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {(s.change_pct ?? 0) >= 0 ? "+" : ""}{(s.change_pct ?? 0).toFixed(2)}%
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* NEWS */}
          {sectionTab === "NEWS" && (
            <div className="space-y-3">
              {indexNews.map((news) => (
                <Link key={news.id} href={`/news/${news.id}`} className="block border border-white/8 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-[var(--font-anton)] text-[9px] tracking-[0.1em] text-white/40">{news.related_tickers[0] ?? ""}</span>
                    <span className={`text-[9px] font-medium ${news.sentiment >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {news.sentiment >= 0 ? "+" : ""}{news.sentiment.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/60 leading-relaxed">{news.headline}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:border-l lg:border-white/8 lg:pl-6">
          <div className="space-y-6">
            <div className="border border-white/8 p-5">
              <h3 className="text-[10px] tracking-[0.15em] text-white/40 mb-4">INDEX STATS</h3>
              <div className="space-y-3">
                {[
                  { label: "VALUE", val: idx.value.toLocaleString("en-IN", { minimumFractionDigits: 2 }) },
                  { label: "CHANGE %", val: `${idx.changePercent >= 0 ? "+" : ""}${idx.changePercent.toFixed(2)}%` },
                  { label: "STOCKS", val: String(constituents.length) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-[11px]">
                    <span className="text-white/40">{row.label}</span>
                    <span className="font-medium">{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {gainers.length > 0 && (
              <div className="border border-white/8 p-5">
                <h3 className="text-[10px] tracking-[0.15em] text-[#00D26A]/60 mb-3">TOP GAINERS</h3>
                {gainers.map((s) => (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex justify-between py-1.5 hover:opacity-70 transition-opacity">
                    <span className="text-[10px]">{s.ticker}</span>
                    <span className="text-[10px] text-[#00D26A]">+{(s.change_pct ?? 0).toFixed(2)}%</span>
                  </Link>
                ))}
              </div>
            )}

            {losers.length > 0 && (
              <div className="border border-white/8 p-5">
                <h3 className="text-[10px] tracking-[0.15em] text-[#FF5252]/60 mb-3">TOP LOSERS</h3>
                {losers.map((s) => (
                  <Link key={s.ticker} href={`/stock/${s.ticker}`} className="flex justify-between py-1.5 hover:opacity-70 transition-opacity">
                    <span className="text-[10px]">{s.ticker}</span>
                    <span className="text-[10px] text-[#FF5252]">{(s.change_pct ?? 0).toFixed(2)}%</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
