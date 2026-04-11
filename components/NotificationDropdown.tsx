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
    if (type === "gain") return <TrendingUp size={12} className="text-[#00D26A]" />;
    if (type === "loss") return <TrendingDown size={12} className="text-[#FF5252]" />;
    return <Info size={12} className="text-white/40" />;
  };

  const borderColor = (type: string) => {
    if (type === "gain") return "border-l-[#00D26A]";
    if (type === "loss") return "border-l-[#FF5252]";
    return "border-l-white/15";
  };

  const categoryColor = (cat: NotifCategory) => {
    if (cat === "PRICE ALERT") return "text-amber-400/70 border-amber-400/20";
    if (cat === "VOLUME") return "text-blue-400/70 border-blue-400/20";
    return "text-white/30 border-white/10";
  };

  const categoryIcon = (cat: NotifCategory) => {
    if (cat === "VOLUME") return <Activity size={8} className="mr-0.5" />;
    return null;
  };

  const renderNotification = (n: Notification, i: number) => {
    const inner = (
      <motion.div
        initial={{ opacity: 0, x: -6 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.03 * i, duration: 0.18 }}
        className={`flex items-start gap-3 pl-4 pr-5 py-3 hover:bg-white/[0.03] transition-colors border-l-2 ${borderColor(n.type)} relative`}
      >
        {!n.read && (
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-white/60" />
        )}
        <div className="mt-0.5 shrink-0">{iconFor(n.type)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center text-[7px] tracking-[0.15em] font-medium px-1.5 py-0.5 border ${categoryColor(n.category)}`}>
              {categoryIcon(n.category)}{n.category}
            </span>
          </div>
          <p className={`text-[11px] leading-relaxed ${n.read ? "text-white/35" : "text-white/70"}`}>{n.text}</p>
          <p className="text-[9px] text-white/20 mt-1">{n.time}</p>
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
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute right-0 top-10 w-[340px] bg-bg border border-white/15 z-50 max-h-[28rem] flex flex-col"
    >
      <div className="px-5 py-3 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">NOTIFICATIONS</span>
            {unreadCount > 0 && (
              <span className="text-[8px] tracking-[0.1em] bg-white text-black font-semibold px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-[8px] tracking-[0.1em] text-white/25 hover:text-white/60 transition-colors"
            title="Mark all as read"
          >
            <CheckCheck size={10} />
            <span>READ ALL</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {todayNotifs.length > 0 && (
          <>
            <div className="px-5 pt-3 pb-1.5">
              <span className="text-[8px] tracking-[0.2em] text-white/20">TODAY</span>
            </div>
            {todayNotifs.map((n, i) => renderNotification(n, i))}
          </>
        )}
        {earlierNotifs.length > 0 && (
          <>
            <div className="px-5 pt-4 pb-1.5 border-t border-white/6">
              <span className="text-[8px] tracking-[0.2em] text-white/20">EARLIER</span>
            </div>
            {earlierNotifs.map((n, i) => renderNotification(n, i + todayNotifs.length))}
          </>
        )}
      </div>
    </motion.div>
  );
}
