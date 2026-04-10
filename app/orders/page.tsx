"use client";

import { motion } from "framer-motion";
import { PageWrap, FadeIn } from "@/components/Motion";
import Link from "next/link";

export default function OrdersPage() {
  return (
    <PageWrap>
      <div className="px-4 md:px-6 pb-20 md:pb-12">
        <FadeIn>
          <div className="flex flex-col items-center justify-center py-24 md:py-32 px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-16 h-16 md:w-20 md:h-20 border border-white/15 flex items-center justify-center mb-5 md:mb-6 relative"
            >
              <div className="w-8 md:w-10 h-[1px] bg-white" />
              <div className="absolute w-[1px] h-8 md:h-10 bg-white" />
              <div className="absolute w-3 md:w-4 h-3 md:h-4 border border-white bottom-1.5 md:bottom-2 left-1.5 md:left-2" />
            </motion.div>

            <h1 className="font-[var(--font-anton)] text-2xl md:text-3xl tracking-[0.1em] uppercase mb-2">
              NO OPEN ORDERS
            </h1>
            <p className="text-[10px] md:text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-5 md:mb-6">
              You have no pending or open orders. Place a buy or sell order to see it here.
            </p>

            <Link
              href="/"
              className="text-[10px] tracking-[0.15em] text-white/40 hover:text-white transition-colors duration-200 border-b border-white/20 pb-0.5"
            >
              EXPLORE STOCKS â†’
            </Link>
          </div>
        </FadeIn>
      </div>
    </PageWrap>
  );
}
