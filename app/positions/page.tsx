"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";
import { topGainers, topLosers, type MoverStock } from "@/lib/mockData";

type PageTab = "POSITIONS" | "ORDERS";
type ListTab = "GAINERS" | "LOSERS";
type SortKey = "ticker" | "price" | "dayChangePercent";
type SortDir = "asc" | "desc";

export default function PositionsPage() {
  const { isLoggedIn } = useAuth();
  const { orders } = useTrading();
  const [pageTab, setPageTab] = useState<PageTab>("POSITIONS");
  const [listTab, setListTab] = useState<ListTab>("GAINERS");
  const [sortKey, setSortKey] = useState<SortKey>("dayChangePercent");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const data: Record<ListTab, MoverStock[]> = { GAINERS: topGainers, LOSERS: topLosers };

  const sorted = useMemo(() => {
    const arr = [...data[listTab]];
    arr.sort((a, b) => {
      let av: string | number, bv: string | number;
      if (sortKey === "ticker") { av = a.ticker; bv = b.ticker; }
      else { av = a[sortKey]; bv = b[sortKey]; }
      if (typeof av === "string") return sortDir === "asc" ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return arr;
  }, [listTab, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  const SortIcon = ({ col }: { col: SortKey }) => (
    sortKey === col
      ? sortDir === "asc" ? <ChevronUp size={10} className="inline ml-0.5" /> : <ChevronDown size={10} className="inline ml-0.5" />
      : <ChevronDown size={10} className="inline ml-0.5 opacity-30" />
  );

  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 md:py-6">
      {/* Page tabs: POSITIONS | ORDERS */}
      <div className="flex items-center gap-0 mb-6">
        {(["POSITIONS", "ORDERS"] as PageTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setPageTab(tab)}
            className={`px-5 py-2.5 text-[11px] tracking-[0.15em] border transition-all duration-150 ${
              pageTab === tab
                ? "bg-white text-black border-white"
                : "bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white"
            }`}
          >
            {tab}
            {tab === "ORDERS" && orders.length > 0 && (
              <span className="ml-2 text-[9px]">({orders.length})</span>
            )}
          </button>
        ))}
      </div>

      {pageTab === "ORDERS" ? (
        /* Orders content */
        isLoggedIn ? (
          orders.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="font-[var(--font-anton)] text-base tracking-[0.1em] uppercase mb-5">
                ORDER HISTORY ({orders.length})
              </h2>

              {/* Mobile: card list */}
              <div className="md:hidden space-y-2">
                {orders.map((order, i) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.3 }}
                  >
                    <Link
                      href={`/stock/${order.ticker}`}
                      className="block border border-white/8 p-4 hover:bg-white/[0.03] active:bg-white/[0.06] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border ${
                            order.type === "BUY"
                              ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                              : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                          }`}>
                            {order.type}
                          </span>
                          <span className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{order.ticker}</span>
                        </div>
                        <span className="text-[9px] tracking-[0.1em] text-[#00D26A]">{order.status}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-white/50">{order.qty} shares @ {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                          <p className="text-[9px] text-white/25 mt-0.5">{order.orderType} {"\u00B7"} {new Date(order.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <p className="font-[var(--font-anton)] text-[15px]">{"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block">
                <div className="grid grid-cols-[60px_1fr_100px_80px_120px_90px] gap-4 px-4 py-2 border-b border-white/12">
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">TYPE</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase">STOCK</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">QTY</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">PRICE</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TOTAL</span>
                  <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">STATUS</span>
                </div>
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/stock/${order.ticker}`}
                    className="grid grid-cols-[60px_1fr_100px_80px_120px_90px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
                  >
                    <span className={`text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border w-fit ${
                      order.type === "BUY"
                        ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                        : "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                    }`}>
                      {order.type}
                    </span>
                    <div>
                      <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{order.ticker}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{order.name} {"\u00B7"} {order.orderType}</p>
                    </div>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">{order.qty}</p>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{order.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-right font-[var(--font-anton)] text-[13px]">
                      {"\u20B9"}{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                    <div className="text-right">
                      <span className="text-[9px] tracking-[0.1em] text-[#00D26A]">{order.status}</span>
                      <p className="text-[9px] text-white/20 mt-0.5">{new Date(order.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Orders empty state */
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 md:py-24"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-18 h-18 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-6 relative"
              >
                <div className="w-8 md:w-10 h-[1px] bg-white" />
                <div className="absolute w-[1px] h-8 md:h-10 bg-white" />
                <div className="absolute w-3 md:w-4 h-3 md:h-4 border border-white bottom-1.5 md:bottom-2 left-1.5 md:left-2" />
              </motion.div>
              <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-3">
                NO OPEN ORDERS
              </h1>
              <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
                You have no pending or open orders. Place a buy or sell order to see it here.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
                >
                  EXPLORE STOCKS
                </Link>
                <Link
                  href="/holdings"
                  className="px-6 py-3 text-[10px] tracking-[0.15em] text-white/50 hover:text-white border border-white/20 hover:border-white transition-all duration-150"
                >
                  VIEW HOLDINGS
                </Link>
              </div>
            </motion.div>
          )
        ) : (
          <LoginPrompt message="Log in to view your order history and pending orders." />
        )
      ) : (
        /* Positions content */
        <>
      {/* Empty state - positions */}
      {isLoggedIn ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 md:py-24"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-18 h-18 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-6 relative"
          >
            <div className="w-8 h-8 border border-white rotate-45" />
            <div className="absolute w-3 h-3 bg-white top-2 right-2" />
          </motion.div>
          <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-3">
            NO OPEN POSITIONS
          </h1>
          <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
            You have no intraday or F&O positions currently open. Explore stocks below to start trading.
          </p>
          <Link
            href="/"
            className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
          >
            EXPLORE STOCKS
          </Link>
        </motion.div>
      ) : (
        <LoginPrompt message="Log in to view your open positions and intraday trades." />
      )}

      {/* Suggestions: TOP GAINERS / TOP LOSERS */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-6"
      >
        <div className="flex items-center gap-0 mb-5 overflow-x-auto scrollbar-hide">
          {(["GAINERS", "LOSERS"] as ListTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setListTab(tab)}
              className={`px-4 py-2.5 text-[10px] tracking-[0.15em] border transition-all duration-150 whitespace-nowrap ${
                listTab === tab
                  ? "bg-white text-black border-white"
                  : "bg-transparent text-white/40 border-white/15 hover:text-white hover:border-white"
              }`}
            >
              TOP {tab} TODAY
            </button>
          ))}
        </div>

        {/* Mobile: sort + card list */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] tracking-[0.15em] text-white/30 uppercase">SORT BY</span>
            <select
              value={sortKey}
              onChange={(e) => { setSortKey(e.target.value as SortKey); setSortDir("desc"); }}
              className="bg-transparent border border-white/15 text-[10px] tracking-[0.1em] text-white/60 px-3 py-1.5 outline-none appearance-none cursor-pointer"
              style={{ fontSize: '16px' }}
            >
              <option value="ticker" className="bg-[#0a0a0a]">NAME</option>
              <option value="price" className="bg-[#0a0a0a]">PRICE</option>
              <option value="dayChangePercent" className="bg-[#0a0a0a]">CHANGE %</option>
            </select>
          </div>
          <div className="space-y-2">
          {sorted.map((stock, i) => (
            <motion.div
              key={stock.ticker}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i, duration: 0.3 }}
            >
              <Link
                href={`/stock/${stock.ticker}`}
                className="flex items-center gap-4 bg-white/[0.02] border border-white/6 p-4 hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors"
              >
                <div className="w-11 h-11 border border-white/20 flex items-center justify-center shrink-0">
                  <span className="text-[9px] tracking-[0.1em] text-white/40">{stock.ticker.slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                  <p className="text-[11px] text-white/40 truncate mt-0.5">{stock.name}</p>
                </div>
                <Sparkline data={stock.sparkline} width={52} height={22} positive={stock.dayChangePercent >= 0} />
                <div className="text-right shrink-0 min-w-[80px]">
                  <p className="font-[var(--font-anton)] text-[13px]">
                    {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                  <p className={`text-[11px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
          </div>
        </div>

        {/* Desktop: table with sortable headers */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-2 border-b border-white/12">
            <button onClick={() => toggleSort("ticker")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-left hover:text-white transition-colors">
              COMPANY <SortIcon col="ticker" />
            </button>
            <span className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right">TREND</span>
            <button onClick={() => toggleSort("price")} className="text-[9px] tracking-[0.2em] text-[#666] uppercase text-right hover:text-white transition-colors">
              MKT PRICE <SortIcon col="price" />
            </button>
          </div>

          {sorted.map((stock) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="grid grid-cols-[1fr_80px_120px] gap-4 px-4 py-3 border-b border-white/6 hover:bg-white/[0.04] transition-colors duration-150 items-center"
            >
              <div>
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{stock.ticker}</p>
                <p className="text-[10px] text-white/40 mt-0.5">{stock.name}</p>
              </div>
              <div className="flex justify-end">
                <Sparkline data={stock.sparkline} width={60} height={20} positive={stock.dayChangePercent >= 0} />
              </div>
              <div className="text-right">
                <p className="font-[var(--font-anton)] text-[13px]">
                  {"\u20B9"}{stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </p>
                <p className={`text-[10px] font-medium ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                  {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
        </>
      )}
    </div>
  );
}
