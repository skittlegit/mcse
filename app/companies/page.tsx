"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface LiveSubsidiary {
  ticker: string;
  name: string;
  sector: string;
  price: number;
  change_pct: number;
  market_cap: number;
}

interface LiveHolding {
  ticker: string;
  name: string;
  sector: string;
  about: string;
  logo_letter: string;
  subsidiaries: LiveSubsidiary[];
  total_market_cap: number;
}

export default function CompaniesPage() {
  const router = useRouter();
  const [holdings, setHoldings] = useState<LiveHolding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!API_BASE) return;
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/market/companies`);
        if (!res.ok) return;
        const data = (await res.json()) as LiveHolding[];
        if (!cancelled) {
          setHoldings(data);
          setLoaded(true);
        }
      } catch { /* ignore */ }
    }
    load();
    const id = setInterval(load, 5000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return (
    <div className="py-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
        >
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">
            HOLDING COMPANIES
          </h1>
          <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">
            {loaded ? `${holdings.length} GROUPS LISTED` : "LOADING…"}
          </p>
        </div>
      </div>

      {/* Companies list */}
      <div className="space-y-[1px] bg-white/8">
        {holdings.map((pc, i) => {
          const subChanges = pc.subsidiaries.map((s) => s.change_pct);
          const avgChange =
            subChanges.length > 0
              ? subChanges.reduce((s, v) => s + v, 0) / subChanges.length
              : 0;

          return (
            <motion.div
              key={pc.ticker}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
            >
              <Link
                href={`/company/${pc.ticker}`}
                className="flex items-center gap-4 bg-bg p-5 hover:bg-white/[0.03] transition-colors group"
              >
                <div className="w-11 h-11 border border-white/20 flex items-center justify-center shrink-0 group-hover:border-white/40 transition-colors">
                  <span className="font-[var(--font-anton)] text-lg text-white/60">
                    {pc.logo_letter}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-[var(--font-anton)] text-[14px] tracking-[0.05em] group-hover:text-white transition-colors">
                      {pc.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[9px] tracking-[0.1em] text-white/25">
                      {pc.ticker}
                    </span>
                    <span className="text-white/8">·</span>
                    <span className="text-[9px] text-white/20">
                      {pc.subsidiaries.length} subsidiaries
                    </span>
                    <span className="text-white/8 hidden md:inline">·</span>
                    <span className="text-[9px] text-white/20 hidden md:inline">
                      {pc.sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 md:hidden">
                    {pc.subsidiaries.map((s) => (
                      <span
                        key={s.ticker}
                        className="text-[8px] tracking-[0.08em] text-white/20"
                      >
                        {s.ticker}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-[12px] font-medium ${
                      avgChange >= 0 ? "text-up" : "text-down"
                    }`}
                  >
                    {avgChange >= 0 ? "+" : ""}
                    {avgChange.toFixed(2)}%
                  </p>
                  <p className="text-[9px] text-white/20 mt-0.5">
                    {pc.subsidiaries.length} subs
                  </p>
                </div>
                <ChevronRight
                  size={12}
                  className="text-white/15 group-hover:text-white/40 transition-colors shrink-0 hidden md:block"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
