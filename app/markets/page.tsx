"use client";

import { useState } from "react";
import { ArrowLeft, Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import MarketIndexCard from "@/components/MarketIndexCard";
import SearchBar from "@/components/SearchBar";
import StockRow from "@/components/StockRow";
import StockChart from "@/components/StockChart";
import { marketIndices, marketMovers } from "@/lib/mockData";

const featuredChartData = [
  { day: "Mon", price: 35500 },
  { day: "Tue", price: 35600 },
  { day: "Wed", price: 35550 },
  { day: "Thu", price: 35700 },
  { day: "Fri", price: 35819 },
];

export default function MarketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = search
    ? marketMovers.filter(
        (s) =>
          s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase())
      )
    : marketMovers;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-8 py-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface transition-colors md:hidden"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-bold text-base md:text-2xl md:tracking-tight">
          Markets
        </h1>
        <div className="relative">
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-negative rounded-full" />
        </div>
      </header>

      <div className="px-5 md:px-8 space-y-6">
        {/* Market Index Cards */}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide lg:grid lg:grid-cols-4 lg:overflow-visible">
          {marketIndices.map((idx) => (
            <MarketIndexCard key={idx.name} index={idx} />
          ))}
        </div>

        <div className="lg:grid lg:grid-cols-5 lg:gap-8">
          {/* Left: Search + Movers */}
          <div className="lg:col-span-3 space-y-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search..."
            />

            <section>
              <h2 className="font-bold text-base mb-3">Market Movers</h2>
              <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
                {filtered.map((s) => (
                  <div key={s.ticker} className="px-4">
                    <StockRow stock={s} />
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="py-8 text-center text-sm text-text-secondary">
                    No results found
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Right: Featured chart — desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="bg-surface rounded-2xl border border-border p-5 sticky top-6">
              <h3 className="font-bold mb-1">Dow Jones</h3>
              <p className="text-2xl font-bold mb-1">$35,819.56</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full mb-4">
                ↑ 0.25%
              </span>
              <div className="h-[280px]">
                <StockChart data={featuredChartData} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
