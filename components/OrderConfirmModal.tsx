"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface OrderConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: "BUY" | "SELL";
  ticker: string;
  qty: number;
  price: number;
  pricingType: "MARKET" | "LIMIT";
  total: number;
}

export default function OrderConfirmModal({
  open, onConfirm, onCancel, type, ticker, qty, price, pricingType, total,
}: OrderConfirmModalProps) {
  const isBuy = type === "BUY";
  const color = isBuy ? "#00D26A" : "#FF5252";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 z-[80] bg-black/60"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "tween", duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[80] w-[min(400px,90vw)] bg-bg border border-white/15"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div className="flex items-center gap-2.5">
                <span
                  className="text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border"
                  style={{ color, borderColor: `${color}40`, backgroundColor: `${color}15` }}
                >
                  {type}
                </span>
                <span className="text-[11px] tracking-[0.1em] text-white/60">CONFIRM ORDER</span>
              </div>
              <button onClick={onCancel} className="w-7 h-7 flex items-center justify-center border border-white/15 hover:border-white/40 transition-colors">
                <X size={12} className="text-white/50" />
              </button>
            </div>

            {/* Order details */}
            <div className="px-5 py-5 space-y-3">
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-white/40">STOCK</span>
                <span className="font-[var(--font-anton)] text-sm">{ticker}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-white/40">TYPE</span>
                <span className="text-[10px] tracking-[0.1em] text-white/60">{pricingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-white/40">QUANTITY</span>
                <span className="font-[var(--font-anton)] text-sm">{qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[10px] tracking-[0.1em] text-white/40">PRICE</span>
                <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}{price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-white/8">
                <span className="text-[10px] tracking-[0.1em] text-white/40">ESTIMATED TOTAL</span>
                <span className="font-[var(--font-anton)] text-lg">{"\u20B9"}{total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-0 border-t border-white/8">
              <button
                onClick={onCancel}
                className="flex-1 py-3.5 text-[10px] tracking-[0.15em] text-white/50 hover:text-white hover:bg-white/[0.03] transition-all border-r border-white/8"
              >
                CANCEL
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 text-[10px] tracking-[0.15em] font-semibold transition-all"
                style={{ color, backgroundColor: `${color}15` }}
              >
                CONFIRM {type}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
