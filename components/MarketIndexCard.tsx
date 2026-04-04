"use client";

import SparklineChart from "./SparklineChart";
import StatBadge from "./StatBadge";
import type { MarketIndex } from "@/lib/mockData";

export default function MarketIndexCard({ index }: { index: MarketIndex }) {
  const dark = index.variant === "dark";
  return (
    <div
      className={`min-w-[200px] rounded-2xl p-4 shadow-sm ${
        dark
          ? "bg-dark-card text-white"
          : "bg-surface text-text-primary border border-border"
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${dark ? "text-white/60" : "text-text-secondary"}`}>
        {index.name}
      </p>
      <p className="text-lg font-bold">
        ${index.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
      </p>
      <StatBadge value={index.changePercent} className="my-2" />
      <SparklineChart
        data={index.sparkline}
        color={dark ? "#FFFFFF" : "#00C896"}
        height={36}
      />
    </div>
  );
}
