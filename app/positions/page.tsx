"use client";

import { useState } from "react";
import Sparkline from "@/components/Sparkline";
import { topGainers } from "@/lib/mockData";
import Link from "next/link";

type CapTab = "LARGE" | "MID" | "SMALL";

export default function PositionsPage() {
  const [capTab, setCapTab] = useState<CapTab>("LARGE");

  return (
    <div className="pb-12">
      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 px-6">
        {/* Geometric line art icon */}
        <div className="w-20 h-20 border border-[rgba(255,255,255,0.2)] flex items-center justify-center mb-6 relative">
          <div className="w-8 h-8 border border-white rotate-45" />
          <div className="absolute w-3 h-3 bg-white top-2 right-2" />
        </div>

        <h1 className="font-[var(--font-anton)] text-3xl tracking-[0.1em] uppercase mb-2">
          NO OPEN POSITIONS
        </h1>
        <p className="text-[11px] tracking-[0.1em] text-[#aaaaaa] text-center max-w-xs">
          You have no intraday or F&O positions currently open. Place a trade to see them here.
        </p>
      </div>

      {/* TOP GAINERS section */}
      <div className="px-6 mt-4">
        <h2 className="font-[var(--font-anton)] text-lg tracking-[0.1em] uppercase mb-5">
          TOP GAINERS
        </h2>

        <div className="flex items-center gap-0 mb-5">
          {(["LARGE", "MID", "SMALL"] as CapTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setCapTab(tab)}
              className={`px-4 py-2 text-[10px] tracking-[0.15em] border transition-all duration-150 ${
                capTab === tab
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-[#aaaaaa] border-[rgba(255,255,255,0.2)] hover:text-white hover:border-white"
              }`}
            >
              {tab} CAP
            </button>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-2 border-b border-[rgba(255,255,255,0.12)]">
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">COMPANY</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">MKT PRICE (1D)</span>
          </div>

          {topGainers.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 items-center"
            >
              <div>
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                <p className="text-[10px] text-[#aaaaaa] mt-0.5">{stock.name}</p>
              </div>
              <div className="flex justify-end">
                <Sparkline data={stock.sparkline} width={60} height={20} />
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  â‚¹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#aaaaaa]">
                  +{stock.dayChangePercent.toFixed(2)}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
