"use client";

import { PieChart, TrendingUp, TrendingDown } from "lucide-react";
import { stocksActivity } from "@/lib/mockData";

export default function PortfolioPage() {
  const totalValue = stocksActivity.reduce((sum, s) => sum + s.totalValue, 0);
  const colors = ["#00C896", "#FF3E5B", "#A2AAAD", "#00A4EF", "#4285F4"];

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>

      {/* Summary card */}
      <div className="bg-dark-card rounded-2xl p-6 text-white shadow-lg">
        <p className="text-sm text-white/60">Total Value</p>
        <p className="text-3xl font-bold mt-1">
          ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <TrendingUp size={14} className="text-accent" />
          <span className="text-sm text-accent font-semibold">+2.11% today</span>
        </div>
      </div>

      {/* Allocation */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2">
          <PieChart size={18} /> Allocation
        </h2>
        <div className="space-y-3">
          {stocksActivity.map((s, i) => {
            const pct = ((s.totalValue / totalValue) * 100).toFixed(1);
            return (
              <div key={s.ticker} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: colors[i % colors.length] }}
                />
                <span className="text-sm font-semibold flex-1">{s.ticker}</span>
                <span className="text-sm text-text-secondary">{pct}%</span>
                <span className="text-sm font-bold w-24 text-right">
                  ${s.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-4">Holdings</h2>
        <div className="space-y-4">
          {stocksActivity.map((s) => (
            <div key={s.ticker} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: s.color }}
                >
                  {s.ticker.slice(0, 2)}
                </div>
                <div>
                  <p className="text-sm font-bold">{s.ticker}</p>
                  <p className="text-xs text-text-secondary">{s.shares} shares</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">
                  ${s.totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-xs font-semibold flex items-center justify-end gap-1 ${s.changePercent >= 0 ? "text-accent" : "text-negative"}`}>
                  {s.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
