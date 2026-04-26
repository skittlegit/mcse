"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface WeekEvent {
  day: number;
  weekday: string;
  title: string;
  type: "AGM" | "RESULTS" | "EVENT";
  ticker: string;
  time: string;
  description: string;
}

const WEEK_DAYS = [
  { day: 24, weekday: "THU", label: "24" },
  { day: 25, weekday: "FRI", label: "25" },
  { day: 26, weekday: "SAT", label: "26" },
];

const events: WeekEvent[] = [
  { day: 24, weekday: "THU", title: "INDATA Annual General Meeting", type: "AGM", ticker: "INDATA", time: "10:00 AM", description: "Board elections and budget approval" },
  { day: 24, weekday: "THU", title: "ENAI Product Launch", type: "EVENT", ticker: "ENAI", time: "4:00 PM", description: "New ML toolkit release demo" },
  { day: 25, weekday: "FRI", title: "MPUB Book Fair", type: "EVENT", ticker: "MPUB", time: "11:00 AM", description: "Academic publications showcase" },
  { day: 25, weekday: "FRI", title: "ESOFT Quarterly Results", type: "RESULTS", ticker: "ESOFT", time: "2:00 PM", description: "Q4 revenue expected up 12%" },
  { day: 25, weekday: "FRI", title: "GMRACE Sprint Championship", type: "EVENT", ticker: "GMRACE", time: "4:00 PM", description: "National-level karting showcase" },
  { day: 26, weekday: "SAT", title: "CELBIO Lab Open House", type: "EVENT", ticker: "CELBIO", time: "9:00 AM", description: "Biotech lab demonstrations" },
  { day: 26, weekday: "SAT", title: "ERLEARN Quiz Finals", type: "EVENT", ticker: "ERLEARN", time: "11:00 AM", description: "Inter-college quiz championship" },
  { day: 26, weekday: "SAT", title: "MSSTD Film Premiere", type: "EVENT", ticker: "MSSTD", time: "6:30 PM", description: "Short film festival circuit entry" },
];

const typeAccent: Record<string, string> = {
  AGM: "border-l-white/50",
  RESULTS: "border-l-up",
  EVENT: "border-l-white/20",
};

const typeBadge: Record<string, string> = {
  AGM: "bg-white/10 text-white/50",
  RESULTS: "bg-up/10 text-up",
  EVENT: "bg-white/5 text-white/40",
};

export default function EventsPage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const filteredEvents = useMemo(
    () => selectedDay === null ? events : events.filter((e) => e.day === selectedDay),
    [selectedDay]
  );

  const eventCountByDay = useMemo(() => {
    const map = new Map<number, number>();
    events.forEach((e) => map.set(e.day, (map.get(e.day) || 0) + 1));
    return map;
  }, []);

  return (
    <div className="py-6 pb-24 md:pb-12">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => router.back()} aria-label="Go back" className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white active:bg-white/[0.04] transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">MCSE EVENTS</h1>
          <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">APRIL 24 &ndash; 26</p>
        </div>
      </div>

      {/* Day pill strip */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-4 mb-6">
        <button
          onClick={() => setSelectedDay(null)}
          className={`shrink-0 flex flex-col items-center px-4 py-2.5 border transition-all duration-200 ${
            selectedDay === null
              ? "border-white/50 bg-white/5 text-white"
              : "border-white/8 text-white/30 hover:border-white/20 hover:text-white/50"
          }`}
        >
          <span className="text-[8px] tracking-[0.2em]">ALL</span>
          <span className="font-[var(--font-anton)] text-sm mt-0.5">{events.length}</span>
        </button>
        {WEEK_DAYS.map((wd) => {
          const count = eventCountByDay.get(wd.day) || 0;
          const isSelected = selectedDay === wd.day;
          return (
            <button
              key={wd.day}
              onClick={() => setSelectedDay(isSelected ? null : wd.day)}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 border transition-all duration-200 ${
                isSelected
                  ? "border-white/50 bg-white/5 text-white"
                  : count > 0
                    ? "border-white/8 text-white/40 hover:border-white/20 hover:text-white/60"
                    : "border-white/4 text-white/15"
              }`}
            >
              <span className="text-[8px] tracking-[0.2em]">{wd.weekday}</span>
              <span className="font-[var(--font-anton)] text-sm mt-0.5">{wd.label}</span>
              {count > 0 && (
                <div className={`w-1 h-1 mt-1 ${isSelected ? "bg-white" : "bg-white/30"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Event cards */}
      <div className="max-w-2xl space-y-2">
        {filteredEvents.length === 0 && (
          <p className="text-[11px] text-white/20 py-12 text-center">No events on this day</p>
        )}
        {filteredEvents.map((ev, i) => (
          <motion.div
            key={`${ev.ticker}-${ev.day}-${i}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              href={`/stock/${ev.ticker}`}
              className={`flex items-center gap-4 border border-white/6 border-l-2 ${typeAccent[ev.type]} p-4 hover:bg-white/[0.03] transition-colors`}
            >
              <div className="w-12 text-center shrink-0">
                <p className="text-[8px] tracking-[0.15em] text-white/25">{ev.weekday}</p>
                <p className="font-[var(--font-anton)] text-lg">{ev.day}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em] mb-0.5">{ev.title}</p>
                <p className="text-[10px] text-white/30">{ev.ticker} &middot; {ev.time} &middot; {ev.description}</p>
              </div>
              <span className={`text-[8px] tracking-[0.15em] px-2 py-1 shrink-0 ${typeBadge[ev.type]}`}>{ev.type}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
