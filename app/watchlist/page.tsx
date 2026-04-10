"use client";

import { useState } from "react";
import Sparkline from "@/components/Sparkline";
import { watchlist, userProfile } from "@/lib/mockData";

export default function WatchlistPage() {
  const [search, setSearch] = useState("");

  const filtered = watchlist.filter(
    (s) =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pb-12 px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">
          {userProfile.name}&apos;S WATCHLIST
        </h1>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[10px] tracking-[0.15em] border border-[rgba(255,255,255,0.2)] text-[#aaaaaa] hover:text-white hover:border-white transition-all duration-150">
            + ADD STOCKS
          </button>
          <button className="px-4 py-2 text-[10px] tracking-[0.15em] border border-[rgba(255,255,255,0.2)] text-[#aaaaaa] hover:text-white hover:border-white transition-all duration-150">
            EDIT
          </button>
          <button className="px-4 py-2 text-[10px] tracking-[0.15em] border border-white text-white bg-transparent hover:bg-white hover:text-black transition-all duration-150">
            + WATCHLIST
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="SEARCH STOCKS..."
        className="w-full h-10 bg-transparent border border-[rgba(255,255,255,0.2)] px-4 text-[11px] tracking-[0.1em] text-white placeholder:text-[#666] outline-none focus:border-white transition-colors duration-150 mb-6"
      />

      {/* Table */}
      <div>
        <div className="grid grid-cols-[1fr_80px_100px_90px_80px_120px] gap-4 px-4 py-2 border-b border-[rgba(255,255,255,0.12)]">
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">COMPANY</span>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hidden md:block">TREND</span>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">MKT PRICE</span>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">1D CHANGE</span>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hidden sm:block">1D VOL</span>
          <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hidden lg:block">52W PERF</span>
        </div>

        {filtered.map((stock) => {
          const w52Range = stock.w52High - stock.w52Low;
          const w52Position = w52Range > 0 ? ((stock.price - stock.w52Low) / w52Range) * 100 : 50;

          return (
            <div
              key={stock.ticker}
              className="grid grid-cols-[1fr_80px_100px_90px_80px_120px] gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 items-center"
            >
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-[rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-[0.05em] text-[#aaaaaa]">
                      {stock.ticker.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">
                      {stock.ticker}
                    </p>
                    <p className="text-[10px] text-[#aaaaaa] mt-0.5">
                      {stock.name}
                      {stock.shares && (
                        <span className="text-[#666] ml-1">Â· {stock.shares} shares</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex justify-end">
                <Sparkline data={stock.sparkline} width={60} height={20} />
              </div>

              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  â‚¹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-[#aaaaaa]">
                  {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-[#666]">
                  {stock.dayChange >= 0 ? "+" : ""}â‚¹{stock.dayChange.toFixed(2)}
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-[11px] text-[#aaaaaa]">{stock.volume}</p>
              </div>

              {/* 52W Performance bar */}
              <div className="hidden lg:block">
                <div className="relative h-[2px] bg-[rgba(255,255,255,0.15)] w-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-[5px] h-[5px] bg-white"
                    style={{ left: `${Math.min(Math.max(w52Position, 0), 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-[#666]">â‚¹{stock.w52Low}</span>
                  <span className="text-[8px] text-[#666]">â‚¹{stock.w52High}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
