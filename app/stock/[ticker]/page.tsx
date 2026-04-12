"use client";

import { useState, use, useCallback, useMemo } from "react";
import { ArrowLeft, Star, Bookmark, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { stockDirectory, holdings, newsItems, formatRelativeTime, generateOrderBook } from "@/lib/mockData";
import { useTrading } from "@/lib/TradingContext";
import { usePreferences } from "@/lib/PreferencesContext";
import OrderConfirmModal from "@/components/OrderConfirmModal";
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
  const { placeOrder, getOrdersForTicker, positions, balance, isWatched: checkWatched, toggleWatchlist } = useTrading();
  const [range, setRange] = useState<string>("1D");
  const [qty, setQty] = useState(1);
  const [buySellTab, setBuySellTab] = useState<"BUY" | "SELL">("BUY");
  const [orderType, setOrderType] = useState<"DELIVERY" | "INTRADAY">("DELIVERY");
  const [pricingType, setPricingType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [limitPrice, setLimitPrice] = useState<string>("");
  const [orderMsg, setOrderMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"ORDER" | "BOOK" | "HISTORY">("ORDER");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { confirmOrders } = usePreferences();

  const isHeld = holdings.some((h) => h.ticker === ticker.toUpperCase());
  const watched = checkWatched(ticker.toUpperCase());
  const holdingData = holdings.find((h) => h.ticker === ticker.toUpperCase());
  const tickerOrders = getOrdersForTicker(ticker.toUpperCase());
  const position = positions.find((p) => p.ticker === ticker.toUpperCase());
  const stockNews = newsItems.filter((n) => n.ticker === ticker.toUpperCase());
  const orderBook = useMemo(() => stock ? generateOrderBook(stock.price) : null, [stock]);

  const effectivePrice = pricingType === "LIMIT" && limitPrice ? parseFloat(limitPrice) : (stock?.price ?? 0);

  const executeOrder = useCallback(() => {
    if (!stock) return;
    const result = placeOrder({
      ticker: stock.ticker,
      name: stock.name,
      type: buySellTab,
      orderType,
      pricingType,
      qty,
      price: stock.price,
      ...(pricingType === "LIMIT" && limitPrice ? { limitPrice: parseFloat(limitPrice) } : {}),
    });
    setOrderMsg({ text: result.message, success: result.success });
    if (result.success) { setQty(1); setLimitPrice(""); }
    setTimeout(() => setOrderMsg(null), 3000);
  }, [stock, placeOrder, buySellTab, orderType, pricingType, limitPrice, qty]);

  const handleOrder = useCallback(() => {
    if (confirmOrders) {
      setConfirmOpen(true);
    } else {
      executeOrder();
    }
  }, [confirmOrders, executeOrder]);

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
    <div className="pb-32 md:pb-0">
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

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between py-4 border-b border-white/8"
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
            <span className="flex items-center gap-1.5 text-[8px] tracking-[0.15em] text-[#00D26A] border border-[#00D26A]/30 bg-[#00D26A]/10 px-2.5 py-1 cursor-default" title="You hold this stock">
              <Bookmark size={10} fill="currentColor" /> HELD
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleWatchlist(ticker.toUpperCase())}
            className={`flex items-center gap-1.5 text-[8px] tracking-[0.15em] px-2.5 py-1 border transition-all duration-200 ${
              watched
                ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10"
                : "text-white/40 border-white/15 hover:text-white hover:border-white/30"
            }`}
            title={watched ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Star size={10} fill={watched ? "currentColor" : "none"} />
            {watched ? "WATCHED" : "WATCH"}
          </motion.button>
        </div>
      </motion.div>

      {/* Desktop: 2-column grid (70% / 30%) */}
      <div className="md:grid md:grid-cols-[7fr_3fr] md:gap-0 py-6">
        {/* Main content - Col 1: Chart + Price */}
        <div className="min-w-0 md:pr-6">
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
            <div className="flex items-center gap-3">
              <p className={`text-[12px] font-medium ${stock.changePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}% {"\u00B7"} {range}
              </p>
              {position && (
                <span className="text-[10px] text-white/40 border border-white/10 px-2 py-0.5">
                  {position.qty} shares held
                </span>
              )}
            </div>
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

          {/* Your holding info (if held) — uses position data for consistency */}
          {position && (
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
                  <p className="font-[var(--font-anton)] text-base">{position.qty}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">AVG PRICE</p>
                  <p className="font-[var(--font-anton)] text-base">{"\u20B9"}{position.avgPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">INVESTED</p>
                  <p className="font-[var(--font-anton)] text-base">{"\u20B9"}{(position.avgPrice * position.qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1.5">RETURNS</p>
                  <p className={`font-[var(--font-anton)] text-base ${position.pnlPercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {position.pnlPercent >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%
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
                <div key={item.label} className="bg-bg p-4 md:p-5">
                  <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-1.5">{item.label}</p>
                  <p className="font-[var(--font-anton)] text-lg md:text-xl">
                    {"\u20B9"}{item.value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* About the Company */}
          {stock.about && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.3 }}
              className="mt-7 md:mt-8"
            >
              <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">ABOUT {stock.ticker}</h3>
              <div className="border border-white/8 p-5">
                <p className="text-[12px] md:text-[13px] text-white/50 leading-relaxed">{stock.about}</p>
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/6">
                  <span className="text-[9px] tracking-[0.15em] text-white/25">SECTOR</span>
                  <span className="text-[10px] text-white/50">{stock.fundamentals.sector}</span>
                </div>
              </div>
            </motion.div>
          )}

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
                { label: "BOOK VALUE", value: `\u20B9${stock.fundamentals.bookValue.toLocaleString("en-IN")}` },
                { label: "ROE", value: `${stock.fundamentals.roe.toFixed(1)}%` },
                { label: "VOLUME", value: stock.fundamentals.volume },
                { label: "AVG VOLUME", value: stock.fundamentals.avgVolume },
              ].map((item) => (
                <div key={item.label} className="bg-bg p-4">
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

        {/* Right column (desktop): Sticky order panel + order book + news + orders */}
        <aside className="hidden md:block border-l border-white/8 pl-6">
          <div className="sticky top-20 space-y-6">
            <div>
            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-3">PLACE ORDER</p>

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

            {/* Order type */}
            <div className="pt-4">
              <div className="flex gap-0 mb-1.5">
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
              <p className="text-[8px] tracking-[0.05em] text-white/20">
                {orderType === "DELIVERY" ? "Shares held in your portfolio long-term" : "Buy & sell within the same trading day"}
              </p>
            </div>

            {/* Price */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] tracking-[0.1em] text-white/40">PRICE</label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={pricingType === "MARKET"}
                    onChange={(e) => {
                      if (e.target.checked) { setPricingType("MARKET"); setLimitPrice(""); }
                      else { setPricingType("LIMIT"); setLimitPrice(stock.price.toFixed(2)); }
                    }}
                    className="w-3 h-3 accent-white"
                  />
                  <span className="text-[9px] tracking-[0.15em] text-white/50">MARKET</span>
                </label>
              </div>
              <input
                type="number"
                value={pricingType === "MARKET" ? stock.price.toFixed(2) : limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                disabled={pricingType === "MARKET"}
                placeholder={stock.price.toFixed(2)}
                className={`w-full h-10 bg-transparent border px-4 text-center font-[var(--font-anton)] text-lg text-white outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                  pricingType === "MARKET" ? "text-white/40 border-white/10 cursor-not-allowed" : "border-white/20 focus:border-white"
                }`}
              />
            </div>

            {/* Quantity */}
            <div className="pt-5">
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
                  {"\u20B9"}{(effectivePrice * qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-[10px] tracking-[0.1em] text-white/40">BALANCE</span>
                <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}{Math.round(balance).toLocaleString("en-IN")}</span>
              </div>

              <motion.button
                onClick={handleOrder}
                whileTap={{ scale: 0.97 }}
                className={`w-full h-11 mt-5 text-[10px] tracking-[0.15em] font-semibold border transition-all duration-150 ${
                  buySellTab === "BUY"
                    ? "bg-[#00D26A] text-black border-[#00D26A] hover:bg-transparent hover:text-[#00D26A]"
                    : "bg-[#FF5252] text-white border-[#FF5252] hover:bg-transparent hover:text-[#FF5252]"
                }`}
              >
                {pricingType === "LIMIT" ? `${buySellTab} LIMIT` : buySellTab} {stock.ticker}
              </motion.button>
            </div>
            </div>

            {/* Order Book */}
            {orderBook && (
              <div className="border border-white/10">
                <div className="px-4 py-3 border-b border-white/8">
                  <p className="text-[9px] tracking-[0.15em] text-white/30">ORDER BOOK</p>
                </div>
                <div className="grid grid-cols-3 gap-0 px-4 py-2 border-b border-white/6">
                  <span className="text-[8px] tracking-[0.1em] text-white/20">BID</span>
                  <span className="text-[8px] tracking-[0.1em] text-white/20 text-center">QTY</span>
                  <span className="text-[8px] tracking-[0.1em] text-white/20 text-right">ORDERS</span>
                </div>
                {orderBook.bids.map((b, i) => (
                  <div key={`bid-${i}`} className="grid grid-cols-3 gap-0 px-4 py-1.5 border-b border-white/4">
                    <span className="text-[10px] text-[#00D26A] font-[var(--font-anton)]">{"\u20B9"}{b.price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-white/50 text-center">{b.qty}</span>
                    <span className="text-[10px] text-white/30 text-right">{b.orders}</span>
                  </div>
                ))}
                <div className="px-4 py-2 bg-white/[0.03] border-y border-white/8">
                  <p className="text-[10px] text-white/40 text-center font-[var(--font-anton)]">
                    {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} LTP
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-0 px-4 py-2 border-b border-white/6">
                  <span className="text-[8px] tracking-[0.1em] text-white/20">ASK</span>
                  <span className="text-[8px] tracking-[0.1em] text-white/20 text-center">QTY</span>
                  <span className="text-[8px] tracking-[0.1em] text-white/20 text-right">ORDERS</span>
                </div>
                {orderBook.asks.map((a, i) => (
                  <div key={`ask-${i}`} className="grid grid-cols-3 gap-0 px-4 py-1.5 border-b border-white/4">
                    <span className="text-[10px] text-[#FF5252] font-[var(--font-anton)]">{"\u20B9"}{a.price.toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-white/50 text-center">{a.qty}</span>
                    <span className="text-[10px] text-white/30 text-right">{a.orders}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stock News */}
            {stockNews.length > 0 && (
              <div>
                <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-3">NEWS</h3>
                <div className="space-y-2">
                  {stockNews.map((news, i) => (
                    <div key={i} className="border border-white/8 p-4 hover:bg-white/[0.02] transition-colors">
                      <p className="text-[11px] text-white/60 leading-relaxed mb-2">{news.headline}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] tracking-[0.1em] text-white/25">{formatRelativeTime(news.timestamp)}</span>
                        <span className={`text-[10px] font-medium ${news.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                          {news.dayChangePercent >= 0 ? "+" : ""}{news.dayChangePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Events */}
            {stock.events && stock.events.length > 0 && (
              <div>
                <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-3">UPCOMING EVENTS</h3>
                <div className="space-y-2">
                  {stock.events.map((event, i) => {
                    const typeColors: Record<string, string> = {
                      RESULTS: "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5",
                      AGM: "text-blue-400 border-blue-400/30 bg-blue-400/5",
                      DIVIDEND: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
                      EVENT: "text-white/50 border-white/20 bg-white/5",
                    };
                    return (
                      <div key={i} className="border border-white/8 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[7px] tracking-[0.15em] font-semibold px-1.5 py-0.5 border ${typeColors[event.type] || typeColors.EVENT}`}>
                            {event.type}
                          </span>
                          <p className="text-[11px] text-white/60">{event.title}</p>
                        </div>
                        <span className="text-[9px] tracking-[0.1em] text-white/25 whitespace-nowrap ml-3">
                          {new Date(event.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Order History */}
            {tickerOrders.length > 0 && (
              <div>
                <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-3">
                  YOUR ORDERS ({tickerOrders.length})
                </h3>
                <div className="space-y-2">
                  {tickerOrders.map((order) => (
                    <div key={order.id} className="border border-white/8 p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] tracking-[0.15em] font-semibold px-1.5 py-0.5 border ${
                          order.type === "BUY"
                            ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                            : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                        }`}>
                          {order.type}
                        </span>
                        <div>
                          <p className="text-[10px] text-white/50">{order.qty} @ {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          <p className="text-[8px] text-white/25 mt-0.5">
                            {order.status !== "COMPLETED" && <span className="text-yellow-400 mr-1">{order.status}</span>}
                            {order.orderType} {"\u00B7"} {new Date(order.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </p>
                        </div>
                      </div>
                      <p className="font-[var(--font-anton)] text-[12px]">{"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>{/* end sticky */}
        </aside>
      </div>

      {/* Mobile fixed bottom buy/sell bar */}
      <div className="fixed bottom-14 left-0 right-0 z-40 md:hidden border-t border-white/12 bg-bg/95 backdrop-blur-md" style={{ bottom: 'calc(3.5rem + env(safe-area-inset-bottom))' }}>
        <div className="flex">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setBuySellTab("BUY"); setMobileOrderOpen(true); }}
            className="flex-1 py-4 text-[11px] tracking-[0.15em] font-semibold bg-[#00D26A] text-black active:bg-[#00D26A]/80 transition-all"
          >
            BUY
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { setBuySellTab("SELL"); setMobileOrderOpen(true); }}
            className="flex-1 py-4 text-[11px] tracking-[0.15em] font-semibold bg-[#FF5252] text-white active:bg-[#FF5252]/80 transition-all"
          >
            SELL
          </motion.button>
        </div>
      </div>

      {/* Mobile order panel overlay */}
      <AnimatePresence>
        {mobileOrderOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOrderOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 md:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg border-t border-white/12 max-h-[85vh] overflow-hidden flex flex-col"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 shrink-0">
                <div className="flex items-center gap-3">
                  <span className="font-[var(--font-anton)] text-base tracking-[0.05em]">{stock.ticker}</span>
                  <span className="text-[10px] text-white/40">{"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <button onClick={() => setMobileOrderOpen(false)} className="w-8 h-8 flex items-center justify-center border border-white/15 hover:border-white/40 transition-colors">
                  <X size={14} className="text-white/50" />
                </button>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-white/8 shrink-0">
                {(["ORDER", "BOOK", "HISTORY"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setMobileTab(tab)}
                    className={`flex-1 py-2.5 text-[9px] tracking-[0.15em] font-semibold transition-all relative ${
                      mobileTab === tab ? "text-white" : "text-white/30"
                    }`}
                  >
                    {tab === "BOOK" ? "ORDER BOOK" : tab}
                    {mobileTab === tab && (
                      <motion.span layoutId="mobile-tab-underline" className="absolute bottom-0 left-0 right-0 h-[1px] bg-white" />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="overflow-y-auto flex-1">
                {mobileTab === "ORDER" && (
                  <div className="px-5 py-5 space-y-5">
                    {/* Buy/Sell toggle */}
                    <div className="flex border border-white/8">
                      <button
                        onClick={() => setBuySellTab("BUY")}
                        className={`flex-1 py-2.5 text-[10px] tracking-[0.15em] font-semibold transition-all ${
                          buySellTab === "BUY" ? "bg-[#00D26A]/10 text-[#00D26A] border-b-2 border-[#00D26A]" : "text-white/40"
                        }`}
                      >BUY</button>
                      <button
                        onClick={() => setBuySellTab("SELL")}
                        className={`flex-1 py-2.5 text-[10px] tracking-[0.15em] font-semibold transition-all ${
                          buySellTab === "SELL" ? "bg-[#FF5252]/10 text-[#FF5252] border-b-2 border-[#FF5252]" : "text-white/40"
                        }`}
                      >SELL</button>
                    </div>

                    {/* Order type */}
                    <div className="flex gap-0">
                      {(["DELIVERY", "INTRADAY"] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setOrderType(t)}
                          className={`px-3 py-1.5 text-[8px] tracking-[0.15em] border border-white/10 transition-all ${
                            orderType === t ? "bg-white/5 text-white/60" : "text-white/30"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    {/* Price input + market checkbox */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] tracking-[0.1em] text-white/40">PRICE</label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={pricingType === "MARKET"}
                            onChange={(e) => {
                              if (e.target.checked) { setPricingType("MARKET"); setLimitPrice(""); }
                              else { setPricingType("LIMIT"); setLimitPrice(stock.price.toFixed(2)); }
                            }}
                            className="w-3 h-3 accent-white"
                          />
                          <span className="text-[9px] tracking-[0.15em] text-white/50">MARKET</span>
                        </label>
                      </div>
                      <input
                        type="number"
                        value={pricingType === "MARKET" ? stock.price.toFixed(2) : limitPrice}
                        onChange={(e) => setLimitPrice(e.target.value)}
                        disabled={pricingType === "MARKET"}
                        placeholder={stock.price.toFixed(2)}
                        className={`w-full h-10 bg-transparent border px-4 text-center font-[var(--font-anton)] text-lg text-white outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                          pricingType === "MARKET" ? "text-white/40 border-white/10 cursor-not-allowed" : "border-white/20 focus:border-white"
                        }`}
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-[10px] tracking-[0.1em] text-white/40 mb-2 block">QTY</label>
                      <div className="flex items-center border border-white/20">
                        <button
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="w-12 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >{"\u2212"}</button>
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="flex-1 h-10 bg-transparent text-center font-[var(--font-anton)] text-lg text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setQty(qty + 1)}
                          className="w-12 h-10 flex items-center justify-center text-white/40 hover:text-white transition-colors"
                        >{"+"}</button>
                      </div>
                    </div>

                    {/* Total + Balance */}
                    <div className="border-t border-b border-white/8 py-3 flex justify-between items-center">
                      <span className="text-[10px] tracking-[0.1em] text-white/40">EST. TOTAL</span>
                      <span className="font-[var(--font-anton)] text-xl">
                        {"\u20B9"}{(effectivePrice * qty).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] tracking-[0.1em] text-white/40">BALANCE</span>
                      <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}{Math.round(balance).toLocaleString("en-IN")}</span>
                    </div>

                  </div>
                )}

                {mobileTab === "BOOK" && orderBook && (
                  <div className="px-4 py-4">
                    <div className="grid grid-cols-3 gap-0 px-2 py-2 border-b border-white/6">
                      <span className="text-[8px] tracking-[0.1em] text-white/20">BID</span>
                      <span className="text-[8px] tracking-[0.1em] text-white/20 text-center">QTY</span>
                      <span className="text-[8px] tracking-[0.1em] text-white/20 text-right">ORDERS</span>
                    </div>
                    {orderBook.bids.map((b, i) => (
                      <div key={`m-bid-${i}`} className="grid grid-cols-3 gap-0 px-2 py-2 border-b border-white/4">
                        <span className="text-[11px] text-[#00D26A] font-[var(--font-anton)]">{"\u20B9"}{b.price.toLocaleString("en-IN")}</span>
                        <span className="text-[11px] text-white/50 text-center">{b.qty}</span>
                        <span className="text-[11px] text-white/30 text-right">{b.orders}</span>
                      </div>
                    ))}
                    <div className="px-2 py-2.5 bg-white/[0.03] border-y border-white/8 text-center">
                      <span className="text-[11px] text-white/40 font-[var(--font-anton)]">
                        {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })} LTP
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-0 px-2 py-2 border-b border-white/6">
                      <span className="text-[8px] tracking-[0.1em] text-white/20">ASK</span>
                      <span className="text-[8px] tracking-[0.1em] text-white/20 text-center">QTY</span>
                      <span className="text-[8px] tracking-[0.1em] text-white/20 text-right">ORDERS</span>
                    </div>
                    {orderBook.asks.map((a, i) => (
                      <div key={`m-ask-${i}`} className="grid grid-cols-3 gap-0 px-2 py-2 border-b border-white/4">
                        <span className="text-[11px] text-[#FF5252] font-[var(--font-anton)]">{"\u20B9"}{a.price.toLocaleString("en-IN")}</span>
                        <span className="text-[11px] text-white/50 text-center">{a.qty}</span>
                        <span className="text-[11px] text-white/30 text-right">{a.orders}</span>
                      </div>
                    ))}
                  </div>
                )}

                {mobileTab === "HISTORY" && (
                  <div className="px-4 py-4">
                    {tickerOrders.length > 0 ? (
                      <div className="space-y-2">
                        {tickerOrders.map((order) => (
                          <div key={order.id} className="border border-white/8 p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] tracking-[0.15em] font-semibold px-1.5 py-0.5 border ${
                                order.type === "BUY"
                                  ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                                  : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                              }`}>
                                {order.type}
                              </span>
                              <div>
                                <p className="text-[10px] text-white/50">{order.qty} @ {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                                <p className="text-[8px] text-white/25 mt-0.5">
                                  {order.status !== "COMPLETED" && <span className="text-yellow-400 mr-1">{order.status}</span>}
                                  {order.orderType} {"\u00B7"} {new Date(order.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                </p>
                              </div>
                            </div>
                            <p className="font-[var(--font-anton)] text-[12px]">{"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center">
                        <p className="text-[11px] tracking-[0.1em] text-white/20">NO ORDERS YET</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky confirm button at bottom of mobile order panel */}
              {mobileTab === "ORDER" && (
                <div className="shrink-0 px-5 py-4 border-t border-white/8 bg-bg">
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOrder}
                    className={`w-full h-12 text-[11px] tracking-[0.15em] font-semibold border transition-all duration-150 ${
                      buySellTab === "BUY"
                        ? "bg-[#00D26A] text-black border-[#00D26A] hover:bg-transparent hover:text-[#00D26A]"
                        : "bg-[#FF5252] text-white border-[#FF5252] hover:bg-transparent hover:text-[#FF5252]"
                    }`}
                  >
                    {pricingType === "LIMIT" ? `${buySellTab} LIMIT` : buySellTab} {stock.ticker}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order confirm modal */}
      <OrderConfirmModal
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); executeOrder(); setMobileOrderOpen(false); }}
        type={buySellTab}
        ticker={stock.ticker}
        qty={qty}
        price={effectivePrice}
        pricingType={pricingType}
        total={effectivePrice * qty}
      />
    </div>
  );
}
