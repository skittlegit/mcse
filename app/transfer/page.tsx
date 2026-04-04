"use client";

import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";

export default function TransferPage() {
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"deposit" | "withdraw">("deposit");

  return (
    <div className="max-w-lg mx-auto px-5 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Transfer</h1>

      {/* Type toggle */}
      <div className="flex bg-bg rounded-full p-1">
        <button
          onClick={() => setType("deposit")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            type === "deposit" ? "bg-accent text-white" : "text-text-secondary"
          }`}
        >
          <ArrowDownLeft size={16} /> Deposit
        </button>
        <button
          onClick={() => setType("withdraw")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-colors ${
            type === "withdraw" ? "bg-dark-card text-white" : "text-text-secondary"
          }`}
        >
          <ArrowUpRight size={16} /> Withdraw
        </button>
      </div>

      {/* Amount card */}
      <div className="bg-surface rounded-2xl border border-border p-6 text-center space-y-4">
        <p className="text-sm text-text-secondary">Enter amount</p>
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-bold">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="text-4xl font-bold bg-transparent outline-none w-48 text-center placeholder:text-text-secondary/40"
            min="0"
            step="0.01"
          />
        </div>
        <p className="text-xs text-text-secondary">Available balance: $15,136.32</p>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-3 justify-center">
        {[100, 500, 1000, 5000].map((v) => (
          <button
            key={v}
            onClick={() => setAmount(String(v))}
            className="px-4 py-2 rounded-full border border-border text-sm font-medium hover:bg-bg transition-colors"
          >
            ${v.toLocaleString()}
          </button>
        ))}
      </div>

      <button className="w-full py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/90 transition-colors">
        {type === "deposit" ? "Deposit Funds" : "Withdraw Funds"}
      </button>
    </div>
  );
}
