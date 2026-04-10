"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { holdings, investments } from "@/lib/mockData";
import Link from "next/link";

export default function HoldingsPage() {
  const [showValues, setShowValues] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);

  const selectedHolding = holdings.find((h) => h.ticker === selectedTicker);

  return (
    <div className="flex gap-0 pb-12 min-h-[calc(100vh-6rem)]">
      {/* Main */}
      <div className="flex-1 min-w-0 px-6 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">
            HOLDINGS ({holdings.length})
          </h1>
          <button
            onClick={() => setShowValues(!showValues)}
            className="w-7 h-7 border border-[rgba(255,255,255,0.2)] flex items-center justify-center hover:border-white transition-colors duration-150"
          >
            {showValues ? <Eye size={12} /> : <EyeOff size={12} />}
          </button>
        </div>

        {/* Summary */}
        <div className="border border-[rgba(255,255,255,0.12)] p-6 mb-8">
          <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-1">CURRENT VALUE</p>
          <p className="font-[var(--font-anton)] text-4xl tracking-tight mb-5">
            {showValues
              ? `â‚¹${investments.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
              : "â‚¹ â€¢â€¢â€¢â€¢â€¢â€¢"}
          </p>

          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-1">INVESTED VALUE</p>
              <p className="font-[var(--font-anton)] text-lg">
                {showValues
                  ? `â‚¹${investments.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "â€¢â€¢â€¢â€¢â€¢â€¢"}
              </p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-1">1D RETURNS</p>
              <p className="font-[var(--font-anton)] text-lg">
                {showValues
                  ? `+â‚¹${investments.dayReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "â€¢â€¢â€¢â€¢â€¢â€¢"}
                <span className="text-[#aaaaaa] text-[11px] ml-1">
                  (+{investments.dayReturnsPercent.toFixed(2)}%)
                </span>
              </p>
            </div>
            <div>
              <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-1">TOTAL RETURNS</p>
              <p className="font-[var(--font-anton)] text-lg">
                {showValues
                  ? `+â‚¹${investments.totalReturns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                  : "â€¢â€¢â€¢â€¢â€¢â€¢"}
                <span className="text-[#aaaaaa] text-[11px] ml-1">
                  (+{investments.totalReturnsPercent.toFixed(2)}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Holdings table */}
        <div>
          <div className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-2 border-b border-[rgba(255,255,255,0.12)]">
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">COMPANY</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hidden md:block">TREND</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">MKT PRICE (1D)</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">RETURNS (%)</span>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">CURRENT (INVESTED)</span>
          </div>

          {holdings.map((h) => (
            <button
              key={h.ticker}
              onClick={() => setSelectedTicker(h.ticker === selectedTicker ? null : h.ticker)}
              className={`w-full grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-3 border-b border-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 items-center text-left ${
                selectedTicker === h.ticker ? "bg-[rgba(255,255,255,0.05)]" : ""
              }`}
            >
              <div>
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">
                  {h.ticker}
                </p>
                <p className="text-[10px] text-[#aaaaaa] mt-0.5">
                  {h.name} Â· {h.qty} shares Â· Avg â‚¹{h.avgPrice.toFixed(2)}
                </p>
              </div>
              <div className="hidden md:flex justify-end">
                <Sparkline data={h.sparkline} width={60} height={20} />
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  â‚¹{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-[#aaaaaa]">
                  {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px] text-[#aaaaaa]">
                  {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-[#aaaaaa]">
                  {showValues
                    ? `${h.returns >= 0 ? "+" : ""}â‚¹${h.returns.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "â€¢â€¢â€¢â€¢"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {showValues
                    ? `â‚¹${h.currentValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "â€¢â€¢â€¢â€¢â€¢â€¢"}
                </p>
                <p className="text-[10px] text-[#aaaaaa]">
                  {showValues
                    ? `â‚¹${h.investedValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`
                    : "â€¢â€¢â€¢â€¢â€¢â€¢"}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <aside className="hidden lg:flex flex-col w-80 border-l border-[rgba(255,255,255,0.08)] shrink-0">
        {selectedHolding ? (
          <div className="p-6 flex-1">
            <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-2">SELECTED HOLDING</p>
            <p className="font-[var(--font-anton)] text-xl tracking-[0.05em] mb-1">
              {selectedHolding.ticker}
            </p>
            <p className="text-[11px] text-[#aaaaaa] mb-6">{selectedHolding.name}</p>

            <p className="font-[var(--font-anton)] text-3xl tracking-tight mb-6">
              â‚¹{selectedHolding.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>

            <div className="mb-6">
              <Sparkline data={selectedHolding.sparkline} width={240} height={60} strokeWidth={2} />
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">QTY</span>
                <span className="text-[12px] font-[var(--font-anton)]">{selectedHolding.qty}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">AVG PRICE</span>
                <span className="text-[12px] font-[var(--font-anton)]">â‚¹{selectedHolding.avgPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">INVESTED</span>
                <span className="text-[12px] font-[var(--font-anton)]">â‚¹{selectedHolding.investedValue.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
                <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">CURRENT</span>
                <span className="text-[12px] font-[var(--font-anton)]">â‚¹{selectedHolding.currentValue.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/stock/${selectedHolding.ticker}`}
                className="flex-1 h-10 bg-white text-black flex items-center justify-center text-[10px] tracking-[0.15em] font-semibold hover:bg-black hover:text-white hover:border hover:border-white transition-all duration-150"
              >
                BUY
              </Link>
              <button className="flex-1 h-10 border border-white text-white flex items-center justify-center text-[10px] tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-all duration-150">
                SELL
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <p className="text-[11px] tracking-[0.15em] text-[#666] text-center uppercase">
              SELECT A STOCK<br />TO GET STARTED
            </p>
          </div>
        )}

        {/* Balance */}
        <div className="p-6 border-t border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">AVAILABLE BALANCE</span>
            <span className="font-[var(--font-anton)] text-sm">â‚¹693.69</span>
          </div>
          <button className="w-full h-9 border border-white text-[10px] tracking-[0.15em] text-white hover:bg-white hover:text-black transition-all duration-150 flex items-center justify-center gap-2">
            ADD MONEY â†’
          </button>
        </div>
      </aside>
    </div>
  );
}
