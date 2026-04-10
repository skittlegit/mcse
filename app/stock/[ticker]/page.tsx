"use client";

import { useState, use } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { stockDirectory, watchlist, holdings } from "@/lib/mockData";
import Sparkline from "@/components/Sparkline";

const timeRanges = ["1D", "1W", "1M", "1Y", "ALL"] as const;

export default function StockDetailPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = use(params);
  const router = useRouter();
  const stock = stockDirectory[ticker.toUpperCase()];
  const [range, setRange] = useState<string>("1D");
  const [qty, setQty] = useState(1);

  const isHeld = holdings.some((h) => h.ticker === ticker.toUpperCase());
  const isWatched = watchlist.some((w) => w.ticker === ticker.toUpperCase());
  const holdingData = holdings.find((h) => h.ticker === ticker.toUpperCase());

  if (!stock) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-[var(--font-anton)] text-2xl tracking-[0.1em] uppercase mb-2"
        >
          STOCK NOT FOUND
        </motion.h1>
        <p className="text-[11px] text-white/40 mb-4">{ticker.toUpperCase()}</p>
        <Link
          href="/"
          className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
        >
          BACK TO EXPLORE
        </Link>
      </div>
    );
  }

  const chartData = stock.chartData[range] || stock.chartData["1D"];
  const chartValues = chartData.map((d) => d.price);

  return (
    <div className="pb-32 md:pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-white/8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors duration-150"
          >
            <ArrowLeft size={15} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-white/25 flex items-center justify-center">
              <span className="text-[9px] tracking-[0.1em] text-white/50">{stock.ticker.slice(0, 3)}</span>
            </div>
            <div>
              <p className="font-[var(--font-anton)] text-base md:text-lg tracking-[0.05em]">{stock.ticker}</p>
              <p className="text-[10px] text-white/40">{stock.name}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHeld && (
            <span className="text-[8px] tracking-[0.15em] text-[#00D26A] border border-[#00D26A]/30 bg-[#00D26A]/10 px-2.5 py-1">HELD</span>
          )}
          {isWatched && (
            <span className="text-[8px] tracking-[0.15em] text-white/40 border border-white/15 px-2.5 py-1">WATCHED</span>
          )}
        </div>
      </motion.div>

      <div className="flex gap-0">
        {/* Main content */}
        <div className="flex-1 min-w-0 px-5 md:px-6 py-6">
          {/* Price */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mb-7 md:mb-8"
          >
            <p className="font-[var(--font-anton)] text-3xl md:text-4xl tracking-tight mb-1.5">
              {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <p className={`text-[12px] font-medium ${stock.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
              {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}% {"\u00B7"} {range}
            </p>
          </motion.div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="mb-5 md:mb-6 border border-white/8 p-4 md:p-6"
          >
            <Sparkline data={chartValues} width={600} height={180} strokeWidth={1.5} positive={stock.changePercent >= 0} />
            <div className="flex justify-between mt-3">
              {chartData.map((d) => (
                <span key={d.day} className="text-[8px] text-white/20">{d.day}</span>
              ))}
            </div>
          </motion.div>

          {/* Time range selector */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex items-center gap-0 mb-7 md:mb-8 overflow-x-auto scrollbar-hide"
          >
            {timeRanges.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-2.5 text-[10px] tracking-[0.15em] border transition-all duration-150 ${
                  range === r
                    ? "bg-white text-black border-white"
                    : "bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white"
                }`}
              >
                {r}
              </button>
            ))}
          </motion.div>

          {/* Your holding info (if held) */}
          {holdingData && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
              className="mb-7 md:mb-8 border border-white/10 p-5"
            >
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">YOUR HOLDING</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">QTY</p>
                  <p className="font-[var(--font-anton)] text-base">{holdingData.qty}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">AVG PRICE</p>
                  <p className="font-[var(--font-anton)] text-base">{"\u20B9"}{holdingData.avgPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">INVESTED</p>
                  <p className="font-[var(--font-anton)] text-base">{"\u20B9"}{holdingData.investedValue.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">RETURNS</p>
                  <p className={`font-[var(--font-anton)] text-base ${holdingData.returnsPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {holdingData.returnsPercent >= 0 ? "+" : ""}{holdingData.returnsPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">OVERVIEW</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/8">
              {[
                { label: "OPEN", value: stock.overview.open },
                { label: "DAY LOW", value: stock.overview.dayLow },
                { label: "DAY HIGH", value: stock.overview.dayHigh },
              ].map((item) => (
                <div key={item.label} className="bg-[#0a0a0a] p-4 md:p-5">
                  <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-1.5">{item.label}</p>
                  <p className="font-[var(--font-anton)] text-lg md:text-xl">
                    {"\u20B9"}{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 52-Week Range */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="mt-7 md:mt-8"
          >
            <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">52 WEEK RANGE</h3>
            <div className="border border-white/8 p-5">
              <div className="flex justify-between mb-2">
                <span className="text-[10px] text-white/30">{"\u20B9"}{stock.fundamentals.w52Low.toLocaleString("en-IN")}</span>
                <span className="text-[10px] text-white/30">{"\u20B9"}{stock.fundamentals.w52High.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-1.5 bg-white/8 relative">
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-white/40"
                  style={{
                    left: `${Math.min(100, Math.max(0, ((stock.price - stock.fundamentals.w52Low) / (stock.fundamentals.w52High - stock.fundamentals.w52Low)) * 100))}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#FF5252]/40 via-white/20 to-[#00D26A]/40"
                  style={{ width: "100%" }}
                />
              </div>
              <p className="text-[9px] text-white/20 mt-2 text-center">
                CURRENT: {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </motion.div>

          {/* Fundamentals */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-7 md:mt-8"
          >
            <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">FUNDAMENTALS</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/8">
              {[
                { label: "MARKET CAP", value: stock.fundamentals.marketCap },
                { label: "P/E RATIO", value: stock.fundamentals.pe.toFixed(1) },
                { label: "EPS", value: `\u20B9${stock.fundamentals.eps.toFixed(2)}` },
                { label: "BOOK VALUE", value: `\u20B9${stock.fundamentals.bookValue.toLocaleString("en-IN")}` },
                { label: "DIV YIELD", value: `${stock.fundamentals.dividendYield.toFixed(1)}%` },
                { label: "ROE", value: `${stock.fundamentals.roe.toFixed(1)}%` },
                { label: "DEBT/EQUITY", value: stock.fundamentals.debtToEquity.toFixed(2) },
                { label: "VOLUME", value: stock.fundamentals.volume },
                { label: "AVG VOLUME", value: stock.fundamentals.avgVolume },
              ].map((item) => (
                <div key={item.label} className="bg-[#0a0a0a] p-4">
                  <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-1.5">{item.label}</p>
                  <p className="font-[var(--font-anton)] text-base">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 px-1">
              <p className="text-[9px] tracking-[0.1em] text-white/20">SECTOR: <span className="text-white/40">{stock.fundamentals.sector}</span></p>
            </div>
          </motion.div>
        </div>

        {/* Desktop sidebar order panel */}
        <aside className="hidden lg:block w-80 border-l border-white/8 shrink-0 p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-4">PLACE ORDER</p>
            <div className="mb-4">
              <label className="text-[10px] tracking-[0.1em] text-white/40 mb-2 block">QTY</label>
              <div className="flex items-center border border-white/20">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {"\u2212"}
                </button>
                <input
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 h-10 bg-transparent text-center font-[var(--font-anton)] text-lg text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {"+"}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-6 py-3 border-t border-b border-white/8">
              <span className="text-[10px] tracking-[0.1em] text-white/40">ESTIMATED TOTAL</span>
              <span className="font-[var(--font-anton)] text-xl">
                {"\u20B9"}{(stock.price * qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 h-11 bg-[#00D26A] text-black text-[10px] tracking-[0.15em] font-semibold border border-[#00D26A] hover:bg-transparent hover:text-[#00D26A] transition-all duration-150">
                BUY
              </button>
              <button className="flex-1 h-11 bg-[#FF5252] text-white text-[10px] tracking-[0.15em] font-semibold border border-[#FF5252] hover:bg-transparent hover:text-[#FF5252] transition-all duration-150">
                SELL
              </button>
            </div>
            <div className="mt-6 pt-4 border-t border-white/8">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#00D26A]" />
                <span className="text-[10px] tracking-[0.1em] text-white/40">MARKET OPEN</span>
              </div>
              <p className="text-[10px] text-white/20 mt-1">MCSE Exchange</p>
            </div>
          </motion.div>
        </aside>
      </div>

      {/* Mobile fixed bottom buy/sell bar */}
      <div className="fixed bottom-14 left-0 right-0 z-40 lg:hidden border-t border-white/12 bg-[#0a0a0a]/95 backdrop-blur-md">
        <div className="flex">
          <button className="flex-1 py-4 text-[11px] tracking-[0.15em] font-semibold bg-[#00D26A] text-black active:bg-[#00D26A]/80 transition-all">
            BUY {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
          </button>
          <button className="flex-1 py-4 text-[11px] tracking-[0.15em] font-semibold bg-[#FF5252] text-white active:bg-[#FF5252]/80 transition-all">
            SELL
          </button>
        </div>
      </div>
    </div>
  );
}
