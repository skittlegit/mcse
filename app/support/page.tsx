"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "How do I place a buy/sell order?", a: "Navigate to any stock page and use the BUY or SELL buttons. On desktop, the order panel is on the right sidebar. On mobile, use the bottom action bar." },
  { q: "What are DELIVERY and INTRADAY orders?", a: "DELIVERY orders are settled in your demat account (T+1). INTRADAY orders must be squared off the same day — positions auto-close at market end." },
  { q: "How is my portfolio value calculated?", a: "Current Value = sum of (qty × last traded price) for each holding. Returns = Current Value − Invested Value." },
  { q: "How do I add funds to my account?", a: "Go to Profile → Available Balance. You can transfer funds from your linked bank account via UPI or net banking." },
  { q: "What happens if my order fails?", a: "If an order fails due to insufficient balance or market conditions, no amount is deducted. You'll see the order status as CANCELLED in your order history." },
];

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="pb-24 md:pb-12 px-5 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/"
          className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
          CUSTOMER SUPPORT
        </h1>
      </motion.div>

      {/* Contact options */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-white/8 mb-8"
      >
        <div className="bg-[#0a0a0a] p-5 flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
            <Mail size={16} className="text-white/40" />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] text-white/30 mb-1">EMAIL</p>
            <p className="text-[12px] text-white/70">support@mcse.in</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-5 flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
            <Phone size={16} className="text-white/40" />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] text-white/30 mb-1">PHONE</p>
            <p className="text-[12px] text-white/70">+91 80 0000 MCSE</p>
          </div>
        </div>
        <div className="bg-[#0a0a0a] p-5 flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-white/40" />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.2em] text-white/30 mb-1">LIVE CHAT</p>
            <p className="text-[12px] text-white/70">Mon–Sat, 9AM–6PM</p>
          </div>
        </div>
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="text-[9px] tracking-[0.2em] text-white/25 uppercase mb-4 px-1">FREQUENTLY ASKED QUESTIONS</p>
        <div className="border border-white/8">
          {faqs.map((faq, i) => (
            <div key={i} className={i < faqs.length - 1 ? "border-b border-white/6" : ""}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-[12px] text-white/70 pr-4">{faq.q}</span>
                {openFaq === i ? (
                  <ChevronUp size={14} className="text-white/30 shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-white/30 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="px-5 pb-4"
                >
                  <p className="text-[11px] text-white/40 leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Raise ticket */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-8 border border-white/10 p-5"
      >
        <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-3">NEED MORE HELP?</p>
        <p className="text-[11px] text-white/40 mb-4">
          If your question isn&apos;t answered above, raise a support ticket and our team will get back to you within 24 hours.
        </p>
        <button className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-150">
          RAISE A TICKET
        </button>
      </motion.div>
    </div>
  );
}
