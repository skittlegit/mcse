"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

interface CalendarEvent {
  day: number;
  month: number; // 0-indexed
  year: number;
  title: string;
  type: "AGM" | "RESULTS" | "EVENT";
  ticker: string;
  impact: string;
}

const events: CalendarEvent[] = [
  { day: 15, month: 5, year: 2026, title: "MATHSOC ANNUAL MEET", type: "AGM", ticker: "MATHSOC", impact: "Board elections & budget approval" },
  { day: 18, month: 5, year: 2026, title: "ENIGMA Quarterly Results", type: "RESULTS", ticker: "ENIGMA", impact: "Revenue up 12% expected" },
  { day: 22, month: 5, year: 2026, title: "GASMONKEYS Racing Event", type: "EVENT", ticker: "GASMONKEYS", impact: "National-level showcasing" },
  { day: 25, month: 5, year: 2026, title: "CELESTE Star Gazing Night", type: "EVENT", ticker: "CELESTE", impact: "Public engagement drive" },
  { day: 28, month: 5, year: 2026, title: "MASTERSHOT Film Premiere", type: "EVENT", ticker: "MASTERSHOT", impact: "Festival circuit entry" },
  { day: 2, month: 6, year: 2026, title: "ERUDITE Quiz Championship", type: "EVENT", ticker: "ERUDITE", impact: "National media coverage" },
  { day: 10, month: 6, year: 2026, title: "INSIGHT Research Symposium", type: "EVENT", ticker: "INSIGHT", impact: "Industry partnerships" },
];

const typeColors: Record<string, string> = {
  AGM: "bg-white/10 text-white/50",
  RESULTS: "bg-[#00D26A]/10 text-[#00D26A]",
  EVENT: "bg-white/5 text-white/40",
};

const typeDot: Record<string, string> = {
  AGM: "bg-white/50",
  RESULTS: "bg-[#00D26A]",
  EVENT: "bg-white/20",
};

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const DAY_NAMES = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function EventsPage() {
  const router = useRouter();
  const [viewMonth, setViewMonth] = useState(5); // June
  const [viewYear, setViewYear] = useState(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const eventsThisMonth = useMemo(
    () => events.filter((e) => e.month === viewMonth && e.year === viewYear),
    [viewMonth, viewYear]
  );

  const eventDays = useMemo(
    () => new Map(eventsThisMonth.map((e) => [e.day, e])),
    [eventsThisMonth]
  );

  const selectedEvents = selectedDay
    ? events.filter((e) => e.day === selectedDay && e.month === viewMonth && e.year === viewYear)
    : eventsThisMonth;

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  }

  return (
    <div className="py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-white transition-colors"><ArrowLeft size={15} /></button>
        <h1 className="font-[var(--font-anton)] text-xl tracking-[0.1em] uppercase">EVENTS CALENDAR</h1>
      </div>

      {/* Desktop 2-column grid */}
      <div className="md:grid md:grid-cols-[13fr_7fr] md:gap-8">
        {/* Left: Calendar */}
        <div>

      {/* Month nav */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors">
          <ChevronLeft size={14} className="text-white/40" />
        </button>
        <p className="font-[var(--font-anton)] text-lg tracking-[0.15em]">{MONTH_NAMES[viewMonth]} {viewYear}</p>
        <button onClick={nextMonth} className="w-8 h-8 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors">
          <ChevronRight size={14} className="text-white/40" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-white/8 mb-6">
        <div className="grid grid-cols-7">
          {DAY_NAMES.map((d) => (
            <div key={d} className="text-center py-2 text-[8px] tracking-[0.2em] text-white/20 border-b border-white/6">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-b border-r border-white/4" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const ev = eventDays.get(day);
            const isSelected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(isSelected ? null : (ev ? day : null))}
                className={`aspect-square border-b border-r border-white/4 flex flex-col items-center justify-center gap-1 transition-colors relative ${
                  isSelected ? "bg-white/10" : ev ? "hover:bg-white/[0.04]" : ""
                }`}
              >
                <span className={`text-[11px] ${ev ? "text-white" : "text-white/20"}`}>{day}</span>
                {ev && <div className={`w-1 h-1 rounded-full ${typeDot[ev.type] || "bg-white/20"}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: Events list below calendar */}
      <div className="md:hidden mt-4">
        <p className="text-[9px] tracking-[0.2em] text-white/25 mb-3">
          {selectedDay ? `EVENTS ON ${MONTH_NAMES[viewMonth]} ${selectedDay}` : `ALL EVENTS · ${MONTH_NAMES[viewMonth]}`}
        </p>

        {selectedEvents.length === 0 && (
          <p className="text-[11px] text-white/20 py-8 text-center">No events this month</p>
        )}

        <div className="space-y-2">
          {selectedEvents.map((ev, i) => (
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
                <div className="w-12 text-center shrink-0">
                  <p className="text-[9px] tracking-[0.12em] text-white/25">{MONTH_NAMES[ev.month]}</p>
                  <p className="font-[var(--font-anton)] text-lg">{ev.day}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-anton)] text-[13px] tracking-[0.05em] mb-0.5">{ev.title}</p>
                  <p className="text-[10px] text-white/30">{ev.ticker} · {ev.impact}</p>
                </div>
                <span className={`text-[8px] tracking-[0.15em] px-2 py-1 shrink-0 ${typeColors[ev.type]}`}>
                  {ev.type}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
      </div>{/* end left column */}

      {/* Right sidebar (desktop): Events panel */}
      <aside className="hidden md:block space-y-6">
        <div className="border border-white/10 p-5">
          <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">
            {selectedDay ? `EVENTS ON ${MONTH_NAMES[viewMonth]} ${selectedDay}` : `ALL EVENTS · ${MONTH_NAMES[viewMonth]}`}
          </p>

          {selectedEvents.length === 0 && (
            <p className="text-[11px] text-white/20 py-6 text-center">No events this month</p>
          )}

          <div className="space-y-2">
            {selectedEvents.map((ev, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/stock/${ev.ticker}`}
                  className="flex items-center gap-3 border border-white/6 p-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="w-10 text-center shrink-0">
                    <p className="text-[8px] tracking-[0.12em] text-white/25">{MONTH_NAMES[ev.month]}</p>
                    <p className="font-[var(--font-anton)] text-base">{ev.day}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-[var(--font-anton)] text-[12px] tracking-[0.05em] mb-0.5">{ev.title}</p>
                    <p className="text-[9px] text-white/30">{ev.ticker} · {ev.impact}</p>
                  </div>
                  <span className={`text-[8px] tracking-[0.15em] px-2 py-1 shrink-0 ${typeColors[ev.type]}`}>
                    {ev.type}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Event type legend */}
        <div className="border border-white/10 p-5">
          <p className="text-[9px] tracking-[0.15em] text-white/30 mb-3">EVENT TYPES</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <span className="text-[10px] text-white/40">AGM — Annual General Meeting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00D26A]" />
              <span className="text-[10px] text-white/40">RESULTS — Quarterly/Annual Results</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white/20" />
              <span className="text-[10px] text-white/40">EVENT — Club Events &amp; Activities</span>
            </div>
          </div>
        </div>
      </aside>
      </div>{/* end grid */}
    </div>
  );
}
