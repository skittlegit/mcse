"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoadingScreen from "./LoadingScreen";
import TopNav from "./TopNav";
import TickerTape from "./TickerTape";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const handleDone = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen onDone={handleDone} />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative flex flex-col min-h-screen"
      >
        {/* Grain overlay */}
        <div
          className="fixed inset-0 z-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Abstract geometric accent */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M60 0 L60 30 M60 90 L60 120 M0 60 L30 60 M90 60 L120 60" stroke="white" strokeWidth="0.5" fill="none" />
                <circle cx="60" cy="60" r="3" fill="none" stroke="white" strokeWidth="0.5" />
                <circle cx="60" cy="30" r="1.5" fill="white" />
                <circle cx="60" cy="90" r="1.5" fill="white" />
                <circle cx="30" cy="60" r="1.5" fill="white" />
                <circle cx="90" cy="60" r="1.5" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" />
          </svg>
        </div>

        <TopNav />
        <TickerTape />
        <main className="flex-1 relative z-10 pb-10 md:pb-0">
          {children}
        </main>
      </motion.div>
    </>
  );
}
