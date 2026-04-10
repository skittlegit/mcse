"use client";

import { useState, use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { stockDirectory } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";
import { PageWrap, FadeIn } from "@/components/Motion";

const timeRanges = ["1D", "1W", "1M", "1Y", "ALL"] as const;

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const stock = stockDirectory[ticker.toUpperCase()];
  const [range, setRange] = useState<string>("1D");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"buy" | "sell">("buy");

  if (!stock) {
    return (
      <PageWrap>
        <div className="flex flex-col items-center justify-center py-32 px-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-[var(--font-anton)] text-2xl tracking-[0.1em] uppercase mb-2"
          >
            STOCK NOT FOUND
          </motion.h1>
          <p className="text-[11px] text-[#aaaaaa] mb-4">
            {ticker.toUpperCase()}
          </p>
          <Link
            href="/"
            className="text-[10px] tracking-[0.15em] text-[#aaaaaa] hover:text-white border-b border-[rgba(255,255,255,0.3)] pb-0.5"
          >
            BACK TO EXPLORE
          </Link>
        </div>
      </PageWrap>
    );
  }

  const chartData = stock.chartData[range] || stock.chartData["1D"];
  const chartValues = chartData.map((d) => d.price);

  return (
    <PageWrap>
      <div className="pb-24 md:pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-4 px-4 md:px-6 py-4 border-b border-[rgba(255,255,255,0.08)]"
        >
          <Link
            href="/"
            className="w-8 h-8 border border-[rgba(255,255,255,0.2)] flex items-center justify-center hover:border-white transition-colors duration-150"
          >
            <ArrowLeft size={14} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-[rgba(255,255,255,0.3)] flex items-center justify-center">
              <span className="text-[9px] tracking-[0.1em] text-[#aaaaaa]">
                {stock.ticker.slice(0, 3)}
              </span>
            </div>
            <div>
              <p className="font-[var(--font-anton)] text-lg tracking-[0.05em]">
                {stock.ticker}
              </p>
              <p className="text-[10px] text-[#aaaaaa]">{stock.name}</p>
            </div>
          </div>
        </motion.div>

        <div className="flex gap-0">
          {/* Main content */}
          <div className="flex-1 min-w-0 px-4 md:px-6 py-6">
            {/* Price */}
            <FadeIn delay={0.1}>
              <div className="mb-8">
                <p className="font-[var(--font-anton)] text-3xl md:text-4xl tracking-tight mb-1">
                  {"₹"}
                  {stock.price.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p
                  className={`text-[11px] ${stock.changePercent >= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {stock.changePercent >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}% {"·"} {range}
                </p>
              </div>
            </FadeIn>

            {/* Chart */}
            <FadeIn delay={0.2}>
              <div className="mb-6 border border-[rgba(255,255,255,0.08)] p-3 md:p-6">
                <Sparkline
                  data={chartValues}
                  width={600}
                  height={180}
                  strokeWidth={1.5}
                />
                <div className="flex justify-between mt-3">
                  {chartData.map((d) => (
                    <span key={d.day} className="text-[8px] text-[#666]">
                      {d.day}
                    </span>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Time range selector */}
            <FadeIn delay={0.3}>
              <div className="flex items-center gap-0 mb-8 overflow-x-auto">
                {timeRanges.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`relative px-3 md:px-4 py-2 text-[10px] tracking-[0.15em] border transition-all duration-150 ${
                      range === r
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-[#aaaaaa] border-[rgba(255,255,255,0.2)] hover:text-white hover:border-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </FadeIn>

            {/* Overview */}
            <FadeIn delay={0.4}>
              <div>
                <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">
                  OVERVIEW
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {[
                    { label: "OPEN", value: stock.overview.open },
                    { label: "DAY LOW", value: stock.overview.dayLow },
                    { label: "DAY HIGH", value: stock.overview.dayHigh },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="border border-[rgba(255,255,255,0.08)] p-3 md:p-4"
                    >
                      <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-1">
                        {item.label}
                      </p>
                      <p className="font-[var(--font-anton)] text-base md:text-lg">
                        {"₹"}
                        {item.value.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Desktop sidebar order panel */}
          <aside className="hidden lg:block w-80 border-l border-[rgba(255,255,255,0.08)] shrink-0 p-6">
            <FadeIn delay={0.3}>
              <p className="text-[9px] tracking-[0.2em] text-[#666] uppercase mb-4">
                PLACE ORDER
              </p>
              <div className="mb-4">
                <label className="text-[10px] tracking-[0.1em] text-[#aaaaaa] mb-2 block">
                  QTY
                </label>
                <div className="flex items-center border border-[rgba(255,255,255,0.2)]">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-10 h-10 flex items-center justify-center text-[#aaaaaa] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    {"−"}
                  </button>
                  <input
                    type="number"
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="flex-1 h-10 bg-transparent text-center font-[var(--font-anton)] text-lg text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-10 h-10 flex items-center justify-center text-[#aaaaaa] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors"
                  >
                    {"+"}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6 py-3 border-t border-b border-[rgba(255,255,255,0.08)]">
                <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">
                  ESTIMATED TOTAL
                </span>
                <span className="font-[var(--font-anton)] text-xl">
                  {"₹"}
                  {(stock.price * qty).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 h-11 bg-white text-black text-[10px] tracking-[0.15em] font-semibold border border-white hover:bg-transparent hover:text-white transition-all duration-150">
                  BUY
                </button>
                <button className="flex-1 h-11 border border-white text-white text-[10px] tracking-[0.15em] font-semibold hover:bg-white hover:text-black transition-all duration-150">
                  SELL
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-white" />
                  <span className="text-[10px] tracking-[0.1em] text-[#aaaaaa]">
                    MARKET OPEN
                  </span>
                </div>
                <p className="text-[10px] text-[#666] mt-1">NSE {"·"} BSE</p>
              </div>
            </FadeIn>
          </aside>
        </div>

        {/* Mobile fixed bottom buy/sell bar */}
        <div className="fixed bottom-16 left-0 right-0 z-40 lg:hidden border-t border-[rgba(255,255,255,0.12)] bg-[#0a0a0a]/95 backdrop-blur-md">
          <div className="flex">
            <button
              onClick={() => setTab("buy")}
              className={`flex-1 py-3 text-[10px] tracking-[0.15em] font-semibold transition-all ${
                tab === "buy"
                  ? "bg-white text-black"
                  : "text-[#aaaaaa] hover:text-white"
              }`}
            >
              BUY {"₹"}
              {(stock.price * qty).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
              })}
            </button>
            <button
              onClick={() => setTab("sell")}
              className={`flex-1 py-3 text-[10px] tracking-[0.15em] font-semibold transition-all border-l border-[rgba(255,255,255,0.12)] ${
                tab === "sell"
                  ? "bg-white text-black"
                  : "text-[#aaaaaa] hover:text-white"
              }`}
            >
              SELL
            </button>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
