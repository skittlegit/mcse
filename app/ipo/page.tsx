"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  FileText,
  CalendarDays,
  IndianRupee,
  BarChart3,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useTrading } from "@/lib/TradingContext";

/* ── Types ────────────────────────────────────────────────── */

interface IPO {
  name: string;
  ticker: string;
  priceLow: number;
  priceHigh: number;
  lotPrice: number;
  dateStart: string;
  dateEnd: string;
  status: "LIVE" | "UPCOMING" | "CLOSED";
  lotSize: number;
  maxLots: number;
  gmp: number;
  subscriptionTimes: number;
  retailSubscription: number;
  niiSubscription: number;
  about: string;
  drhpUrl: string;
}

/* ── Data ─────────────────────────────────────────────────── */

const ipoList: IPO[] = [
  {
    name: "VORTEX ENERGY",
    ticker: "VORTEX",
    priceLow: 1200,
    priceHigh: 1350,
    lotPrice: 13500,
    dateStart: "Jun 10",
    dateEnd: "Jun 13",
    status: "LIVE",
    lotSize: 10,
    maxLots: 5,
    gmp: 180,
    subscriptionTimes: 3.2,
    retailSubscription: 4.8,
    niiSubscription: 2.1,
    about:
      "Renewable energy club focused on sustainable campus solutions and green technology initiatives. Active in solar panel installations and EV charging infrastructure across campus.",
    drhpUrl: "#",
  },
  {
    name: "AEON DYNAMICS",
    ticker: "AEONDYN",
    priceLow: 850,
    priceHigh: 920,
    lotPrice: 13800,
    dateStart: "Jun 15",
    dateEnd: "Jun 18",
    status: "UPCOMING",
    lotSize: 15,
    maxLots: 7,
    gmp: 0,
    subscriptionTimes: 0,
    retailSubscription: 0,
    niiSubscription: 0,
    about:
      "Robotics and automation club specializing in drone technology and autonomous systems. Winners of the national RoboCup challenge 2025.",
    drhpUrl: "#",
  },
  {
    name: "NEXGEN LABS",
    ticker: "NEXGEN",
    priceLow: 340,
    priceHigh: 380,
    lotPrice: 9500,
    dateStart: "Jun 20",
    dateEnd: "Jun 23",
    status: "UPCOMING",
    lotSize: 25,
    maxLots: 10,
    gmp: 0,
    subscriptionTimes: 0,
    retailSubscription: 0,
    niiSubscription: 0,
    about:
      "Research-driven biotech and chemistry club with published papers in peer-reviewed journals. Three patents pending for novel water purification methods.",
    drhpUrl: "#",
  },
];

/* ── Helpers ──────────────────────────────────────────────── */

function daysUntil(dateStr: string): number {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  };
  const [mon, day] = dateStr.split(" ");
  const target = new Date(2026, months[mon] || 0, parseInt(day));
  const diff = Math.ceil((target.getTime() - Date.now()) / 86400000);
  return Math.max(0, diff);
}

/* ── Component ────────────────────────────────────────────── */

export default function IPOPage() {
  const router = useRouter();
  const { balance } = useTrading();
  const [selectedTicker, setSelectedTicker] = useState<string>(ipoList[0].ticker);
  const [lots, setLots] = useState(1);
  const [appliedSet, setAppliedSet] = useState<Set<string>>(new Set());
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const selected = ipoList.find((i) => i.ticker === selectedTicker) || ipoList[0];
  const totalCost = selected.lotPrice * lots;
  const totalShares = selected.lotSize * lots;
  const canAfford = balance >= totalCost;
  const isApplied = appliedSet.has(selected.ticker);
  const liveCount = ipoList.filter((i) => i.status === "LIVE").length;

  function handleSelect(ticker: string) {
    setSelectedTicker(ticker);
    setLots(1);
    setMobileDetailOpen(true);
  }

  function handleApply() {
    if (!canAfford || isApplied || selected.status !== "LIVE") return;
    setAppliedSet((prev) => new Set(prev).add(selected.ticker));
    setToast(`Applied for ${lots} lot${lots > 1 ? "s" : ""} of ${selected.name}`);
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <div className="py-6">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">
              IPO
            </h1>
            <p className="text-[9px] tracking-[0.15em] text-white/25 mt-0.5">
              INITIAL PUBLIC OFFERINGS
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {liveCount > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00D26A]/10 border border-[#00D26A]/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full bg-[#00D26A] opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 bg-[#00D26A]" />
              </span>
              <span className="text-[9px] tracking-[0.12em] text-[#00D26A] font-semibold">
                {liveCount} LIVE
              </span>
            </span>
          )}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-white/8">
            <span className="text-[9px] tracking-[0.12em] text-white/30">BALANCE</span>
            <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}{Math.round(balance).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* ── Split panel layout ──────────────────────────── */}
      <div className="md:grid md:grid-cols-[5fr_7fr] md:gap-0 md:border md:border-white/8">

        {/* ─── LEFT: IPO List ───────────────────────────── */}
        <div className="md:border-r md:border-white/8">
          <div className="hidden md:flex items-center justify-between px-5 py-3 border-b border-white/8">
            <span className="text-[9px] tracking-[0.15em] text-white/30">{ipoList.length} ISSUES</span>
          </div>

          <div className="space-y-0">
            {ipoList.map((ipo, idx) => {
              const isActive = ipo.ticker === selectedTicker;
              const daysLeft = ipo.status === "UPCOMING" ? daysUntil(ipo.dateStart) : 0;
              const applied = appliedSet.has(ipo.ticker);

              return (
                <motion.button
                  key={ipo.ticker}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                  onClick={() => handleSelect(ipo.ticker)}
                  className={`w-full text-left transition-colors border-b border-white/6 ${
                    isActive
                      ? "bg-white/[0.04] md:border-l-2 md:border-l-white"
                      : "hover:bg-white/[0.02] md:border-l-2 md:border-l-transparent"
                  }`}
                >
                  <div className="px-4 py-4 md:px-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 border border-white/15 flex items-center justify-center shrink-0">
                          <span className="text-[9px] tracking-[0.08em] text-white/40 font-medium">
                            {ipo.ticker.slice(0, 3)}
                          </span>
                        </div>
                        <div>
                          <p className="font-[var(--font-anton)] text-[13px] tracking-[0.04em]">
                            {ipo.name}
                          </p>
                          <p className="text-[9px] text-white/25 mt-0.5">
                            {ipo.ticker} {"\u00B7"} {ipo.dateStart} {"\u2014"} {ipo.dateEnd}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span
                          className={`text-[8px] tracking-[0.12em] px-2 py-0.5 font-semibold ${
                            ipo.status === "LIVE"
                              ? "bg-[#00D26A]/15 text-[#00D26A]"
                              : ipo.status === "CLOSED"
                                ? "bg-white/5 text-white/25"
                                : "bg-white/5 text-white/40"
                          }`}
                        >
                          {ipo.status}
                        </span>
                        {applied && (
                          <span className="text-[8px] tracking-[0.1em] text-[#00D26A]/60">APPLIED</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-2">
                      <div>
                        <p className="text-[8px] tracking-[0.1em] text-white/20">PRICE BAND</p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          {"\u20B9"}{ipo.priceLow} {"\u2014"} {"\u20B9"}{ipo.priceHigh}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.1em] text-white/20">LOT</p>
                        <p className="text-[11px] text-white/60 mt-0.5">
                          {ipo.lotSize} shares
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.1em] text-white/20">
                          {ipo.status === "LIVE" ? "GMP" : "OPENS IN"}
                        </p>
                        <p className={`text-[11px] mt-0.5 ${ipo.status === "LIVE" ? "text-[#00D26A]" : "text-white/40"}`}>
                          {ipo.status === "LIVE"
                            ? `+\u20B9${ipo.gmp}`
                            : daysLeft > 0
                              ? `${daysLeft}d`
                              : "\u2014"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ─── RIGHT: Detail + Application ──────────────── */}
        {/* Desktop view */}
        <div className="hidden md:block">
          <IPODetail
            ipo={selected}
            lots={lots}
            setLots={setLots}
            totalCost={totalCost}
            totalShares={totalShares}
            canAfford={canAfford}
            isApplied={isApplied}
            balance={balance}
            onApply={handleApply}
          />
        </div>

        {/* Mobile bottom sheet */}
        <AnimatePresence>
          {mobileDetailOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileDetailOpen(false)}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 max-h-[92vh] bg-[#0a0a0a] border-t border-white/10 overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sticky top-0 bg-[#0a0a0a] z-10 flex items-center justify-between px-5 py-3 border-b border-white/8">
                  <span className="font-[var(--font-anton)] text-sm tracking-[0.06em]">{selected.name}</span>
                  <button
                    onClick={() => setMobileDetailOpen(false)}
                    className="w-8 h-8 flex items-center justify-center border border-white/15 hover:border-white/30 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
                <IPODetail
                  ipo={selected}
                  lots={lots}
                  setLots={setLots}
                  totalCost={totalCost}
                  totalShares={totalShares}
                  canAfford={canAfford}
                  isApplied={isApplied}
                  balance={balance}
                  onApply={handleApply}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 bg-[#00D26A] text-black text-[11px] tracking-[0.08em] font-semibold flex items-center gap-2"
          >
            <CheckCircle size={14} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Detail Panel ─────────────────────────────────────────── */

function IPODetail({
  ipo,
  lots,
  setLots,
  totalCost,
  totalShares,
  canAfford,
  isApplied,
  balance,
  onApply,
}: {
  ipo: IPO;
  lots: number;
  setLots: (n: number) => void;
  totalCost: number;
  totalShares: number;
  canAfford: boolean;
  isApplied: boolean;
  balance: number;
  onApply: () => void;
}) {
  const daysLeft = ipo.status === "UPCOMING" ? daysUntil(ipo.dateStart) : 0;
  const expectedListing = ipo.priceHigh + ipo.gmp;

  return (
    <div className="divide-y divide-white/6">
      {/* Header */}
      <div className="px-5 py-5 md:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-[var(--font-anton)] text-lg tracking-[0.06em]">{ipo.name}</h2>
            <p className="text-[10px] text-white/30 mt-0.5">{ipo.ticker} {"\u00B7"} {ipo.dateStart} {"\u2014"} {ipo.dateEnd}</p>
          </div>
          <a
            href={ipo.drhpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-[9px] tracking-[0.12em] text-white/40 hover:text-white hover:border-white/25 transition-colors"
          >
            <FileText size={11} />
            DRHP
            <ExternalLink size={9} className="ml-0.5" />
          </a>
        </div>
        <p className="text-[11px] text-white/35 leading-relaxed">{ipo.about}</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-white/6">
        {[
          { label: "PRICE BAND", value: `\u20B9${ipo.priceLow.toLocaleString("en-IN")} \u2014 \u20B9${ipo.priceHigh.toLocaleString("en-IN")}` },
          { label: "LOT SIZE", value: `${ipo.lotSize} shares` },
          { label: "LOT PRICE", value: `\u20B9${ipo.lotPrice.toLocaleString("en-IN")}` },
          { label: "MAX LOTS", value: `${ipo.maxLots}` },
        ].map((m) => (
          <div key={m.label} className="bg-[#0a0a0a] px-4 py-3 md:px-5 md:py-4">
            <p className="text-[8px] tracking-[0.15em] text-white/20 mb-1">{m.label}</p>
            <p className="font-[var(--font-anton)] text-sm">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Subscription status — LIVE only */}
      {ipo.status === "LIVE" && (
        <div className="px-5 py-5 md:px-6">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-4">SUBSCRIPTION STATUS</p>
          <div className="space-y-3">
            {[
              { label: "Overall", value: ipo.subscriptionTimes, delay: 0.1 },
              { label: "Retail", value: ipo.retailSubscription, delay: 0.15 },
              { label: "NII", value: ipo.niiSubscription, delay: 0.2 },
            ].map((sub) => (
              <div key={sub.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-white/40">{sub.label}</span>
                  <span className="text-[11px] text-white/70 font-medium">{sub.value.toFixed(1)}x</span>
                </div>
                <div className="h-1.5 bg-white/8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (sub.value / 5) * 100)}%` }}
                    transition={{ duration: 0.6, delay: sub.delay }}
                    className="h-full bg-[#00D26A]/60"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Expected listing */}
          <div className="flex items-center justify-between px-3 py-2.5 border border-white/6 mt-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={12} className="text-white/20" />
              <span className="text-[10px] text-white/40">Expected Listing</span>
            </div>
            <span className="text-[12px] text-[#00D26A] font-medium">
              {"\u20B9"}{expectedListing.toLocaleString("en-IN")} (+{((ipo.gmp / ipo.priceHigh) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>
      )}

      {/* Upcoming notice */}
      {ipo.status === "UPCOMING" && (
        <div className="px-5 py-5 md:px-6">
          <div className="flex flex-col items-center justify-center py-8 border border-white/6">
            <Clock size={20} className="text-white/15 mb-2" />
            <p className="text-[11px] text-white/30 mb-1">Opens in {daysLeft} days</p>
            <p className="text-[9px] text-white/15">{ipo.dateStart} {"\u2014"} {ipo.dateEnd}</p>
          </div>
        </div>
      )}

      {/* ── Application panel — LIVE only ─────────────── */}
      {ipo.status === "LIVE" && (
        <div className="px-5 py-5 md:px-6">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-4">
            {isApplied ? "APPLICATION" : "APPLY FOR IPO"}
          </p>

          {!isApplied ? (
            <>
              {/* Lot selector */}
              <div className="mb-4">
                <label className="text-[10px] tracking-[0.1em] text-white/40 mb-2 block">NO. OF LOTS</label>
                <div className="flex items-center border border-white/20">
                  <button
                    onClick={() => setLots(Math.max(1, lots - 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    value={lots}
                    onChange={(e) => {
                      const v = parseInt(e.target.value) || 1;
                      setLots(Math.max(1, Math.min(ipo.maxLots, v)));
                    }}
                    className="flex-1 h-10 bg-transparent text-center font-[var(--font-anton)] text-lg text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button
                    onClick={() => setLots(Math.min(ipo.maxLots, lots + 1))}
                    className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-[8px] tracking-[0.1em] text-white/20 mt-1.5">
                  MAX {ipo.maxLots} LOTS {"\u00B7"} {ipo.lotSize} SHARES PER LOT
                </p>
              </div>

              {/* Cost breakdown */}
              <div className="space-y-0 mb-4">
                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-[10px] text-white/40">Lot Price</span>
                  <span className="text-[11px] text-white/60">{"\u20B9"}{ipo.lotPrice.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-[10px] text-white/40">Lots</span>
                  <span className="text-[11px] text-white/60">{lots}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-white/6">
                  <span className="text-[10px] text-white/40">Total Shares</span>
                  <span className="text-[11px] text-white/60">{totalShares}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-white/8">
                  <span className="text-[10px] tracking-[0.1em] text-white/50 font-medium">TOTAL COST</span>
                  <span className="font-[var(--font-anton)] text-xl">{"\u20B9"}{totalCost.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[10px] tracking-[0.1em] text-white/40">AVAILABLE BALANCE</span>
                <span className={`font-[var(--font-anton)] text-sm ${canAfford ? "text-white" : "text-[#FF5252]"}`}>
                  {"\u20B9"}{Math.round(balance).toLocaleString("en-IN")}
                </span>
              </div>
              {!canAfford && (
                <p className="text-[10px] text-[#FF5252]/70 mb-4">Insufficient balance for this application</p>
              )}

              {/* Apply button */}
              <motion.button
                onClick={onApply}
                whileTap={{ scale: 0.97 }}
                disabled={!canAfford}
                className={`w-full h-11 text-[10px] tracking-[0.15em] font-semibold border transition-all duration-300 ${
                  canAfford
                    ? "bg-[#00D26A] text-black border-[#00D26A] hover:bg-transparent hover:text-[#00D26A]"
                    : "bg-white/5 text-white/20 border-white/8 cursor-not-allowed"
                }`}
              >
                APPLY FOR {lots} LOT{lots > 1 ? "S" : ""} {"\u00B7"} {"\u20B9"}{totalCost.toLocaleString("en-IN")}
              </motion.button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 border border-[#00D26A]/20 bg-[#00D26A]/5">
              <CheckCircle size={24} className="text-[#00D26A] mb-2" />
              <p className="text-[11px] tracking-[0.1em] text-[#00D26A] font-medium mb-1">APPLICATION SUBMITTED</p>
              <p className="text-[9px] text-white/25">Allotment status will be updated after the closing date</p>
            </div>
          )}
        </div>
      )}

      {/* Upcoming CTA */}
      {ipo.status === "UPCOMING" && (
        <div className="px-5 py-5 md:px-6">
          <div className="flex items-center justify-center gap-2 h-11 border border-white/8 text-white/25 text-[10px] tracking-[0.15em]">
            <Clock size={14} />
            BIDDING OPENS {ipo.dateStart.toUpperCase()}
          </div>
        </div>
      )}

      {/* Closed CTA */}
      {ipo.status === "CLOSED" && (
        <div className="px-5 py-5 md:px-6">
          <div className="flex items-center justify-center gap-2 h-11 border border-white/6 text-white/20 text-[10px] tracking-[0.15em]">
            ISSUE CLOSED
          </div>
        </div>
      )}
    </div>
  );
}
