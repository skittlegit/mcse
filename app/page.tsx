import { Search, Bell } from "lucide-react";
import PortfolioCard from "@/components/PortfolioCard";
import WatchlistCard from "@/components/WatchlistCard";
import StockRow from "@/components/StockRow";
import { watchlist, stocksActivity, marketIndices } from "@/lib/mockData";
import MarketIndexCard from "@/components/MarketIndexCard";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Mobile Header ── */}
      <header className="flex items-center justify-between px-5 py-4 md:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
            AJ
          </div>
          <span className="font-bold text-base">Alex Julia</span>
        </div>
        <div className="flex items-center gap-4">
          <Search size={20} className="text-text-secondary" />
          <div className="relative">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-negative rounded-full" />
          </div>
        </div>
      </header>

      {/* ── Desktop Header ── */}
      <header className="hidden md:flex items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good morning, Alex</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Here&apos;s your portfolio overview
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface rounded-full px-4 py-2 border border-border">
            <Search size={16} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Search stocks..."
              className="bg-transparent text-sm outline-none w-48 placeholder:text-text-secondary"
              readOnly
            />
          </div>
          <div className="relative">
            <Bell size={20} className="text-text-secondary" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-negative rounded-full" />
          </div>
        </div>
      </header>

      {/* ── Content grid ── */}
      <div className="px-5 md:px-8 space-y-6 lg:grid lg:grid-cols-12 lg:gap-6 lg:space-y-0">
        {/* Column 1 — Portfolio + Activity */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          <PortfolioCard />

          {/* Stocks Activity */}
          <section>
            <h2 className="font-bold text-base mb-3">Stocks Activity</h2>
            <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
              {stocksActivity.map((s) => (
                <div key={s.ticker} className="px-4">
                  <StockRow stock={s} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Column 2 — Watchlist (mobile: horizontal scroll, desktop: grid) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">Watchlist</h2>
              <Link href="/markets" className="text-sm font-semibold text-accent">See All</Link>
            </div>
            {/* Mobile scroll */}
            <div className="flex gap-3 overflow-x-auto scrollbar-hide lg:hidden">
              {watchlist.map((s) => (
                <WatchlistCard key={s.ticker} stock={s} />
              ))}
            </div>
            {/* Desktop grid */}
            <div className="hidden lg:grid grid-cols-2 gap-3">
              {watchlist.map((s) => (
                <WatchlistCard key={s.ticker} stock={s} />
              ))}
            </div>
          </section>

          {/* Mini markets overview — desktop only */}
          <section className="hidden lg:block">
            <h2 className="font-bold text-base mb-3">Markets Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {marketIndices.slice(0, 2).map((idx) => (
                <MarketIndexCard key={idx.name} index={idx} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
