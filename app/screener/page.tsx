"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ScanLine, ArrowLeft } from "lucide-react";
import Sparkline from "@/components/Sparkline";
import { topGainers, topLosers } from "@/lib/mockData";

export default function ScreenerPage() {
  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <ScanLine size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">INTRADAY SCREENER</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bullish picks */}
        <div>
          <p className="text-[9px] tracking-[0.2em] text-[#00D26A]/60 uppercase mb-4">BULLISH SIGNALS</p>
          <div className="space-y-2">
            {topGainers.slice(0, 3).map((s) => (
              <Link key={s.ticker} href={`/stock/${s.ticker}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-[var(--font-anton)] text-[12px]">{s.ticker}</p>
                    <p className="text-[10px] text-white/30">{s.name}</p>
                  </div>
                  <Sparkline data={s.sparkline} width={48} height={20} positive={true} />
                  <span className="text-[11px] text-[#00D26A] font-medium min-w-[50px] text-right">+{s.dayChangePercent.toFixed(2)}%</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bearish picks */}
        <div>
          <p className="text-[9px] tracking-[0.2em] text-[#FF5252]/60 uppercase mb-4">BEARISH SIGNALS</p>
          <div className="space-y-2">
            {topLosers.map((s) => (
              <Link key={s.ticker} href={`/stock/${s.ticker}`}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-[var(--font-anton)] text-[12px]">{s.ticker}</p>
                    <p className="text-[10px] text-white/30">{s.name}</p>
                  </div>
                  <Sparkline data={s.sparkline} width={48} height={20} positive={false} />
                  <span className="text-[11px] text-[#FF5252] font-medium min-w-[50px] text-right">{s.dayChangePercent.toFixed(2)}%</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
