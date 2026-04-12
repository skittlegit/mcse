"use client";

import { tickerTapeItems } from "@/lib/mockData";

export default function TickerTape() {
  const items = [...tickerTapeItems, ...tickerTapeItems];

  return (
    <div className="w-full h-8 bg-bg/95 backdrop-blur-sm border-b border-white/8 overflow-hidden select-none cursor-default">
      <div className="flex items-center h-full animate-ticker whitespace-nowrap">
        {items.map((item, i) => (
          <div key={`${item.ticker}-${i}`} className="flex items-center gap-2 px-3 md:px-6">
            <span className="text-[10px] font-[MonumentExtended] tracking-[0.1em] text-white/60">
              {item.ticker}
            </span>
            <span className="text-[10px] text-white/80">
              {"\u20B9"}{item.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[10px] font-medium ${item.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
              {item.changePercent >= 0 ? "+" : ""}{item.changePercent.toFixed(2)}%
            </span>
            <span className="text-white/15 text-[8px]">{"\u00B7"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
