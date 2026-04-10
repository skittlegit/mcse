"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import {
  investments,
  holdings,
  portfolioAnalysis,
} from "@/lib/mockData";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function AnalysePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="pb-24 md:pb-12 px-5 md:px-6 py-6">
        <LoginPrompt message="Log in to view your portfolio analysis." />
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-8"
      >
        <button onClick={() => router.back()} className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </button>
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em]">PORTFOLIO ANALYSIS</h1>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="border border-white/10 p-5 mb-7"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-1">PORTFOLIO VALUE</p>
            <p className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-tight">
              {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <p className="text-[11px] text-white/40">{holdings.length} stocks</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-3 gap-[1px] bg-white/8 mb-7"
      >
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">XIRR</p>
          <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.xirr}%</p>
        </div>
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">{portfolioAnalysis.benchmarkName}</p>
          <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.benchmarkReturn}%</p>
        </div>
        <div className="bg-[#0a0a0a] p-4">
          <p className="text-[9px] tracking-[0.15em] text-white/25 mb-1">ALPHA</p>
          <p className="font-[var(--font-anton)] text-xl text-[#00D26A]">+{portfolioAnalysis.outperformance}%</p>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mb-7"
      >
        <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">PERFORMANCE</h3>
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioAnalysis.performanceChart} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="portfolioGradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="benchGradA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#666666" stopOpacity={0.1} />
                  <stop offset="100%" stopColor="#666666" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 9, fill: "rgba(255,255,255,0.3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "rgba(255,255,255,0.2)" }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11, color: "#fff" }}
                formatter={(value) => [`\u20B9${Number(value).toLocaleString("en-IN")}`, ""]}
                labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginBottom: 4 }}
              />
              <Area type="monotone" dataKey="portfolio" stroke="#fff" strokeWidth={1.5} fill="url(#portfolioGradA)" name="Portfolio" />
              <Area type="monotone" dataKey="benchmark" stroke="#555" strokeWidth={1} fill="url(#benchGradA)" name={portfolioAnalysis.benchmarkName} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-white" />
            <span className="text-[9px] tracking-[0.1em] text-white/40">PORTFOLIO</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-[2px] bg-white/30" style={{ borderTop: "1px dashed" }} />
            <span className="text-[9px] tracking-[0.1em] text-white/40">{portfolioAnalysis.benchmarkName}</span>
          </div>
        </div>
      </motion.div>

      {/* Sector Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mb-7"
      >
        <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">SECTOR ALLOCATION</h3>
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioAnalysis.sectorAllocation}
                  dataKey="value"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={35}
                  strokeWidth={1}
                  stroke="#0a0a0a"
                >
                  {portfolioAnalysis.sectorAllocation.map((_: { sector: string; value: number }, idx: number) => (
                    <Cell key={idx} fill={["#fff", "#888", "#555", "#aaa", "#666", "#ccc"][idx % 6]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.15)", fontSize: 11, color: "#fff" }}
                  formatter={(value) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {portfolioAnalysis.sectorAllocation.map((s: { sector: string; value: number }, i: number) => (
              <div key={s.sector} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5" style={{ backgroundColor: ["#fff", "#888", "#555", "#aaa", "#666", "#ccc"][i % 6] }} />
                  <span className="text-[10px] text-white/50">{s.sector}</span>
                </div>
                <span className="text-[11px] font-[var(--font-anton)]">{s.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Market Cap Allocation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
        <h3 className="font-[var(--font-anton)] text-sm tracking-[0.1em] uppercase mb-4">MARKET CAP ALLOCATION</h3>
        <div className="space-y-3">
          {portfolioAnalysis.marketCapAllocation.map((m: { cap: string; value: number }) => (
            <div key={m.cap}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] tracking-[0.1em] text-white/50">{m.cap.toUpperCase()}</span>
                <span className="text-[11px] font-[var(--font-anton)]">{m.value}%</span>
              </div>
              <div className="h-1.5 bg-white/8 w-full">
                <div className="h-full bg-white/60" style={{ width: `${m.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
