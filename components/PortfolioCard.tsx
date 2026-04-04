import { TrendingUp } from "lucide-react";
import { portfolio } from "@/lib/mockData";

export default function PortfolioCard() {
  return (
    <div className="bg-dark-card rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute -right-4 -bottom-12 w-24 h-24 rounded-full bg-white/5" />

      <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-3">
          <p className="text-sm text-white/60">Portfolio value</p>
          <div className="flex items-end gap-3">
            <h2 className="text-3xl font-bold tracking-tight">
              ${portfolio.value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </h2>
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-accent/20 text-accent px-2 py-0.5 rounded-full mb-1">
              <TrendingUp size={12} />
              {portfolio.changePercent}%
            </span>
          </div>

          <div className="flex gap-3 mt-2">
            <button className="px-5 py-2 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
              Deposit
            </button>
            <button className="px-5 py-2 rounded-full border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
              Withdraw
            </button>
          </div>
        </div>

        {/* Payment icons */}
        <div className="flex sm:flex-col gap-2">
          {["Apple Pay", "PayPal", "Visa"].map((name) => (
            <div
              key={name}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/70"
            >
              {name.slice(0, 2)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
