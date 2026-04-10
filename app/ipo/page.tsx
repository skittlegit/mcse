"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Target, ArrowLeft } from "lucide-react";

const ipoList = [
  { name: "AEON DYNAMICS", price: "\u20B9850 - \u20B9920", dates: "Jun 15 - Jun 18", status: "UPCOMING" },
  { name: "NEXGEN LABS", price: "\u20B9340 - \u20B9380", dates: "Jun 20 - Jun 23", status: "UPCOMING" },
  { name: "VORTEX ENERGY", price: "\u20B91,200 - \u20B91,350", dates: "Jun 10 - Jun 13", status: "LIVE" },
];

export default function IPOPage() {
  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Target size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">IPO</h1>
        </div>
      </div>

      <div className="space-y-3">
        {ipoList.map((ipo) => (
          <motion.div
            key={ipo.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-white/8 p-5 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="font-[var(--font-anton)] text-[14px] tracking-[0.05em]">{ipo.name}</p>
              <span className={`text-[9px] tracking-[0.15em] px-2 py-1 font-semibold ${
                ipo.status === "LIVE" ? "bg-[#00D26A]/15 text-[#00D26A]" : "bg-white/5 text-white/40"
              }`}>
                {ipo.status}
              </span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">PRICE BAND</p>
                <p className="text-[12px] text-white/60">{ipo.price}</p>
              </div>
              <div>
                <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">DATES</p>
                <p className="text-[12px] text-white/60">{ipo.dates}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
