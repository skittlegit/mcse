"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp, BarChart3, X, ArrowUpDown, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sparkline from "@/components/Sparkline";
import Link from "next/link";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";
import {
  holdings,
  investments,
  portfolioAnalysis,
  stockDirectory,
} from "@/lib/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type SortKey = "ticker" | "currentPrice" | "dayChangePercent" | "returnsPercent" | "currentValue";
type SortDir = "asc" | "desc";

export default function HoldingsPage() {
  const { isLoggedIn } = useAuth();
  const { transactions, balance, placeOrder } = useTrading();
  const [showValues, setShowValues] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [analyseOpen, setAnalyseOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [mobileDisplay, setMobileDisplay] = useState<"market" | "current" | "returns" | "dayChange">("market");
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [buySellTab, setBuySellTab] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"DELIVERY" | "INTRADAY">("DELIVERY");
  const [qty, setQty] = useState(1);
  const [orderMsg, setOrderMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const sorted = useMemo(() => {
    const arr = [...holdings];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "ticker") { av = a.ticker; bv = b.ticker; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function sortIcon(col: SortKey) {
    return sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />;
  }

  const recentTxns = transactions.filter(t => t.type === "BUY" || t.type === "SELL").slice(0, 5);

  const selectedStock = selectedTicker ? stockDirectory[selectedTicker] : null;
  const selectedHolding = selectedTicker ? holdings.find(h => h.ticker === selectedTicker) : null;

  function handleOrder() {
    if (!selectedStock) return;
    const result = placeOrder({ ticker: selectedStock.ticker, name: selectedStock.name, type: buySellTab, orderType, qty, price: selectedStock.price });
    setOrderMsg({ ok: result.success, text: result.message });
    if (result.success) setQty(1);
    setTimeout(() => setOrderMsg(null), 3000);
  }

  if (!isLoggedIn) {
    return (
      <div className="py-6">
        <LoginPrompt message="Log in to view and manage your stock holdings." />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
          HOLDINGS ({holdings.length})
        </h1>
        <button
          onClick={() => setShowValues(!showValues)}
          className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white transition-colors duration-150"
        >
          {showValues ? <Eye size={13} /> : <EyeOff size={13} />}
        </button>
        <button
          onClick={() => setAnalyseOpen(true)}
          className="ml-auto hidden md:flex items-center gap-2 px-4 py-2 border border-white/20 text-[10px] tracking-[0.15em] text-white/50 hover:text-white hover:border-white transition-all duration-150"
        >
          <BarChart3 size={13} />
          ANALYSE
        </button>
        <Link
          href="/analyse"
          className="ml-auto flex md:hidden items-center gap-2 px-4 py-2 border border-white/20 text-[10px] tracking-[0.15em] text-white/50 hover:text-white hover:border-white transition-all duration-150"
        >
          <BarChart3 size={13} />
          ANALYSE
        </Link>
      </div>

      {/* Mobile: Portfolio summary */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="md:hidden border border-white/10 p-5 mb-6"
      >
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">CURRENT VALUE</p>
            <p className="font-[var(--font-anton)] text-2xl tracking-tight">
              {showValues ? `\u20B9${investments.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022"}
            </p>
            <p className={`text-[12px] font-medium mt-1 ${investments.totalReturns >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
              {showValues ? (
                <>{investments.totalReturns >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(investments.totalReturns).toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({investments.totalReturnsPercent.toFixed(2)}%)</>
              ) : (
                <>{investments.totalReturnsPercent >= 0 ? "+" : ""}{investments.totalReturnsPercent.toFixed(2)}%</>
              )}
            </p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">INVESTED</p>
            <p className="font-[var(--font-anton)] text-lg tracking-tight text-white/60">
              {showValues ? `\u20B9${investments.investedValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Desktop 2-column grid */}
      <div className="md:grid md:grid-cols-[13fr_7fr] md:gap-8">
        {/* Left column: Holdings list */}
        <div>

        {/* Mobile: Card list */}
        <div className="md:hidden">
          <div className="flex items-center gap-3 mb-3 relative">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/15 text-[10px] tracking-[0.1em] text-white/60 hover:text-white hover:border-white transition-colors"
            >
              <ArrowUpDown size={11} />
              SORT
            </button>
            {sortOpen && (
              <div className="absolute top-full left-0 mt-1 z-20 border border-white/15 bg-[#0a0a0a] min-w-[140px]">
                {(["ticker", "currentPrice", "returnsPercent", "currentValue", "dayChangePercent"] as SortKey[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => { setSortKey(key); setSortDir("desc"); setSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-[10px] tracking-[0.1em] transition-colors ${sortKey === key ? "text-white bg-white/[0.06]" : "text-white/50 hover:text-white hover:bg-white/[0.03]"}`}
                  >
                    {{ ticker: "NAME", currentPrice: "PRICE", returnsPercent: "RETURNS", currentValue: "VALUE", dayChangePercent: "1D CHANGE" }[key]}
                  </button>
                ))}
              </div>
            )}
            <span className="text-[9px] tracking-[0.1em] text-white/25 ml-auto">
              {{ ticker: "NAME", currentPrice: "PRICE", returnsPercent: "RETURNS", currentValue: "VALUE", dayChangePercent: "1D CHANGE" }[sortKey]}
            </span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setMobileDisplay((d) => {
                  const order: typeof mobileDisplay[] = ["market", "current", "returns", "dayChange"];
                  return order[(order.indexOf(d) + 1) % order.length];
                });
              }}
              className="px-3 py-1.5 border border-white/15 text-[10px] tracking-[0.1em] text-white/60 hover:text-white hover:border-white transition-colors"
            >
              {{ market: "MKT PRICE", current: "CURRENT", returns: "RETURNS", dayChange: "1D CHG" }[mobileDisplay]}
            </button>
          </div>
          <div className="space-y-2">
          {sorted.map((h, i) => (
            <motion.div
              key={h.ticker}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
            >
              <Link
                href={`/stock/${h.ticker}`}
                className="flex items-center justify-between bg-white/[0.02] border border-white/6 p-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{h.ticker}</p>
                    <p className="text-[10px] text-white/30 truncate">{h.name}</p>
                  </div>
                  <p className="text-[10px] text-white/40 mt-1">
                    {showValues ? <>{h.qty} shares · Avg {"\u20B9"}{h.avgPrice.toFixed(2)}</> : <>{h.qty > 0 ? "\u2022\u2022\u2022" : ""}</>}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  {mobileDisplay === "market" && (
                    <>
                      <p className="font-[var(--font-anton)] text-[13px]">
                        {"\u20B9"}{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-[11px] font-medium ${h.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent.toFixed(2)}%
                      </p>
                    </>
                  )}
                  {mobileDisplay === "current" && (
                    <>
                      <p className="font-[var(--font-anton)] text-[13px]">
                        {showValues ? `\u20B9${h.currentValue.toLocaleString("en-IN")}` : "\u2022\u2022\u2022\u2022"}
                      </p>
                      <p className="text-[10px] text-white/30">
                        {showValues ? `Inv \u20B9${h.investedValue.toLocaleString("en-IN")}` : "\u2022\u2022\u2022\u2022"}
                      </p>
                    </>
                  )}
                  {mobileDisplay === "returns" && (
                    <>
                      <p className={`font-[var(--font-anton)] text-[13px] ${h.returnsPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(2)}%
                      </p>
                      <p className={`text-[10px] ${h.returns >= 0 ? "text-[#00D26A]/60" : "text-[#FF5252]/60"}`}>
                        {showValues ? `${h.returns >= 0 ? "+" : ""}\u20B9${h.returns.toLocaleString("en-IN")}` : "\u2022\u2022\u2022"}
                      </p>
                    </>
                  )}
                  {mobileDisplay === "dayChange" && (
                    <>
                      <p className={`font-[var(--font-anton)] text-[13px] ${h.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                        {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent.toFixed(2)}%
                      </p>
                      <p className={`text-[10px] ${h.dayChange >= 0 ? "text-[#00D26A]/60" : "text-[#FF5252]/60"}`}>
                        {h.dayChange >= 0 ? "+" : ""}{"\u20B9"}{h.dayChange.toFixed(2)}
                      </p>
                    </>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Desktop: Table with sortable headers */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-2 border-b border-white/12">
            <button onClick={() => toggleSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
              COMPANY {sortIcon("ticker")}
            </button>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
            <button onClick={() => toggleSort("currentPrice")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
              MKT PRICE {sortIcon("currentPrice")}
            </button>
            <button onClick={() => toggleSort("returnsPercent")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
              RETURNS {sortIcon("returnsPercent")}
            </button>
            <button onClick={() => toggleSort("currentValue")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
              CURRENT {sortIcon("currentValue")}
            </button>
          </div>

          {sorted.map((h) => (
            <div
              key={h.ticker}
              onClick={() => { setSelectedTicker(h.ticker); setQty(1); setOrderMsg(null); }}
              className={`grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center cursor-pointer ${selectedTicker === h.ticker ? "bg-white/[0.06]" : ""}`}
            >
              <div>
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{h.ticker}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{h.name}{showValues ? <> · {h.qty} shares · Avg {"\u20B9"}{h.avgPrice.toFixed(2)}</> : null}</p>
              </div>
              <div className="flex justify-end">
                <Sparkline data={h.sparkline} width={60} height={20} positive={h.dayChangePercent >= 0} />
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {"\u20B9"}{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[10px] font-medium ${h.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent.toFixed(2)}%
                </p>
              </div>
              <div className="text-right">
                <p className={`font-[var(--font-anton)] text-[13px] ${h.returnsPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(2)}%
                </p>
                <p className="text-[10px] text-white/30">
                  {showValues ? `${h.returns >= 0 ? "+" : ""}\u20B9${h.returns.toLocaleString("en-IN")}` : "\u2022\u2022\u2022\u2022"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {showValues ? `\u20B9${h.currentValue.toLocaleString("en-IN")}` : "\u2022\u2022\u2022\u2022"}
                </p>
                <p className="text-[10px] text-white/30">
                  {showValues ? `\u20B9${h.investedValue.toLocaleString("en-IN")}` : "\u2022\u2022\u2022\u2022"}
                </p>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Right sidebar (desktop): Portfolio summary + Order panel + Transactions */}
        <aside className="hidden md:block space-y-6">
          {/* Portfolio summary card */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-2">CURRENT VALUE</p>
            <p className="font-[var(--font-anton)] text-2xl tracking-tight mb-1">
              {showValues ? `\u20B9${investments.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022"}
            </p>
            <p className={`text-[12px] font-medium ${investments.totalReturns >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
              {showValues ? (
                <>{investments.totalReturns >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(investments.totalReturns).toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({investments.totalReturnsPercent.toFixed(2)}%)</>
              ) : (
                <>{investments.totalReturnsPercent >= 0 ? "+" : ""}{investments.totalReturnsPercent.toFixed(2)}%</>
              )}
            </p>
            <div className="mt-4 pt-4 border-t border-white/8">
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">INVESTED</p>
              <p className="font-[var(--font-anton)] text-lg tracking-tight text-white/60">
                {showValues ? `\u20B9${investments.investedValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022"}
              </p>
            </div>
          </div>

          {/* Order panel — shown when a holding is selected */}
          {selectedStock && (
            <div className="border border-white/10 p-5">
              {/* Order feedback toast */}
              <AnimatePresence>
                {orderMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`mb-4 p-3 border text-[10px] tracking-[0.1em] ${orderMsg.ok ? "border-[#00D26A]/30 text-[#00D26A] bg-[#00D26A]/5" : "border-[#FF5252]/30 text-[#FF5252] bg-[#FF5252]/5"}`}
                  >
                    {orderMsg.text}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Stock header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-[var(--font-anton)] text-[15px] tracking-[0.05em]">{selectedStock.ticker}</p>
                  <p className="text-[10px] text-white/40">{selectedStock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-[var(--font-anton)] text-[15px]">{"\u20B9"}{selectedStock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                  <p className={`text-[10px] font-medium ${selectedStock.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {selectedStock.changePercent >= 0 ? "+" : ""}{selectedStock.changePercent.toFixed(2)}%
                  </p>
                </div>
              </div>

              {/* Holding info */}
              {selectedHolding && (
                <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-white/[0.03] border border-white/6">
                  <div>
                    <p className="text-[8px] tracking-[0.1em] text-white/25">QTY HELD</p>
                    <p className="text-[12px] font-[var(--font-anton)]">{selectedHolding.qty}</p>
                  </div>
                  <div>
                    <p className="text-[8px] tracking-[0.1em] text-white/25">AVG PRICE</p>
                    <p className="text-[12px] font-[var(--font-anton)]">{"\u20B9"}{selectedHolding.avgPrice.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {/* BUY / SELL tabs */}
              <div className="flex border-b border-white/10 mb-4">
                <button
                  onClick={() => setBuySellTab("BUY")}
                  className={`flex-1 py-2 text-[10px] tracking-[0.15em] font-medium transition-colors ${buySellTab === "BUY" ? "text-[#00D26A] border-b-2 border-[#00D26A]" : "text-white/30 hover:text-white/50"}`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setBuySellTab("SELL")}
                  className={`flex-1 py-2 text-[10px] tracking-[0.15em] font-medium transition-colors ${buySellTab === "SELL" ? "text-[#FF5252] border-b-2 border-[#FF5252]" : "text-white/30 hover:text-white/50"}`}
                >
                  SELL
                </button>
              </div>

              {/* Order type */}
              <div className="flex gap-3 mb-4">
                {(["DELIVERY", "INTRADAY"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`flex items-center gap-1.5 text-[10px] tracking-[0.1em] transition-colors ${orderType === t ? "text-white" : "text-white/30 hover:text-white/50"}`}
                  >
                    <span className={`w-3 h-3 border ${orderType === t ? "border-white bg-white" : "border-white/30"}`}>
                      {orderType === t && <span className="block w-1.5 h-1.5 bg-[#0a0a0a] m-auto mt-[2px]" />}
                    </span>
                    {t}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="mb-4">
                <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1.5">QUANTITY</p>
                <div className="flex items-center border border-white/15">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <Minus size={12} />
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 h-10 text-center bg-transparent text-[14px] font-[var(--font-anton)] outline-none border-x border-white/15 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white/5 transition-colors">
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Est total */}
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] tracking-[0.15em] text-white/30">EST. TOTAL</p>
                <p className="font-[var(--font-anton)] text-[15px]">{"\u20B9"}{(selectedStock.price * qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/8">
                <p className="text-[9px] tracking-[0.15em] text-white/30">BALANCE</p>
                <p className="text-[11px] text-white/50">{"\u20B9"}{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
              </div>

              {/* Action button */}
              <button
                onClick={handleOrder}
                className={`w-full py-3 text-[11px] tracking-[0.2em] font-medium transition-all hover:opacity-90 ${
                  buySellTab === "BUY"
                    ? "bg-[#00D26A] text-black"
                    : "bg-[#FF5252] text-white"
                }`}
              >
                {buySellTab} {selectedStock.ticker}
              </button>

              {/* View detail link */}
              <Link
                href={`/stock/${selectedStock.ticker}`}
                className="block mt-3 text-[10px] tracking-[0.1em] text-white/30 hover:text-white transition-colors text-center"
              >
                VIEW STOCK DETAILS →
              </Link>
            </div>
          )}

          {/* Placeholder when no stock selected */}
          {!selectedStock && (
            <div className="border border-white/10 p-5 flex items-center justify-center min-h-[120px]">
              <p className="text-[10px] tracking-[0.1em] text-white/20 text-center">SELECT A HOLDING<br />TO TRADE</p>
            </div>
          )}

          {/* Recent transactions */}
          {recentTxns.length > 0 && (
            <div className="border border-white/10 p-5">
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">RECENT ACTIVITY</p>
              <div className="space-y-2">
                {recentTxns.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] tracking-[0.1em] font-semibold px-1.5 py-0.5 border ${
                        txn.type === "BUY"
                          ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                          : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                      }`}>
                        {txn.type}
                      </span>
                      <span className="text-[10px] text-white/40">{txn.ticker}</span>
                    </div>
                    <span className="text-[10px] font-[var(--font-anton)]">{"\u20B9"}{Math.abs(txn.amount).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Analyse Modal */}
      <AnimatePresence>
        {analyseOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50"
              onClick={() => setAnalyseOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[700px] md:max-h-[80vh] bg-[#0a0a0a] border border-white/15 z-50 overflow-y-auto"
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h3 className="font-[var(--font-anton)] text-lg tracking-[0.1em]">PORTFOLIO ANALYSIS</h3>
                <button onClick={() => setAnalyseOpen(false)} className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
                  <X size={14} />
                </button>
              </div>

              <div className="p-5 md:p-6">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[1px] bg-white/8 mb-6">
                  <div className="bg-[#0a0a0a] p-4">
                    <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">XIRR</p>
                    <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.xirr}%</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-4">
                    <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">{portfolioAnalysis.benchmarkName}</p>
                    <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.benchmarkReturn}%</p>
                  </div>
                  <div className="bg-[#0a0a0a] p-4">
                    <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">ALPHA</p>
                    <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.outperformance}%</p>
                  </div>
                </div>

                {/* Chart */}
                <div className="h-64 md:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={portfolioAnalysis.performanceChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#666666" stopOpacity={0.1} />
                          <stop offset="100%" stopColor="#666666" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11, color: "#fff" }}
                        formatter={(value) => [`\u20B9${Number(value).toLocaleString("en-IN")}`, ""]}
                        labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginBottom: 4 }}
                      />
                      <Area type="monotone" dataKey="portfolio" stroke="#fff" strokeWidth={1.5} fill="url(#portfolioGrad)" name="Portfolio" />
                      <Area type="monotone" dataKey="benchmark" stroke="#555" strokeWidth={1} fill="url(#benchGrad)" name={portfolioAnalysis.benchmarkName} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-6 mt-4 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-white" />
                    <span className="text-[9px] tracking-[0.1em] text-white/40">PORTFOLIO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-[2px] bg-white/30" style={{ borderTop: "1px dashed" }} />
                    <span className="text-[9px] tracking-[0.1em] text-white/40">{portfolioAnalysis.benchmarkName}</span>
                  </div>
                </div>

                {/* Sector Allocation */}
                <div className="mt-8">
                  <h4 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">SECTOR ALLOCATION</h4>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <div className="w-48 h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={portfolioAnalysis.sectorAllocation}
                            dataKey="value"
                            nameKey="sector"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            innerRadius={35}
                            strokeWidth={1}
                            stroke="#0a0a0a"
                          >
                            {portfolioAnalysis.sectorAllocation.map((_: { sector: string; value: number }, idx: number) => (
                              <Cell key={idx} fill={["#fff", "#888", "#555", "#aaa", "#666", "#ccc"][idx % 6]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11, color: "#fff" }}
                            formatter={(value) => [`${value}%`, ""]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {portfolioAnalysis.sectorAllocation.map((s: { sector: string; value: number }, i: number) => (
                        <div key={s.sector} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5" style={{ backgroundColor: ["#fff", "#888", "#555", "#aaa", "#666", "#ccc"][i % 6] }} />
                            <span className="text-[10px] text-white/50">{s.sector}</span>
                          </div>
                          <span className="text-[11px] font-[var(--font-anton)]">{s.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Market Cap Allocation */}
                <div className="mt-8">
                  <h4 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">MARKET CAP ALLOCATION</h4>
                  <div className="space-y-3">
                    {portfolioAnalysis.marketCapAllocation.map((m: { cap: string; value: number }) => (
                      <div key={m.cap}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] tracking-[0.1em] text-white/50">{m.cap.toUpperCase()}</span>
                          <span className="text-[11px] font-[var(--font-anton)]">{m.value}%</span>
                        </div>
                        <div className="h-1.5 bg-white/8 w-full">
                          <div className="h-full bg-white/60" style={{ width: `${m.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
