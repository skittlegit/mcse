"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Layers, ArrowLeft } from "lucide-react";
import Sparkline from "@/components/Sparkline";

const etfs = [
  { name: "AEON 50 ETF", ticker: "AEON50ETF", price: 235.40, change: 1.2, sparkline: [230, 231, 232, 234, 235, 235, 235] },
  { name: "BANKAEON ETF", ticker: "BANKETF", price: 508.90, change: -0.3, sparkline: [512, 511, 510, 509, 509, 509, 508] },
  { name: "GOLD ETF", ticker: "GOLDETF", price: 62.15, change: 0.8, sparkline: [61, 61.2, 61.5, 61.8, 62, 62.1, 62.1] },
  { name: "IT SECTOR ETF", ticker: "ITETF", price: 44.80, change: 1.5, sparkline: [43, 43.5, 44, 44.2, 44.5, 44.7, 44.8] },
];

export default function ETFsPage() {
  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Layers size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">ETFs</h1>
        </div>
      </div>

      <div className="space-y-2">
        {etfs.map((etf) => (
          <motion.div
            key={etf.ticker}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
          >
            <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-[8px] tracking-[0.1em] text-white/40">{etf.ticker.slice(0, 3)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em]">{etf.name}</p>
              <p className="text-[10px] text-white/40">{etf.ticker}</p>
            </div>
            <Sparkline data={etf.sparkline} width={52} height={22} positive={etf.change >= 0} />
            <div className="text-right shrink-0 min-w-[80px]">
              <p className="font-[var(--font-anton)] text-[13px]">{"\u20B9"}{etf.price.toFixed(2)}</p>
              <p className={`text-[11px] font-medium ${etf.change >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                {etf.change >= 0 ? "+" : ""}{etf.change.toFixed(2)}%
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
