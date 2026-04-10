"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, ArrowLeft } from "lucide-react";

const events = [
  { date: "Jun 15", title: "MATHSOC ANNUAL MEET", type: "AGM", ticker: "MATHSOC" },
  { date: "Jun 18", title: "ENIGMA Quarterly Results", type: "RESULTS", ticker: "ENIGMA" },
  { date: "Jun 22", title: "GASMONKEYS Racing Event", type: "EVENT", ticker: "GASMONKEYS" },
  { date: "Jun 25", title: "CELESTE Star Gazing Night", type: "EVENT", ticker: "CELESTE" },
  { date: "Jun 28", title: "MASTERSHOT Film Premiere", type: "EVENT", ticker: "MASTERSHOT" },
  { date: "Jul 02", title: "ERUDITE Quiz Championship", type: "EVENT", ticker: "ERUDITE" },
];

const typeColors: Record<string, string> = {
  AGM: "bg-white/10 text-white/50",
  RESULTS: "bg-[#00D26A]/10 text-[#00D26A]",
  EVENT: "bg-white/5 text-white/40",
};

export default function EventsPage() {
  return (
    <div className="pb-20 md:pb-12 px-5 md:px-6 py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors">
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-white/40" />
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">EVENTS CALENDAR</h1>
        </div>
      </div>

      <div className="space-y-2">
        {events.map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/stock/${ev.ticker}`}
              className="flex items-center gap-4 border border-white/6 p-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="w-14 text-center shrink-0">
                <p className="text-[9px] tracking-[0.12em] text-white/25 uppercase">{ev.date.split(" ")[0]}</p>
                <p className="font-[var(--font-anton)] text-lg">{ev.date.split(" ")[1]}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em] mb-0.5">{ev.title}</p>
                <p className="text-[10px] text-white/30">{ev.ticker}</p>
              </div>
              <span className={`text-[8px] tracking-[0.15em] px-2 py-1 ${typeColors[ev.type] || "bg-white/5 text-white/40"}`}>
                {ev.type}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
