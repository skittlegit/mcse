"use client";

import { TrendingUp, TrendingDown, BarChart3, DollarSign, Activity } from "lucide-react";
import SparklineChart from "@/components/SparklineChart";
import { portfolio, stocksActivity } from "@/lib/mockData";

export default function AnalyticsPage() {
  const gainers = stocksActivity.filter((s) => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent);
  const losers = stocksActivity.filter((s) => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent);

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Portfolio", value: `$${portfolio.value.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
          { label: "Today's P&L", value: "+$319.37", icon: TrendingUp, color: "text-accent" },
          { label: "Total Stocks", value: String(stocksActivity.length), icon: BarChart3, color: "text-blue-500" },
          { label: "Avg. Return", value: "+2.11%", icon: Activity, color: "text-accent" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface rounded-2xl border border-border p-4">
            <div className={`mb-2 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-xs text-text-secondary">{stat.label}</p>
            <p className="text-lg font-bold mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Portfolio chart */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-bold mb-4">Portfolio Performance</h2>
        <div className="h-[160px]">
          <SparklineChart
            data={portfolio.history.map((h) => ({ v: h.value }))}
            color="#00C896"
            height={160}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" /> Top Gainers
          </h2>
          <div className="space-y-3">
            {gainers.map((s) => (
              <div key={s.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: s.color }}>
                    {s.ticker.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold">{s.ticker}</span>
                </div>
                <span className="text-sm font-semibold text-accent">+{s.changePercent.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="bg-surface rounded-2xl border border-border p-5">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-negative" /> Top Losers
          </h2>
          <div className="space-y-3">
            {losers.length > 0 ? losers.map((s) => (
              <div key={s.ticker} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: s.color }}>
                    {s.ticker.slice(0, 2)}
                  </div>
                  <span className="text-sm font-semibold">{s.ticker}</span>
                </div>
                <span className="text-sm font-semibold text-negative">{s.changePercent.toFixed(2)}%</span>
              </div>
            )) : (
              <p className="text-sm text-text-secondary">No losers today</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
