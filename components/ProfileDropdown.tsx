"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, LogOut, Shield } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userProfile } from "@/lib/mockData";
import { useAuth } from "@/lib/AuthContext";

const menuItems = [
  { label: "BALANCE", value: `\u20B9${userProfile.balance.toFixed(2)}`, href: "" },
  { label: "MY PROFILE", href: "/profile" },
  { label: "ALL ORDERS", href: "/orders" },
  { label: "CUSTOMER SUPPORT", href: "/profile" },
  { label: "REPORTS", href: "/holdings" },
];

export default function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { logout, userName, userEmail, role } = useAuth();
  const router = useRouter();

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
              {item.value ? (
                <span className="text-[12px] font-[var(--font-anton)] text-white">{item.value}</span>
              ) : (
                <ChevronRight size={12} className="text-white/20" />
              )}
            </motion.div>
          );

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
