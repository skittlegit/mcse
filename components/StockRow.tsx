import StatBadge from "./StatBadge";
import type { StockActivity } from "@/lib/mockData";
import Link from "next/link";

export default function StockRow({ stock }: { stock: StockActivity }) {
  return (
    <Link
      href={`/stock/${stock.ticker}`}
      className="flex items-center gap-3 py-3 px-1 hover:bg-bg rounded-xl transition-colors"
    >
      {/* Logo */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
        style={{ backgroundColor: stock.color }}
      >
        {stock.ticker.slice(0, 2)}
      </div>

      {/* Ticker + name */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">{stock.ticker}</p>
        <p className="text-xs text-text-secondary truncate">{stock.name}</p>
      </div>

      {/* Price + badge */}
      <div className="text-center">
        <p
          className={`text-sm font-semibold ${
            stock.changePercent >= 0 ? "text-accent" : "text-negative"
          }`}
        >
          {stock.price.toFixed(2)}
        </p>
        <StatBadge value={stock.changePercent} />
      </div>

      {/* Total value + shares */}
      <div className="text-right min-w-[80px]">
        <p className="text-sm font-bold">
          ${stock.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs text-text-secondary">{stock.shares} shares</p>
      </div>
    </Link>
  );
}
