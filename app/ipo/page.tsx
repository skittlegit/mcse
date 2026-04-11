"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, TrendingUp, Users, CheckCircle, ArrowLeft } from "lucide-react";

interface IPO {
  name: string;
  priceLow: number;
  priceHigh: number;
  dateStart: string;
  dateEnd: string;
  status: "LIVE" | "UPCOMING" | "CLOSED";
  lotSize: number;
  gmp: number;
  subscriptionTimes: number;
  about: string;
}

const ipoList: IPO[] = [
  {
    name: "VORTEX ENERGY",
    priceLow: 1200,
    priceHigh: 1350,
    dateStart: "Jun 10",
    dateEnd: "Jun 13",
    status: "LIVE",
    lotSize: 10,
    gmp: 180,
    subscriptionTimes: 3.2,
    about: "Renewable energy club focused on sustainable campus solutions and green technology initiatives.",
  },
  {
    name: "AEON DYNAMICS",
    priceLow: 850,
    priceHigh: 920,
    dateStart: "Jun 15",
    dateEnd: "Jun 18",
    status: "UPCOMING",
    lotSize: 15,
    gmp: 0,
    subscriptionTimes: 0,
    about: "Robotics and automation club specializing in drone technology and autonomous systems.",
  },
  {
    name: "NEXGEN LABS",
    priceLow: 340,
    priceHigh: 380,
    dateStart: "Jun 20",
    dateEnd: "Jun 23",
    status: "UPCOMING",
    lotSize: 25,
    gmp: 0,
    subscriptionTimes: 0,
    about: "Research-driven biotech and chemistry club with published papers in peer-reviewed journals.",
  },
];

function daysUntil(dateStr: string): number {
  const months: Record<string, number> = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };
  const [mon, day] = dateStr.split(" ");
  const target = new Date(2026, months[mon] || 0, parseInt(day));
  const now = new Date();
  const diff = Math.ceil((target.getTime() - now.getTime()) / 86400000);
  return Math.max(0, diff);
}

export default function IPOPage() {
  const router = useRouter();
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const [selectedIPO, setSelectedIPO] = useState<string | null>(null);

  function handleApply(name: string) {
    setAppliedSet((prev) => new Set(prev).add(name));
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"><ArrowLeft size={15} /></button>
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">IPO</h1>
        </div>
        <span className="text-[9px] tracking-[0.15em] text-white/25">{ipoList.filter(i => i.status === "LIVE").length} LIVE · {ipoList.filter(i => i.status === "UPCOMING").length} UPCOMING</span>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-[1px] bg-white/8 mb-6">
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">LIVE</p>
          <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">{ipoList.filter(i => i.status === "LIVE").length}</p>
        </div>
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">UPCOMING</p>
          <p className="font-[var(--font-anton)] text-xl">{ipoList.filter(i => i.status === "UPCOMING").length}</p>
        </div>
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">CLOSED</p>
          <p className="font-[var(--font-anton)] text-xl text-white/30">{ipoList.filter(i => i.status === "CLOSED").length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {ipoList.map((ipo) => {
          const isApplied = appliedSet.has(ipo.name);
          const isExpanded = selectedIPO === ipo.name;
          const daysLeft = ipo.status === "UPCOMING" ? daysUntil(ipo.dateStart) : 0;
          const minInvestment = ipo.priceLow * ipo.lotSize;

          return (
            <motion.div
              key={ipo.name}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-white/8 overflow-hidden"
            >
              <button
                onClick={() => setSelectedIPO(isExpanded ? null : ipo.name)}
                className="w-full text-left p-5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-[var(--font-anton)] text-[15px] tracking-[0.05em] mb-1">{ipo.name}</p>
                    <p className="text-[10px] text-white/40">{ipo.dateStart} — {ipo.dateEnd}</p>
                  </div>
                  <span
                    className={`text-[9px] tracking-[0.15em] px-2.5 py-1 font-semibold ${
                      ipo.status === "LIVE"
                        ? "bg-[#00D26A]/15 text-[#00D26A]"
                        : ipo.status === "CLOSED"
                        ? "bg-white/5 text-white/25"
                        : "bg-white/5 text-white/40"
                    }`}
                  >
                    {ipo.status}
                    {ipo.status === "UPCOMING" && daysLeft > 0 && (
                      <span className="ml-1 text-white/25">· {daysLeft}d</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">PRICE BAND</p>
                    <p className="text-[12px] text-white/60">{"\u20B9"}{ipo.priceLow} — {"\u20B9"}{ipo.priceHigh}</p>
                  </div>
                  <div>
                    <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">LOT SIZE</p>
                    <p className="text-[12px] text-white/60">{ipo.lotSize} shares</p>
                  </div>
                  {ipo.status === "LIVE" && (
                    <>
                      <div>
                        <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">GMP</p>
                        <p className="text-[12px] text-[#00D26A]">+{"\u20B9"}{ipo.gmp} ({((ipo.gmp / ipo.priceHigh) * 100).toFixed(1)}%)</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">SUBSCRIPTION</p>
                        <p className="text-[12px] text-white/60">{ipo.subscriptionTimes.toFixed(1)}x</p>
                      </div>
                    </>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 border-t border-white/6 pt-4">
                      <p className="text-[11px] text-white/40 leading-relaxed mb-4">{ipo.about}</p>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="border border-white/6 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp size={10} className="text-white/25" />
                            <span className="text-[8px] tracking-[0.15em] text-white/25">MIN INVEST</span>
                          </div>
                          <p className="font-[var(--font-anton)] text-sm">{"\u20B9"}{minInvestment.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="border border-white/6 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users size={10} className="text-white/25" />
                            <span className="text-[8px] tracking-[0.15em] text-white/25">LOT SIZE</span>
                          </div>
                          <p className="font-[var(--font-anton)] text-sm">{ipo.lotSize}</p>
                        </div>
                        <div className="border border-white/6 p-3">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock size={10} className="text-white/25" />
                            <span className="text-[8px] tracking-[0.15em] text-white/25">CLOSES</span>
                          </div>
                          <p className="font-[var(--font-anton)] text-sm">{ipo.dateEnd}</p>
                        </div>
                      </div>

                      {ipo.status === "LIVE" && (
                        <div className="mb-4">
                          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-2">SUBSCRIPTION STATUS</p>
                          <div className="h-2 bg-white/8 overflow-hidden">
                            <div
                              className="h-full bg-[#00D26A]/60"
                              style={{ width: `${Math.min(100, (ipo.subscriptionTimes / 5) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[9px] text-white/25 mt-1">{ipo.subscriptionTimes.toFixed(1)}x subscribed</p>
                        </div>
                      )}

                      {ipo.status === "LIVE" && !isApplied && (
                        <button
                          onClick={() => handleApply(ipo.name)}
                          className="w-full h-11 bg-[#00D26A] text-black text-[10px] tracking-[0.15em] font-semibold border border-[#00D26A] hover:bg-transparent hover:text-[#00D26A] transition-all duration-150"
                        >
                          APPLY FOR IPO · {"\u20B9"}{minInvestment.toLocaleString("en-IN")}
                        </button>
                      )}

                      {ipo.status === "LIVE" && isApplied && (
                        <div className="flex items-center justify-center gap-2 h-11 border border-[#00D26A]/30 bg-[#00D26A]/10 text-[#00D26A] text-[10px] tracking-[0.15em]">
                          <CheckCircle size={14} />
                          APPLICATION SUBMITTED
                        </div>
                      )}

                      {ipo.status === "UPCOMING" && (
                        <div className="flex items-center justify-center gap-2 h-11 border border-white/10 text-white/30 text-[10px] tracking-[0.15em]">
                          <Clock size={14} />
                          OPENS IN {daysLeft} DAYS
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
