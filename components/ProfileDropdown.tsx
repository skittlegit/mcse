"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, LogOut, Shield, Settings, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useTrading } from "@/lib/TradingContext";

export default function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { logout, userName, userEmail, role } = useAuth();
  const { balance } = useTrading();
  const router = useRouter();

  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2) : "?";

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
      className="absolute right-0 top-10 w-80 bg-[#0a0a0a] border border-white/15 z-50"
    >
      {/* User header with avatar */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 border border-white/40 flex items-center justify-center shrink-0">
            <span className="font-monument text-[10px] font-extrabold tracking-wider">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-[var(--font-anton)] text-sm tracking-[0.1em] truncate">
                {userName}
              </p>
              {role && role !== "user" && (
                <span className="text-[7px] tracking-[0.1em] px-1.5 py-0.5 border border-white/20 text-white/50 uppercase shrink-0">
                  {role === "companyAdmin" ? "CO. ADMIN" : "ADMIN"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/40 mt-0.5 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Balance display */}
      <div className="px-5 py-3 border-b border-white/10">
        <span className="text-[9px] tracking-[0.15em] text-white/30">BALANCE</span>
        <p className="font-[var(--font-anton)] text-sm tracking-[0.05em] mt-0.5">
          {"\u20B9"}{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Admin dashboard link */}
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

      {/* Menu items */}
      <div className="border-b border-white/10">
        <Link href="/preferences" onClick={onClose}>
          <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors duration-150">
            <Settings size={12} className="text-white/40" />
            <span className="text-[11px] tracking-[0.1em] text-white/50">PREFERENCES</span>
            <ChevronRight size={12} className="text-white/20 ml-auto" />
          </div>
        </Link>
        <Link href="/support" onClick={onClose}>
          <div className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors duration-150">
            <HelpCircle size={12} className="text-white/40" />
            <span className="text-[11px] tracking-[0.1em] text-white/50">CUSTOMER SUPPORT</span>
            <ChevronRight size={12} className="text-white/20 ml-auto" />
          </div>
        </Link>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white/5 transition-colors duration-150"
      >
        <LogOut size={12} className="text-white/50" />
        <span className="text-[10px] tracking-[0.15em] text-white/50">LOG OUT</span>
      </button>
    </motion.div>
  );
}
