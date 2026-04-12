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

  const menuItems = [
    ...(role === "company" || role === "admin"
      ? [{ icon: Shield, label: role === "admin" ? "ADMIN DASHBOARD" : "COMPANY DASHBOARD", href: "/admin" }]
      : []),
    { icon: Settings, label: "PREFERENCES", href: "/preferences" },
    { icon: HelpCircle, label: "SUPPORT", href: "/support" },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-[300px] bg-bg border border-white/15 z-50"
    >
      {/* User Identity */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border border-white/30 flex items-center justify-center shrink-0">
            <span className="font-[var(--font-anton)] text-[11px] tracking-wider">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-[var(--font-anton)] text-sm tracking-[0.08em] truncate">{userName}</p>
              {role && role !== "user" && (
                <span className="text-[7px] tracking-[0.1em] px-1.5 py-0.5 border border-white/15 text-white/40 uppercase shrink-0">
                  {role === "company" ? "CO." : "ADMIN"}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/30 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
        <span className="text-[9px] tracking-[0.15em] text-white/25">BALANCE</span>
        <span className="font-[var(--font-anton)] text-sm tracking-[0.03em]">
          {"\u20B9"}{balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Menu */}
      <div className="py-1">
        {menuItems.map((item) => (
          <Link key={item.label} href={item.href} onClick={onClose}>
            <div className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-white/[0.04] transition-colors duration-300">
              <item.icon size={13} className="text-white/30 shrink-0" />
              <span className="text-[11px] tracking-[0.08em] text-white/45 flex-1">{item.label}</span>
              <ChevronRight size={11} className="text-white/15" />
            </div>
          </Link>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#FF5252]/[0.06] transition-colors duration-300 group"
        >
          <LogOut size={13} className="text-white/30 group-hover:text-[#FF5252]/60 transition-colors duration-300" />
          <span className="text-[10px] tracking-[0.12em] text-white/40 group-hover:text-[#FF5252]/70 transition-colors duration-300">LOG OUT</span>
        </button>
      </div>
    </motion.div>
  );
}
