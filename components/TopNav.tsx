"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Search, Bell, BarChart3, Briefcase, LineChart, Eye, Newspaper, TrendingUp, LayoutDashboard, Calendar, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import SearchModal from "./SearchModal";
import { useAuth } from "@/lib/AuthContext";
import { useAdmin } from "@/lib/AdminContext";

/* Desktop tabs by role */
const userDesktopTabs = [
  { href: "/", label: "EXPLORE", icon: BarChart3 },
  { href: "/holdings", label: "HOLDINGS", icon: Briefcase },
  { href: "/positions", label: "POSITIONS", icon: LineChart },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
  { href: "/news", label: "NEWS", icon: Newspaper },
  { href: "/watchlist", label: "WATCHLIST", icon: Eye },
];

const companyAdminDesktopTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/admin/news", label: "NEWS", icon: Newspaper },
  { href: "/admin/events", label: "EVENTS", icon: Calendar },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
];

const totalAdminDesktopTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/admin/news", label: "APPROVALS", icon: ClipboardCheck },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
  { href: "/news", label: "NEWS", icon: Newspaper },
];

/* Mobile bottom tabs by role */
const userMobileTabs = [
  { href: "/", label: "EXPLORE", icon: BarChart3 },
  { href: "/holdings", label: "HOLDINGS", icon: Briefcase },
  { href: "/positions", label: "POSITIONS", icon: LineChart },
  { href: "/news", label: "NEWS", icon: Newspaper },
  { href: "/watchlist", label: "WATCHLIST", icon: Eye },
];

const companyAdminMobileTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/admin/news", label: "NEWS", icon: Newspaper },
  { href: "/admin/events", label: "EVENTS", icon: Calendar },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
];

const totalAdminMobileTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/admin/news", label: "APPROVALS", icon: ClipboardCheck },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
  { href: "/news", label: "NEWS", icon: Newspaper },
];

export default function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isLoggedIn, userName, role } = useAuth();
  const { marketOpen } = useAdmin();

  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2) : "M";

  const desktopTabs = role === "company" ? companyAdminDesktopTabs : role === "admin" ? totalAdminDesktopTabs : userDesktopTabs;
  const mobileTabs = role === "company" ? companyAdminMobileTabs : role === "admin" ? totalAdminMobileTabs : userMobileTabs;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop + Mobile Top Nav */}
      <nav className="relative z-10 bg-bg/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-14 px-4 md:px-12">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/Layer 11.png"
              alt="MCSE"
              width={32}
              height={32}
              className="w-8 h-8 object-contain logo-img"
              priority
            />
            <span className="font-[var(--font-anton)] text-[13px] tracking-[0.18em] uppercase hidden sm:block">
              MCSE
            </span>
          </Link>

          {/* Center: Desktop Tabs */}
          <div className="hidden md:flex items-center gap-8">
            {desktopTabs.map((tab) => {
              const active = isActive(tab.href);
              return (
                <Link
                  key={tab.label}
                  href={tab.href}
                  className={`relative text-[11px] tracking-[0.2em] font-light py-4 transition-all duration-200 ${
                    active ? "text-white" : "text-white/50 hover:text-white"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[1px] bg-white"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-8 px-3 border border-white/20 hover:border-white/60 transition-colors duration-200"
            >
              <Search size={14} strokeWidth={1.5} />
              <span className="hidden sm:block text-[10px] tracking-[0.1em] text-white/30">
                Search stocks, news, events… <span className="text-white/15">⌘K</span>
              </span>
            </motion.button>

            <div className="relative">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors duration-200 relative"
              >
                <Bell size={14} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white" />
              </motion.button>
              <AnimatePresence>
                {notifOpen && <NotificationDropdown onClose={() => setNotifOpen(false)} />}
              </AnimatePresence>
            </div>

            <div className="relative">
              {isLoggedIn ? (
                <>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="w-8 h-8 border border-white flex items-center justify-center text-[10px] font-[var(--font-anton)] tracking-wider hover:bg-white hover:text-black transition-all duration-200"
                  >
                    {initials}
                  </motion.button>
                  <AnimatePresence>
                    {profileOpen && <ProfileDropdown onClose={() => setProfileOpen(false)} />}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  href="/login"
                  className="h-8 px-4 bg-white text-black flex items-center justify-center text-[10px] tracking-[0.12em] font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-200"
                >
                  LOG IN
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Market status banner */}
        <div className="flex items-center justify-between h-7 px-4 md:px-12 max-w-[1280px] mx-auto border-t border-white/6">
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-[#00D26A]" : "bg-[#FF5252]"}`} />
            <span className={`text-[9px] tracking-[0.15em] font-medium ${marketOpen ? "text-[#00D26A]" : "text-[#FF5252]"}`}>
              MARKET {marketOpen ? "OPEN" : "CLOSED"}
            </span>
          </div>
          <span className="text-[9px] tracking-[0.1em] text-white/20">
            MON–FRI · 9:15 AM – 3:30 PM
          </span>
        </div>
      </nav>

      {/* Mobile bottom tab bar — 4 tabs, 56px tall */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg/95 backdrop-blur-md border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14 px-2">
          {mobileTabs.map((tab) => {
            const active = isActive(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-1.5 transition-all duration-200 ${
                  active ? "text-white" : "text-white/35"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[7px] tracking-[0.08em] uppercase">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
