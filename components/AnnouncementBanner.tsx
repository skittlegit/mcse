"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, ChevronLeft, ChevronRight } from "lucide-react";
import { getAnnouncements, type Announcement } from "@/lib/api";

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    async function fetchAnnouncements() {
      const res = await getAnnouncements();
      if (res.data) {
        // Filter to only show HIGH priority or recent announcements
        const filtered = res.data.filter(
          (a) => a.priority === "HIGH" || Date.now() - a.timestamp < 86400000 * 2
        );
        setAnnouncements(filtered);
      }
    }
    fetchAnnouncements();
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 6000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [announcements.length, isPaused]);

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  if (dismissed || announcements.length === 0) return null;

  const current = announcements[currentIndex];
  const isHigh = current.priority === "HIGH";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className={`relative overflow-hidden ${
          isHigh
            ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-500/20"
            : "bg-white/[0.02] border-b border-white/8"
        }`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-2.5 flex items-center gap-3">
          {/* Icon */}
          <Megaphone
            size={14}
            className={isHigh ? "text-amber-400/70 shrink-0" : "text-white/30 shrink-0"}
          />

          {/* Navigation (if multiple) */}
          {announcements.length > 1 && (
            <button
              onClick={goPrev}
              className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0"
            >
              <ChevronLeft size={14} />
            </button>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`text-[11px] font-medium ${
                    isHigh ? "text-amber-400" : "text-white/60"
                  }`}
                >
                  {current.title}
                </span>
                <span className="text-[10px] text-white/30 hidden sm:inline truncate">
                  {current.content}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation (if multiple) */}
          {announcements.length > 1 && (
            <>
              <button
                onClick={goNext}
                className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0"
              >
                <ChevronRight size={14} />
              </button>
              <span className="text-[9px] text-white/20 shrink-0">
                {currentIndex + 1}/{announcements.length}
              </span>
            </>
          )}

          {/* Dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="w-6 h-6 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors shrink-0"
          >
            <X size={12} />
          </button>
        </div>

        {/* Progress bar (if multiple) */}
        {announcements.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
            <motion.div
              key={currentIndex}
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? `${(currentIndex / announcements.length) * 100}%` : "100%" }}
              transition={{ duration: isPaused ? 0 : 6, ease: "linear" }}
              className={isHigh ? "h-full bg-amber-400/30" : "h-full bg-white/20"}
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
