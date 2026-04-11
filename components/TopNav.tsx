"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, BarChart3, Briefcase, LineChart, Eye, Newspaper, TrendingUp, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import SearchModal from "./SearchModal";
import { useAuth } from "@/lib/AuthContext";

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
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
];

const totalAdminDesktopTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
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
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
];

const totalAdminMobileTabs = [
  { href: "/admin", label: "DASHBOARD", icon: LayoutDashboard },
  { href: "/markets", label: "MARKETS", icon: TrendingUp },
  { href: "/news", label: "NEWS", icon: Newspaper },
];

export default function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isLoggedIn, userName, role } = useAuth();

  const initials = userName ? userName.split(" ").map(w => w[0]).join("").slice(0, 2) : "M";

  const desktopTabs = role === "companyAdmin" ? companyAdminDesktopTabs : role === "totalAdmin" ? totalAdminDesktopTabs : userDesktopTabs;
  const mobileTabs = role === "companyAdmin" ? companyAdminMobileTabs : role === "totalAdmin" ? totalAdminMobileTabs : userMobileTabs;

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
    if (href === "/admin") return pathname.startsWith("/admin");
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop + Mobile Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-14 px-4 md:px-12">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 border border-white/80 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-200">
              <span className="font-monument text-[10px] font-extrabold tracking-tight">M</span>
            </div>
            <span className="font-monument text-[11px] tracking-[0.18em] uppercase hidden sm:block">
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="w-8 h-8 border border-white flex items-center justify-center text-[10px] font-monument tracking-wider hover:bg-white hover:text-black transition-all duration-200"
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
                  className="h-8 px-3 border border-white/40 flex items-center justify-center text-[10px] tracking-[0.12em] text-white/60 hover:text-white hover:border-white transition-all duration-200"
                >
                  LOG IN
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar — 4 tabs, 56px tall */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
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
