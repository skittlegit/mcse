"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronRight, LogOut, Shield, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";

const menuItems = [
  { label: "PROFILE", href: "/profile" },
  { label: "TRANSACTION HISTORY", href: "/transactions" },
  { label: "ADD FUNDS", href: "" },
];

export default function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { logout, userName, userEmail, role } = useAuth();
  const { balance, addFunds } = useTrading();
  const router = useRouter();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [fundAmount, setFundAmount] = useState("");

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  function handleLogout() {
    logout();
    onClose();
    router.push("/");
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-72 bg-[#0a0a0a] border border-white/15 z-50"
    >
      <Link
        href="/profile"
        onClick={onClose}
        className="block px-5 py-4 border-b border-white/10 hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center justify-between">
          <p className="font-[var(--font-anton)] text-sm tracking-[0.1em]">
            {userName}
          </p>
          {role && role !== "user" && (
            <span className="text-[8px] tracking-[0.1em] px-1.5 py-0.5 border border-white/20 text-white/50 uppercase">
              {role === "companyAdmin" ? "CO. ADMIN" : "ADMIN"}
            </span>
          )}
        </div>
        <p className="text-[11px] text-white/50 mt-0.5">{userEmail}</p>
      </Link>

      {(role === "companyAdmin" || role === "totalAdmin") && (
        <Link
          href="/admin"
          onClick={onClose}
          className="flex items-center gap-3 px-5 py-3 border-b border-white/10 hover:bg-white/5 transition-colors"
        >
          <Shield size={12} className="text-white/40" />
          <span className="text-[11px] tracking-[0.1em] text-white/50">
            {role === "totalAdmin" ? "ADMIN DASHBOARD" : "COMPANY DASHBOARD"}
          </span>
          <ChevronRight size={12} className="text-white/20 ml-auto" />
        </Link>
      )}

      {/* Balance display */}
      <div className="px-5 py-3 border-b border-white/10">
        <span className="text-[9px] tracking-[0.15em] text-white/30">BALANCE</span>
        <p className="font-[var(--font-anton)] text-sm tracking-[0.05em] mt-0.5">
          {"\u20B9"}{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div>
        {menuItems.map((item, i) => {
          const inner = (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.2 }}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors duration-150"
            >
              <span className="text-[11px] tracking-[0.1em] text-white/50">{item.label}</span>
              {item.label === "ADD FUNDS" ? (
                <Plus size={12} className="text-white/30" />
              ) : (
                <ChevronRight size={12} className="text-white/20" />
              )}
            </motion.div>
          );

          if (item.label === "ADD FUNDS") {
            return (
              <button key={item.label} className="w-full" onClick={() => setShowAddFunds(!showAddFunds)}>
                {inner}
                {showAddFunds && (
                  <div className="px-5 pb-3 flex gap-2">
                    <input
                      type="number"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      placeholder="Amount"
                      className="flex-1 bg-white/5 border border-white/10 px-3 py-1.5 text-xs text-white outline-none placeholder:text-white/20"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const amt = parseFloat(fundAmount);
                        if (amt > 0) {
                          addFunds(amt);
                          setFundAmount("");
                          setShowAddFunds(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-white text-black text-[10px] tracking-[0.1em] font-medium hover:bg-white/90 transition-colors"
                    >
                      ADD
                    </button>
                  </div>
                )}
              </button>
            );
          }

          return item.href ? (
            <Link key={item.label} href={item.href} onClick={onClose}>
              {inner}
            </Link>
          ) : (
            <div key={item.label}>{inner}</div>
          );
        })}
      </div>

      <div className="border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white/5 transition-colors duration-150"
        >
          <LogOut size={12} className="text-white/50" />
          <span className="text-[10px] tracking-[0.15em] text-white/50">LOG OUT</span>
        </button>
      </div>
    </motion.div>
  );
}
