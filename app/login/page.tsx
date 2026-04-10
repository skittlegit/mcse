"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    login();
    router.push("/");
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 border-2 border-white flex items-center justify-center">
            <span className="font-monument text-sm font-extrabold tracking-tight">M</span>
          </div>
          <span className="font-monument text-[13px] tracking-[0.2em] uppercase">MCSE</span>
        </div>

        <h1 className="font-[var(--font-anton)] text-3xl tracking-[0.08em] uppercase mb-2">
          WELCOME BACK
        </h1>
        <p className="text-[11px] tracking-[0.1em] text-white/40 mb-8">
          LOG IN TO ACCESS YOUR PORTFOLIO
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mcse.in"
              className="w-full h-12 bg-transparent border border-white/20 px-4 text-[12px] tracking-[0.08em] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors duration-150"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
              className="w-full h-12 bg-transparent border border-white/20 px-4 text-[12px] tracking-[0.08em] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors duration-150"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 bg-white text-black text-[11px] tracking-[0.2em] font-semibold uppercase mt-2 hover:bg-transparent hover:text-white border border-white transition-all duration-200"
          >
            LOG IN
          </button>
        </form>

        <p className="text-[10px] tracking-[0.1em] text-white/20 text-center mt-6">
          MCSE DEMO {"\u00B7"} NO REAL AUTHENTICATION
        </p>
      </motion.div>
    </div>
  );
}
