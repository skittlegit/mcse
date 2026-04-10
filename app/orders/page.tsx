"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import LoginPrompt from "@/components/LoginPrompt";
import { useAuth } from "@/lib/AuthContext";

export default function OrdersPage() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="pb-20 md:pb-12 px-5 md:px-6 py-6">
        <LoginPrompt message="Log in to view your order history and pending orders." />
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 md:py-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-20 md:py-32"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-18 h-18 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-6 relative"
        >
          <div className="w-8 md:w-10 h-[1px] bg-white" />
          <div className="absolute w-[1px] h-8 md:h-10 bg-white" />
          <div className="absolute w-3 md:w-4 h-3 md:h-4 border border-white bottom-1.5 md:bottom-2 left-1.5 md:left-2" />
        </motion.div>

        <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-3">
          NO OPEN ORDERS
        </h1>
        <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
          You have no pending or open orders. Place a buy or sell order to see it here.
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150"
          >
            EXPLORE STOCKS
          </Link>
          <Link
            href="/holdings"
            className="px-6 py-3 text-[10px] tracking-[0.15em] text-white/50 hover:text-white border border-white/20 hover:border-white transition-all duration-150"
          >
            VIEW HOLDINGS
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
