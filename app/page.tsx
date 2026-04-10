"use client";

import { useState } from "react";
import { ChevronRight, Target, Landmark, Layers, ScanLine, Repeat, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import Sparkline from "@/components/Sparkline";
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
  target: Target,
  landmark: Landmark,
  layers: Layers,
  scan: ScanLine,
  repeat: Repeat,
  "trending-up": TrendingUp,
  calendar: Calendar,
};

type MoverTab = "GAINERS" | "LOSERS" | "VOLUME SHOCKERS";

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<MoverTab>("GAINERS");

  const moverData: Record<MoverTab, MoverStock[]> = {
    GAINERS: topGainers,
    LOSERS: topLosers,
    "VOLUME SHOCKERS": volumeShockers,
  };

  const currentMovers = moverData[activeTab];

  return (
    <div className="flex gap-0 pb-12">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 py-6">
        {/* MOST TRADED */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-[var(--font-anton)] text-lg tracking-[0.1em] uppercase">
              MOST TRADED
            </h2>
            <Link
              href="#"
              className="text-[10px] tracking-[0.15em] text-[#aaaaaa] hover:text-white transition-colors duration-150 flex items-center gap-1"
            >
              SEE MORE <ChevronRight size={10} />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[rgba(255,255,255,0.08)]">
            {mostTraded.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="bg-[#0a0a0a] p-5 hover:bg-[rgba(255,255,255,0.03)] transition-colors duration-150"
              >
                <div className="w-10 h-10 border border-[rgba(255,255,255,0.3)] flex items-center justify-center mb-3">
                  <span className="text-[9px] tracking-[0.1em] text-[#aaaaaa]">
                    {stock.ticker.slice(0, 3)}
                  </span>
                </div>
                <p className="font-[var(--font-anton)] text-[11px] tracking-[0.1em] mb-1">
                  {stock.name.toUpperCase()}
                </p>
                <p className="font-[var(--font-anton)] text-2xl tracking-tight">
                  â‚¹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[11px] text-[#aaaaaa] mt-1">
                  {stock.dayChangePercent >= 0 ? "+" : ""}
                  {stock.dayChangePercent.toFixed(2)}% Â· 1D
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* TOP MOVERS TODAY */}
        <div>
          <h2 className="font-[var(--font-anton)] text-lg tracking-[0.1em] uppercase mb-5">
            TOP MOVERS TODAY
          </h2>

          <div className="flex items-center gap-0 mb-5">
            {(["GAINERS", "LOSERS", "VOLUME SHOCKERS"] as MoverTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-[10px] tracking-[0.15em] border transition-all duration-150 ${
                  activeTab === tab
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-[#aaaaaa] border-[rgba(255,255,255,0.2)] hover:text-white hover:border-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Movers table */}
          <div>
            <div className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-2 border-b border-[rgba(255,255,255,0.12)]">
              <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">COMPANY</span>
              <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hidden sm:block">TREND</span>
              <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">MKT PRICE (1D)</span>
              <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">VOLUME</span>
            </div>

            {currentMovers.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="grid grid-cols-[1fr_100px_120px_80px] gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 items-center"
              >
                <div>
                  <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">
                    {stock.ticker}
                  </p>
                  <p className="text-[10px] text-[#aaaaaa] mt-0.5">{stock.name}</p>
                </div>
                <div className="hidden sm:flex justify-end">
                  <Sparkline data={stock.sparkline} width={80} height={24} />
                </div>
                <div className="text-right">
                  <p className="font-[var(--font-anton)] text-[13px]">
                    â‚¹{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#aaaaaa]">
                    {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-[#aaaaaa]">{stock.volume}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block w-80 border-l border-[rgba(255,255,255,0.08)] shrink-0">
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)]">
          <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-3">YOUR INVESTMENTS</p>
          <p className="text-[9px] tracking-[0.2em] text-[#aaaaaa] mb-1">CURRENT VALUE</p>
          <p className="font-[var(--font-anton)] text-3xl tracking-tight mb-4">
            â‚¹{investments.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">1D RETURNS</span>
              <span className="text-[12px] font-[var(--font-anton)] text-white">
                +â‚¹{investments.dayReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                <span className="text-[#aaaaaa] ml-1 text-[10px]">(+{investments.dayReturnsPercent.toFixed(2)}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">TOTAL RETURNS</span>
              <span className="text-[12px] font-[var(--font-anton)] text-white">
                +â‚¹{investments.totalReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                <span className="text-[#aaaaaa] ml-1 text-[10px]">(+{investments.totalReturnsPercent.toFixed(2)}%)</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">INVESTED</span>
              <span className="text-[12px] font-[var(--font-anton)] text-white">
                â‚¹{investments.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-4">PRODUCTS & TOOLS</p>
          <div className="space-y-0">
            {productsAndTools.map((item) => {
              const Icon = iconMap[item.icon] || Target;
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 group"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={14} strokeWidth={1.5} className="text-[#666] group-hover:text-white transition-colors" />
                    <span className="text-[11px] tracking-[0.1em] text-[#aaaaaa] group-hover:text-white transition-colors">
                      {item.label}
                    </span>
                  </div>
                  <ChevronRight size={10} className="text-[#444]" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
}

