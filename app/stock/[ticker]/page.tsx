"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Share2, Info } from "lucide-react";
import StockChart from "@/components/StockChart";
import TimeRangeTabs from "@/components/TimeRangeTabs";
import StatBadge from "@/components/StatBadge";
import BuyModal from "@/components/BuyModal";
import { stockDirectory, tslaChartData, tslaOverview } from "@/lib/mockData";

const ranges = ["1D", "1W", "1M", "1Y", "ALL"];

export default function StockDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticker = (params.ticker as string) ?? "TSLA";

  const [activeRange, setActiveRange] = useState("1W");
  const [showBuy, setShowBuy] = useState(false);

  const info = stockDirectory[ticker];
  const stock = info ?? {
    ticker,
    name: ticker,
    price: 0,
    changePercent: 0,
    color: "#7A8A99",
    chartData: tslaChartData,
    overview: tslaOverview,
  };

  const chartData = stock.chartData[activeRange] ?? stock.chartData["1W"];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-base">Stock Details</h1>
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors">
          <Share2 size={18} />
        </button>
      </header>

      <div className="px-5 md:px-8 lg:grid lg:grid-cols-5 lg:gap-8">
        {/* ── Left Column (chart) ── */}
        <div className="lg:col-span-3 space-y-5">
          {/* Stock identity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: stock.color }}
              >
                {stock.ticker.slice(0, 1)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{stock.ticker}</h2>
                <p className="text-sm text-text-secondary">{stock.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">
                ${stock.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <StatBadge value={stock.changePercent} />
            </div>
          </div>

          {/* Time tabs */}
          <TimeRangeTabs
            ranges={ranges}
            active={activeRange}
            onChange={setActiveRange}
          />

          {/* Chart */}
          <div className="bg-surface rounded-2xl border border-border p-4 h-[280px] lg:h-[380px]">
            <StockChart data={chartData} />
          </div>
        </div>

        {/* ── Right Column (overview + actions) ── */}
        <div className="lg:col-span-2 mt-6 lg:mt-0 space-y-6">
          {/* Overview */}
          <div className="bg-surface rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Overview</h3>
              <Info size={16} className="text-text-secondary" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Open", value: stock.overview.open },
                { label: "Day Low", value: stock.overview.dayLow },
                { label: "Day High", value: stock.overview.dayHigh },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-xs text-text-secondary mb-1">{s.label}</p>
                  <p className="font-bold text-sm">${s.value.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About — desktop */}
          <div className="hidden lg:block bg-surface rounded-2xl border border-border p-5">
            <h3 className="font-bold mb-2">About {stock.ticker}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              {stock.name} is a leading company in its sector, known for
              innovation and strong market performance. The company continues to
              expand globally with a focus on sustainable growth and
              technological advancement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-20 md:bottom-4 lg:static">
            <button
              onClick={() => setShowBuy(true)}
              className="flex-1 py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
            >
              Buy
            </button>
            <button className="flex-1 py-3 rounded-full bg-dark-card text-white font-semibold hover:bg-dark-card/90 transition-colors">
              Follow
            </button>
          </div>
        </div>
      </div>

      {showBuy && (
        <BuyModal ticker={stock.ticker} onClose={() => setShowBuy(false)} />
      )}
    </div>
  );
}
