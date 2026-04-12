"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { TrendingUp, TrendingDown, Info, Activity, CheckCheck } from "lucide-react";

type NotifCategory = "PRICE ALERT" | "VOLUME" | "INFO";

interface Notification {
  type: "gain" | "loss" | "info";
  category: NotifCategory;
  ticker: string;
  text: string;
  time: string;
  group: "TODAY" | "EARLIER";
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { type: "gain", category: "PRICE ALERT", ticker: "CELESTE", text: "CELESTE is up +1.79% today", time: "2m ago", group: "TODAY", read: false },
  { type: "loss", category: "PRICE ALERT", ticker: "ERUDITE", text: "ERUDITE dropped -0.78%", time: "5m ago", group: "TODAY", read: false },
  { type: "info", category: "INFO", ticker: "MATHSOC", text: "MATHSOC crossed \u20B92,890 resistance", time: "8m ago", group: "TODAY", read: true },
  { type: "gain", category: "VOLUME", ticker: "GASMONKEYS", text: "GASMONKEYS volume spike detected", time: "12m ago", group: "TODAY", read: false },
  { type: "info", category: "INFO", ticker: "", text: "Market hours: 9:15 AM \u2013 3:30 PM", time: "1h ago", group: "EARLIER", read: true },
  { type: "loss", category: "PRICE ALERT", ticker: "ERUDITE", text: "ERUDITE hit 52-week low at \u20B9472", time: "Yesterday", group: "EARLIER", read: true },
];

export default function NotificationDropdown({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayNotifs = notifications.filter((n) => n.group === "TODAY");
  const earlierNotifs = notifications.filter((n) => n.group === "EARLIER");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const iconFor = (type: string) => {
    if (type === "gain") return <TrendingUp size={13} className="text-[#00D26A]" />;
    if (type === "loss") return <TrendingDown size={13} className="text-[#FF5252]" />;
    return <Info size={13} className="text-white/30" />;
  };

  const renderNotification = (n: Notification, i: number) => {
    const inner = (
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.02 * i, duration: 0.15 }}
        className={`flex items-start gap-3.5 px-5 py-3.5 hover:bg-white/[0.03] transition-colors duration-300 ${!n.read ? "bg-white/[0.02]" : ""}`}
      >
        <div className="mt-0.5 shrink-0 w-5 flex justify-center">{iconFor(n.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {n.ticker && (
              <span className="font-[var(--font-anton)] text-[11px] tracking-[0.05em]">{n.ticker}</span>
            )}
            <span className="flex items-center text-[7px] tracking-[0.12em] text-white/25 font-medium">
              {n.category === "VOLUME" && <Activity size={7} className="mr-0.5" />}
              {n.category}
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${n.read ? "text-white/30" : "text-white/60"}`}>{n.text}</p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1.5 pt-0.5">
          <span className="text-[9px] text-white/20">{n.time}</span>
          {!n.read && <span className="w-1.5 h-1.5 bg-white/50" />}
        </div>
      </motion.div>
    );

    return n.ticker ? (
      <Link key={i} href={`/stock/${n.ticker}`} onClick={onClose}>
        {inner}
      </Link>
    ) : (
      <div key={i}>{inner}</div>
    );
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-[380px] bg-bg border border-white/15 z-50 max-h-[28rem] flex flex-col"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] text-white/40">ALERTS</span>
          {unreadCount > 0 && (
            <span className="text-[8px] tracking-[0.08em] bg-white/10 text-white/60 font-medium px-2 py-0.5">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button
          onClick={markAllRead}
          className="flex items-center gap-1.5 text-[8px] tracking-[0.1em] text-white/20 hover:text-white/50 transition-colors duration-300"
        >
          <CheckCheck size={10} />
          MARK READ
        </button>
      </div>

      {/* Notification list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {todayNotifs.length > 0 && (
          <>
            <div className="sticky top-0 bg-bg/95 backdrop-blur-sm px-5 py-2 border-b border-white/6">
              <span className="text-[8px] tracking-[0.2em] text-white/15">TODAY</span>
            </div>
            <div className="divide-y divide-white/6">
              {todayNotifs.map((n, i) => renderNotification(n, i))}
            </div>
          </>
        )}
        {earlierNotifs.length > 0 && (
          <>
            <div className="sticky top-0 bg-bg/95 backdrop-blur-sm px-5 py-2 border-b border-white/6">
              <span className="text-[8px] tracking-[0.2em] text-white/15">EARLIER</span>
            </div>
            <div className="divide-y divide-white/6">
              {earlierNotifs.map((n, i) => renderNotification(n, i + todayNotifs.length))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
