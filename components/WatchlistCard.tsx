"use client";

import SparklineChart from "./SparklineChart";
import StatBadge from "./StatBadge";
import type { WatchlistStock } from "@/lib/mockData";
import Link from "next/link";

export default function WatchlistCard({ stock }: { stock: WatchlistStock }) {
  return (
    <Link
      href={`/stock/${stock.ticker}`}
      className="block min-w-[170px] bg-surface rounded-2xl p-4 shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      {/* Icon + ticker */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: stock.color }}
        >
          {stock.ticker.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">{stock.ticker}</p>
          <p className="text-[11px] text-text-secondary truncate">
            {stock.name}
          </p>
        </div>
      </div>

      <StatBadge value={stock.changePercent} className="mb-2" />

      <p className="text-lg font-bold">${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      <p className="text-[11px] text-text-secondary">
        ${stock.refPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>

      <div className="mt-2">
        <SparklineChart data={stock.sparkline} color="#00C896" height={36} />
      </div>
    </Link>
  );
}
