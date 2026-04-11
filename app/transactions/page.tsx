"use client";

import { motion } from "framer-motion";
import { useTrading } from "@/lib/TradingContext";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";

export default function TransactionsPage() {
  const { isLoggedIn } = useAuth();
  const { transactions } = useTrading();

  if (!isLoggedIn) {
    return (
      <div className="py-6">
        <LoginPrompt message="Log in to view your transaction history." />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Header */}
      <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase mb-8">
        TRANSACTION HISTORY
      </h1>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-[11px] tracking-[0.1em] text-white/40">No transactions yet.</p>
        </div>
      ) : (
        <div className="space-y-0 border border-white/8">
          {transactions.map((txn, i) => (
            <motion.div
              key={txn.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.3 }}
              className={`flex items-center justify-between px-5 py-4 ${
                i < transactions.length - 1 ? "border-b border-white/6" : ""
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`text-[9px] tracking-[0.15em] font-semibold px-2 py-0.5 border shrink-0 ${
                  txn.type === "BUY" ? "text-[#00D26A] border-[#00D26A]/30 bg-[#00D26A]/5"
                  : txn.type === "SELL" ? "text-[#FF5252] border-[#FF5252]/30 bg-[#FF5252]/5"
                  : txn.type === "DEPOSIT" ? "text-white/60 border-white/15 bg-white/5"
                  : "text-white/40 border-white/10 bg-white/[0.02]"
                }`}>
                  {txn.type}
                </span>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/60 truncate">{txn.description}</p>
                  <p className="text-[9px] text-white/25 mt-0.5">
                    {new Date(txn.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    {" \u00B7 "}
                    {new Date(txn.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className={`font-[var(--font-anton)] text-[14px] ${
                  txn.amount >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"
                }`}>
                  {txn.amount >= 0 ? "+" : ""}{"\u20B9"}{Math.abs(Math.round(txn.amount)).toLocaleString("en-IN")}
                </p>
                <p className="text-[9px] text-white/20 mt-0.5">
                  Bal: {"\u20B9"}{Math.round(txn.balance).toLocaleString("en-IN")}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
