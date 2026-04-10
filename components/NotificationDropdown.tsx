"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, TrendingDown, Bell, Info } from "lucide-react";

const notifications = [
  { type: "gain", ticker: "CELESTE", text: "CELESTE is up +1.79% today", time: "2m ago" },
  { type: "loss", ticker: "ERUDITE", text: "ERUDITE dropped -0.78%", time: "5m ago" },
  { type: "info", ticker: "MATHSOC", text: "MATHSOC crossed \u20B92,890 resistance", time: "8m ago" },
  { type: "gain", ticker: "GASMONKEYS", text: "GASMONKEYS volume spike detected", time: "12m ago" },
  { type: "info", ticker: "", text: "Market hours: 9:15 AM \u2013 3:30 PM", time: "1h ago" },
];

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const iconFor = (type: string) => {
    if (type === "gain") return <TrendingUp size={12} className="text-[#00D26A]" />;
    if (type === "loss") return <TrendingDown size={12} className="text-[#FF5252]" />;
    return <Info size={12} className="text-white/40" />;
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-80 bg-[#0a0a0a] border border-white/15 z-50 max-h-96 flex flex-col"
    >
      <div className="px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">NOTIFICATIONS</span>
          <span className="text-[9px] tracking-[0.1em] text-white/20">{notifications.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
      {notifications.map((n, i) => {
        const inner = (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.04 * i, duration: 0.2 }}
            className="flex items-start gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors border-b border-white/5 last:border-0"
          >
            <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white/60 leading-relaxed">{n.text}</p>
              <p className="text-[9px] text-white/20 mt-1">{n.time}</p>
            </div>
          </motion.div>
        );

        return n.ticker ? (
          <Link key={i} href={`/stock/${n.ticker}`} onClick={onClose}>
            {inner}
          </Link>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
      </div>

      <div className="px-5 py-3 border-t border-white/10 shrink-0">
        <button
          onClick={onClose}
          className="text-[9px] tracking-[0.15em] text-white/30 hover:text-white transition-colors"
        >
          MARK ALL AS READ
        </button>
      </div>
    </motion.div>
  );
}
