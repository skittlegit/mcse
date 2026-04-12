"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";
import { usePreferences, type Preferences } from "@/lib/PreferencesContext";

const preferenceItems: { key: keyof Pick<Preferences, "notifications" | "emailAlerts" | "darkMode" | "confirmOrders" | "showBalance">; label: string; description: string }[] = [
  { key: "notifications", label: "PUSH NOTIFICATIONS", description: "Receive alerts for order execution, price targets, and market updates" },
  { key: "emailAlerts", label: "EMAIL ALERTS", description: "Get daily portfolio summary and weekly market reports via email" },
  { key: "darkMode", label: "DARK MODE", description: "Toggle between dark and light theme" },
  { key: "confirmOrders", label: "CONFIRM BEFORE ORDER", description: "Show a confirmation dialog before placing buy/sell orders" },
  { key: "showBalance", label: "SHOW BALANCE ON HOME", description: "Display your available balance on the explore page" },
];

export default function PreferencesPage() {
  const { isLoggedIn } = useAuth();
  const prefs = usePreferences();

  if (!isLoggedIn) {
    return (
      <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
        <LoginPrompt message="Log in to manage your preferences." />
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/"
          className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
          PREFERENCES
        </h1>
      </motion.div>

      {/* Preference toggles */}
      <div className="border border-white/8">
        {preferenceItems.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.3 }}
            className={`flex items-center justify-between px-5 py-4 ${
              i < preferenceItems.length - 1 ? "border-b border-white/6" : ""
            }`}
          >
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-[11px] tracking-[0.1em] text-white/60 mb-0.5">{item.label}</p>
              <p className="text-[10px] text-white/25 leading-relaxed">{item.description}</p>
            </div>
            <button
              onClick={() => prefs.togglePref(item.key)}
              className={`w-11 h-6 border flex items-center shrink-0 transition-all duration-200 ${
                prefs[item.key]
                  ? "bg-white/10 border-white/30"
                  : "bg-transparent border-white/15"
              }`}
            >
              <div className={`w-4 h-4 transition-all duration-200 ${
                prefs[item.key]
                  ? "bg-white ml-[calc(100%-1.25rem)]"
                  : "bg-white/20 ml-0.5"
              }`} />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Account section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-8"
      >
        <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-3 px-1">ACCOUNT</p>
        <div className="border border-white/8">
          <div className="px-5 py-4 border-b border-white/6">
            <p className="text-[11px] tracking-[0.1em] text-white/60 mb-0.5">DEFAULT ORDER TYPE</p>
            <select
              value={prefs.defaultOrderType}
              onChange={(e) => prefs.setPref("defaultOrderType", e.target.value as "DELIVERY" | "INTRADAY")}
              className="mt-1 bg-transparent border border-white/15 text-[11px] text-white/50 px-3 py-1.5 outline-none appearance-none cursor-pointer" style={{ fontSize: '16px' }}
            >
              <option value="DELIVERY" className="bg-bg">DELIVERY</option>
              <option value="INTRADAY" className="bg-bg">INTRADAY</option>
            </select>
          </div>
          <div className="px-5 py-4">
            <p className="text-[11px] tracking-[0.1em] text-white/60 mb-0.5">DEFAULT QUANTITY</p>
            <select
              value={prefs.defaultQty}
              onChange={(e) => prefs.setPref("defaultQty", parseInt(e.target.value))}
              className="mt-1 bg-transparent border border-white/15 text-[11px] text-white/50 px-3 py-1.5 outline-none appearance-none cursor-pointer" style={{ fontSize: '16px' }}
            >
              <option value="1" className="bg-bg">1</option>
              <option value="5" className="bg-bg">5</option>
              <option value="10" className="bg-bg">10</option>
              <option value="25" className="bg-bg">25</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Auto-save note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 text-[9px] tracking-[0.15em] text-white/20 text-center"
      >
        CHANGES SAVED AUTOMATICALLY
      </motion.p>
    </div>
  );
}
