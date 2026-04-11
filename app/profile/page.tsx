"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  Calendar,
  Wallet,
  ChevronRight,
  HelpCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { userProfile, investments } from "@/lib/mockData";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";

const sections = [
  {
    title: "ACCOUNT",
    items: [
      { icon: Wallet, label: "AVAILABLE BALANCE", value: "__BALANCE__", href: "" },
      { icon: Settings, label: "PREFERENCES", href: "/preferences" },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { icon: HelpCircle, label: "CUSTOMER SUPPORT", href: "/support" },
    ],
  },
];

export default function ProfilePage() {
  const { isLoggedIn, logout, role, userName, userEmail } = useAuth();
  const { balance } = useTrading();
  const router = useRouter();

  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2) : "?";

  if (!isLoggedIn) {
    return (
      <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
        <LoginPrompt message="Log in to view your profile and account settings." />
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start gap-5 mb-8"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-white flex items-center justify-center shrink-0">
          <span className="font-monument text-xl md:text-2xl font-extrabold tracking-wider">{initials}</span>
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h1 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.08em] uppercase mb-1">
            {userName}
          </h1>
          <p className="text-[11px] md:text-[12px] text-white/40 tracking-[0.05em]">{userEmail}</p>
          {role && role !== "user" && (
            <span className="inline-block mt-1 text-[9px] tracking-[0.15em] px-2 py-0.5 border border-white/20 text-white/60 uppercase">
              {role === "companyAdmin" ? "COMPANY ADMIN" : "TOTAL ADMIN"}
            </span>
          )}
        </div>
      </motion.div>

      {/* Info cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 gap-[1px] bg-white/8 mb-8"
      >
        <div className="bg-[#0a0a0a] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Mail size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">EMAIL</span>
          </div>
          <p className="text-[12px] md:text-[13px] text-white/70">{userEmail}</p>
        </div>
        <div className="bg-[#0a0a0a] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">PHONE</span>
          </div>
          <p className="text-[12px] md:text-[13px] text-white/70">{userProfile.phone}</p>
        </div>
        <div className="bg-[#0a0a0a] p-4 md:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={13} className="text-white/30" />
            <span className="text-[9px] tracking-[0.2em] text-white/30">MEMBER SINCE</span>
          </div>
          <p className="text-[12px] md:text-[13px] text-white/70">{userProfile.joined}</p>
        </div>
      </motion.div>

      {/* Portfolio summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="border border-white/10 p-5 md:p-6 mb-8"
      >
        <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-3">PORTFOLIO OVERVIEW</p>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-tight">
              {"\u20B9"}{investments.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-[#00D26A] mt-1">
              +{"\u20B9"}{investments.totalReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })} (+{investments.totalReturnsPercent.toFixed(2)}%)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1">INVESTED</p>
            <p className="font-[var(--font-anton)] text-sm">{"\u20B9"}{investments.investedValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1">1D RETURNS</p>
            <p className="font-[var(--font-anton)] text-sm text-[#00D26A]">
              +{"\u20B9"}{investments.dayReturns.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <p className="text-[9px] tracking-[0.15em] text-white/25 uppercase mb-1">BALANCE</p>
            <div className="flex items-center gap-2">
              <p className="font-[var(--font-anton)] text-sm">{"\u20B9"}{Math.round(balance).toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
        <Link
          href="/holdings"
          className="mt-4 w-full h-10 bg-white text-black flex items-center justify-center text-[10px] tracking-[0.15em] font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
        >
          VIEW HOLDINGS
        </Link>
      </motion.div>

      {/* Menu sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 + si * 0.05 }}
          className="mb-6"
        >
          <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-3 px-1">{section.title}</p>
          <div className="border border-white/8">
            {section.items.map((item, i) => {
              const Icon = item.icon;
              const content = (
                <div
                  className={`flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition-colors ${
                    i < section.items.length - 1 ? "border-b border-white/6" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} strokeWidth={1.5} className="text-white/30" />
                    <span className="text-[11px] tracking-[0.1em] text-white/60">{item.label}</span>
                  </div>
                  {item.value ? (
                    <span className="font-[var(--font-anton)] text-sm">
                      {item.value === "__BALANCE__" ? `\u20B9${Math.round(balance).toLocaleString("en-IN")}` : item.value}
                    </span>
                  ) : (
                    <ChevronRight size={14} className="text-white/20" />
                  )}
                </div>
              );

              return item.href ? (
                <Link key={item.label} href={item.href}>{content}</Link>
              ) : (
                <div key={item.label}>{content}</div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 border border-white/10 hover:bg-white/[0.03] transition-colors"
        >
          <LogOut size={14} className="text-white/40" />
          <span className="text-[11px] tracking-[0.15em] text-white/40">LOG OUT</span>
        </button>
      </motion.div>
    </div>
  );
}
