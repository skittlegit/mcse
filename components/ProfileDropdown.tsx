"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { userProfile } from "@/lib/mockData";

const menuItems = [
  { label: "BALANCE", value: `₹${userProfile.balance.toFixed(2)}` },
  { label: "ALL ORDERS" },
  { label: "BANK DETAILS" },
  { label: "24×7 CUSTOMER SUPPORT" },
  { label: "REPORTS" },
];

export default function ProfileDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-72 bg-[#0a0a0a] border border-white/15 z-50"
    >
      <div className="px-5 py-4 border-b border-white/10">
        <p className="font-[var(--font-anton)] text-sm tracking-[0.1em]">
          {userProfile.name}
        </p>
        <p className="text-[11px] text-white/50 mt-0.5">{userProfile.email}</p>
      </div>

      <div>
        {menuItems.map((item, i) => (
          <motion.button
            key={item.label}
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
          </motion.button>
        ))}
      </div>

      <div className="border-t border-white/10">
        <button className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white/5 transition-colors duration-150">
          <LogOut size={12} className="text-white/50" />
          <span className="text-[10px] tracking-[0.15em] text-white/50">LOG OUT</span>
        </button>
      </div>
    </motion.div>
  );
}
