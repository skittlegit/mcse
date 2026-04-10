"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  BarChart3,
  TrendingUp,
  Shield,
  Activity,
  DollarSign,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";
import { useAuth, type UserRole } from "@/lib/AuthContext";
import { holdings } from "@/lib/mockData";

/* Mock admin data */
const platformStats = {
  totalUsers: 248,
  activeToday: 67,
  totalTrades: 1_842,
  totalVolume: 24_87_693,
  pendingOrders: 23,
  listedStocks: 42,
};

const recentUsers = [
  { name: "ARUN KUMAR", email: "arun@mcse.in", role: "user" as UserRole, trades: 34 },
  { name: "PRIYA SHARMA", email: "priya@mcse.in", role: "user" as UserRole, trades: 21 },
  { name: "RAHUL VERMA", email: "rahul@mcse.in", role: "companyAdmin" as UserRole, trades: 15 },
  { name: "MEENA REDDY", email: "meena@mcse.in", role: "user" as UserRole, trades: 42 },
  { name: "VIKASH PATEL", email: "vikash@mcse.in", role: "user" as UserRole, trades: 8 },
];

const companyStocks = holdings.slice(0, 4);

export default function AdminPage() {
  const { isLoggedIn, role, userName } = useAuth();
  const router = useRouter();

  if (!isLoggedIn || !role || role === "user") {
    return (
      <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <AlertTriangle size={32} className="text-white/20 mb-4" />
          <p className="font-[var(--font-anton)] text-lg tracking-[0.1em] mb-2">ACCESS DENIED</p>
          <p className="text-[11px] text-white/40 mb-6">You need admin privileges to access this page.</p>
          <button
            onClick={() => router.push("/")}
            className="h-10 px-6 border border-white/20 text-[10px] tracking-[0.15em] text-white/60 hover:text-white hover:border-white transition-all"
          >
            GO TO EXPLORE
          </button>
        </motion.div>
      </div>
    );
  }

  const isTotalAdmin = role === "totalAdmin";

  return (
    <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-white/30 hover:text-white transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-white/40" />
              <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.08em] uppercase">
                {isTotalAdmin ? "TOTAL ADMIN" : "COMPANY ADMIN"}
              </h1>
            </div>
            <p className="text-[10px] text-white/30 mt-1">Logged in as {userName}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-white/8 mb-8"
      >
        {isTotalAdmin && (
          <div className="bg-[#0a0a0a] p-5">
            <div className="flex items-center gap-2 mb-2">
              <Users size={13} className="text-white/30" />
              <span className="text-[9px] tracking-[0.2em] text-white/30">TOTAL USERS</span>
            </div>
            <p className="font-[var(--font-anton)] text-2xl">{platformStats.totalUsers}</p>
            <p className="text-[10px] text-[#00D26A] mt-1">{platformStats.activeToday} active today</p>
          </div>
        )}
        <div className="bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Activity size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">TOTAL TRADES</span>
          </div>
          <p className="font-[var(--font-anton)] text-2xl">{platformStats.totalTrades.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">TRADE VOLUME</span>
          </div>
          <p className="font-[var(--font-anton)] text-2xl">{"\u20B9"}{platformStats.totalVolume.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">PENDING ORDERS</span>
          </div>
          <p className="font-[var(--font-anton)] text-2xl">{platformStats.pendingOrders}</p>
        </div>
        <div className="bg-[#0a0a0a] p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">LISTED STOCKS</span>
          </div>
          <p className="font-[var(--font-anton)] text-2xl">{platformStats.listedStocks}</p>
        </div>
      </motion.div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users Section (Total Admin only) / Company Stocks (Company Admin) */}
        {isTotalAdmin ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-white/10"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">RECENT USERS</p>
              <span className="text-[9px] tracking-[0.1em] text-white/20">{platformStats.totalUsers} total</span>
            </div>
            {recentUsers.map((user, i) => (
              <div
                key={user.email}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                  i < recentUsers.length - 1 ? "border-b border-white/6" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[8px] tracking-wider text-white/40">
                      {user.name.split(" ").map(w => w[0]).join("")}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.05em] text-white/70">{user.name}</p>
                    <p className="text-[9px] text-white/30">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/50">{user.trades} trades</p>
                  {user.role !== "user" && (
                    <span className="text-[8px] tracking-[0.1em] text-white/30 border border-white/15 px-1 py-0.5">
                      {user.role === "companyAdmin" ? "CO. ADMIN" : "ADMIN"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="border border-white/10"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">COMPANY STOCKS</p>
              <span className="text-[9px] tracking-[0.1em] text-white/20">{companyStocks.length} stocks</span>
            </div>
            {companyStocks.map((stock, i) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className={`flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.03] transition-colors ${
                  i < companyStocks.length - 1 ? "border-b border-white/6" : ""
                }`}
              >
                <div>
                  <p className="text-[11px] tracking-[0.05em] text-white/70">{stock.ticker}</p>
                  <p className="text-[9px] text-white/30">{stock.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-[var(--font-anton)] text-sm">{"\u20B9"}{stock.currentPrice.toLocaleString("en-IN")}</p>
                  <p className={`text-[10px] ${stock.dayChangePercent >= 0 ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
                    {stock.dayChangePercent >= 0 ? "+" : ""}{stock.dayChangePercent.toFixed(2)}%
                  </p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="border border-white/10"
        >
          <div className="px-5 py-4 border-b border-white/8">
            <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">RECENT ACTIVITY</p>
          </div>
          {[
            { action: "BUY ORDER", detail: "RELIANCE × 10 @ ₹2,847.30", time: "2 min ago", color: "text-[#00D26A]" },
            { action: "SELL ORDER", detail: "TCS × 5 @ ₹3,645.00", time: "8 min ago", color: "text-[#FF5252]" },
            { action: "NEW USER", detail: "vikash@mcse.in registered", time: "15 min ago", color: "text-white/50" },
            { action: "BUY ORDER", detail: "INFY × 20 @ ₹1,587.45", time: "23 min ago", color: "text-[#00D26A]" },
            { action: "LIMIT ORDER", detail: "HDFCBANK × 8 @ ₹1,623.00", time: "31 min ago", color: "text-white/50" },
            { action: "SELL ORDER", detail: "SBIN × 15 @ ₹628.90", time: "45 min ago", color: "text-[#FF5252]" },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-5 py-3 ${
                i < 5 ? "border-b border-white/6" : ""
              }`}
            >
              <div>
                <span className={`text-[9px] tracking-[0.15em] font-semibold ${item.color}`}>{item.action}</span>
                <p className="text-[11px] text-white/50 mt-0.5">{item.detail}</p>
              </div>
              <span className="text-[9px] text-white/20 shrink-0">{item.time}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
