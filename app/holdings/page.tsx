"use client";

import { useState, useMemo } from "react";
import { Eye, EyeOff, ChevronDown, ChevronUp, BarChart3, X, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sparkline from "@/components/Sparkline";
import Link from "next/link";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";
import {
  holdings,
  investments,
  userProfile,
  portfolioAnalysis,
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
  const { placeOrder, getOrdersForTicker, getBuyCount, getSellCount, balance } = useTrading();
  const [showValues, setShowValues] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("currentValue");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [analyseOpen, setAnalyseOpen] = useState(false);
  const [buySellTab, setBuySellTab] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"DELIVERY" | "INTRADAY">("DELIVERY");
  const [qty, setQty] = useState(1);
  const [orderMsg, setOrderMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [sortOpen, setSortOpen] = useState(false);

  const selectedHolding = holdings.find((h) => h.ticker === selectedTicker);
  const selectedOrders = selectedTicker ? getOrdersForTicker(selectedTicker) : [];

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

  function handleOrder() {
    if (!selectedHolding) return;
    const result = placeOrder({
      ticker: selectedHolding.ticker,
      name: selectedHolding.name,
      type: buySellTab,
      orderType,
      qty,
      price: selectedHolding.currentPrice,
    });
    setOrderMsg({ text: result.message, success: result.success });
    if (result.success) setQty(1);
    setTimeout(() => setOrderMsg(null), 3000);
  }

  function sortIcon(col: SortKey) {
    return sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />;
  }

  if (!isLoggedIn) {
    return (
      <div className="pb-20 md:pb-12 px-5 md:px-6 py-6">
        <LoginPrompt message="Log in to view and manage your stock holdings." />
      </div>
    );
  }

  return (
    <div className="flex gap-0 pb-20 md:pb-12 min-h-[calc(100vh-6rem)]">
      {/* Order feedback toast */}
      <AnimatePresence>
        {orderMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-[70] px-6 py-3 border text-[11px] tracking-[0.1em] ${
              orderMsg.success
                ? "bg-[#00D26A]/10 border-[#00D26A]/30 text-[#00D26A]"
                : "bg-[#FF5252]/10 border-[#FF5252]/30 text-[#FF5252]"
            }`}
          >
            {orderMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 min-w-0 px-5 md:px-6 py-6 md:py-6">
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
            className="ml-auto flex items-center gap-2 px-4 py-2 border border-white/20 text-[10px] tracking-[0.15em] text-white/50 hover:text-white hover:border-white transition-all duration-150"
          >
            <BarChart3 size={13} />
            ANALYSE
          </button>
        </div>

        {/* Portfolio summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="border border-white/10 p-5 md:p-6 mb-7"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">CURRENT VALUE</p>
              <p className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-tight">
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
            <div className="text-left md:text-right">
              <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">INVESTED</p>
              <p className="font-[var(--font-anton)] text-xl md:text-2xl tracking-tight text-white/60">
                {showValues ? `\u20B9${investments.investedValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "\u20B9 \u2022\u2022\u2022\u2022\u2022\u2022"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Holdings list header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase">YOUR STOCKS</h2>
        </div>

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
                  <p className="font-[var(--font-anton)] text-[13px]">
                    {"\u20B9"}{h.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[11px] font-medium ${h.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {h.dayChangePercent >= 0 ? "+" : ""}{h.dayChangePercent.toFixed(2)}%
                  </p>
                  {showValues && (
                    <p className={`text-[10px] ${h.returnsPercent >= 0 ? "text-[#00D26A]/60" : "text-[#FF5252]/60"}`}>
                      {h.returnsPercent >= 0 ? "+" : ""}{h.returnsPercent.toFixed(2)}%
                    </p>
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
            <Link
              key={h.ticker}
              href={`/stock/${h.ticker}`}
              className={`grid grid-cols-[1fr_80px_100px_100px_120px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center cursor-pointer ${
                selectedTicker === h.ticker ? "bg-white/[0.04]" : ""
              }`}
              onMouseEnter={() => setSelectedTicker(h.ticker)}
              onClick={() => setSelectedTicker(h.ticker)}
            >
              <div>
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{h.ticker}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{h.name} · {h.qty} shares · Avg {"\u20B9"}{h.avgPrice.toFixed(2)}</p>
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
            </Link>
          ))}
        </div>
      </div>

      {/* Right panel (desktop) — Buy/Sell */}
      <aside className="hidden lg:flex flex-col w-80 border-l border-white/8 shrink-0">
        <AnimatePresence mode="wait">
          {selectedHolding ? (
            <motion.div
              key={selectedHolding.ticker}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Stock info */}
              <div className="p-6 border-b border-white/8">
                <p className="font-[var(--font-anton)] text-xl tracking-[0.05em] mb-1">{selectedHolding.ticker}</p>
                <p className="text-[11px] text-white/40 mb-4">{selectedHolding.name}</p>
                <p className="font-[var(--font-anton)] text-3xl tracking-tight mb-1">
                  {"\u20B9"}{selectedHolding.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[11px] font-medium ${selectedHolding.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {selectedHolding.dayChangePercent >= 0 ? "+" : ""}{selectedHolding.dayChangePercent.toFixed(2)}%
                </p>
              </div>

              {/* BUY / SELL tabs */}
              <div className="flex border-b border-white/8">
                <button
                  onClick={() => setBuySellTab("BUY")}
                  className={`flex-1 py-3 text-[10px] tracking-[0.15em] font-semibold transition-all ${
                    buySellTab === "BUY" ? "bg-[#00D26A]/10 text-[#00D26A] border-b-2 border-[#00D26A]" : "text-white/40 hover:text-white"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setBuySellTab("SELL")}
                  className={`flex-1 py-3 text-[10px] tracking-[0.15em] font-semibold transition-all ${
                    buySellTab === "SELL" ? "bg-[#FF5252]/10 text-[#FF5252] border-b-2 border-[#FF5252]" : "text-white/40 hover:text-white"
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Order type tabs — now clickable */}
              <div className="flex gap-0 px-6 pt-4">
                {(["DELIVERY", "INTRADAY"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className={`px-3 py-1.5 text-[8px] tracking-[0.15em] border border-white/10 transition-all ${
                      orderType === t ? "bg-white/5 text-white/60" : "text-white/30 hover:text-white/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="px-6 pt-5 flex-1">
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

                <div className="flex justify-between items-center mt-4 py-3 border-t border-b border-white/8">
                  <span className="text-[10px] tracking-[0.1em] text-white/40">EST. TOTAL</span>
                  <span className="font-[var(--font-anton)] text-xl">
                    {"\u20B9"}{(selectedHolding.currentPrice * qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.1em] text-white/40">BALANCE</span>
                  <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}{balance.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleOrder}
                  className={`w-full h-11 mt-5 text-[10px] tracking-[0.15em] font-semibold border transition-all duration-150 ${
                    buySellTab === "BUY"
                      ? "bg-[#00D26A] text-black border-[#00D26A] hover:bg-transparent hover:text-[#00D26A]"
                      : "bg-[#FF5252] text-white border-[#FF5252] hover:bg-transparent hover:text-[#FF5252]"
                  }`}
                >
                  {buySellTab} {selectedHolding.ticker}
                </button>
              </div>

              {/* Holding stats */}
              <div className="p-6 border-t border-white/8">
                <p className="text-[9px] tracking-[0.15em] text-white/25 mb-3">YOUR HOLDING</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40">QTY</span>
                    <span className="text-[12px] font-[var(--font-anton)]">{selectedHolding.qty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40">AVG PRICE</span>
                    <span className="text-[12px] font-[var(--font-anton)]">{"\u20B9"}{selectedHolding.avgPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40">P&L</span>
                    <span className={`text-[12px] font-[var(--font-anton)] ${selectedHolding.returns >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                      {selectedHolding.returns >= 0 ? "+" : ""}{"\u20B9"}{selectedHolding.returns.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40">BUY ORDERS</span>
                    <span className="text-[12px] font-[var(--font-anton)] text-[#00D26A]">{getBuyCount(selectedHolding.ticker)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] text-white/40">SELL ORDERS</span>
                    <span className="text-[12px] font-[var(--font-anton)] text-[#FF5252]">{getSellCount(selectedHolding.ticker)}</span>
                  </div>
                </div>
              </div>

              {/* Recent orders for this stock */}
              {selectedOrders.length > 0 && (
                <div className="p-6 border-t border-white/8">
                  <p className="text-[9px] tracking-[0.15em] text-white/25 mb-3">ORDERS ({selectedOrders.length})</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {selectedOrders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] tracking-[0.1em] font-semibold px-1.5 py-0.5 border ${
                            order.type === "BUY"
                              ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                              : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                          }`}>
                            {order.type}
                          </span>
                          <span className="text-[10px] text-white/40">{order.qty} @ {"\u20B9"}{order.price.toFixed(2)}</span>
                        </div>
                        <span className="text-[10px] font-[var(--font-anton)]">{"\u20B9"}{order.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <p className="text-[11px] tracking-[0.15em] text-white/20 text-center uppercase">
                SELECT A STOCK<br />TO BUY OR SELL
              </p>
            </div>
          )}
        </AnimatePresence>
      </aside>

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
