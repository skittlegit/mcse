"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const role = login(email, password);
    if (role) {
      router.push(role === "companyAdmin" || role === "totalAdmin" ? "/admin" : "/");
    } else {
      setError("Invalid email or password");
    }
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
              className="w-full h-12 bg-transparent border border-white/20 px-4 text-[16px] tracking-[0.08em] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors duration-150"
            />
          </div>

          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={"\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                className="w-full h-12 bg-transparent border border-white/20 px-4 pr-12 text-[16px] tracking-[0.08em] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors duration-150"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[11px] tracking-[0.08em] text-[#FF5252] mt-1">{error}</p>
          )}

          <button
            type="submit"
            className="w-full h-12 bg-white text-black text-[11px] tracking-[0.2em] font-semibold uppercase mt-2 hover:bg-transparent hover:text-white border border-white transition-all duration-200"
          >
            LOG IN
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] tracking-[0.1em] text-white/30 mb-3">DON&apos;T HAVE AN ACCOUNT?</p>
          <a
            href="#"
            className="inline-block w-full h-11 leading-[2.75rem] border border-white/20 text-[10px] tracking-[0.2em] text-white/50 font-semibold uppercase hover:border-white hover:text-white transition-all duration-200"
          >
            REGISTER
          </a>
        </div>

        <p className="text-[10px] tracking-[0.1em] text-white/20 text-center mt-6">
          MATH CLUB STOCK EXCHANGE
        </p>
      </motion.div>
    </div>
  );
}
