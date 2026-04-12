"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPrompt({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-20 md:py-32"
    >
      <div className="w-16 h-16 border border-white/15 flex items-center justify-center mb-6">
        <LogIn size={24} strokeWidth={1.5} className="text-white/30" />
      </div>
      <h2 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.1em] uppercase mb-2">
        LOGIN REQUIRED
      </h2>
      <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
        {message}
      </p>
      <Link
        href="/login"
        className="px-8 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-300"
      >
        LOG IN
      </Link>
    </motion.div>
  );
}
