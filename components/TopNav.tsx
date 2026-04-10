"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, BarChart3, Briefcase, LineChart, ClipboardList, Eye, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import SearchModal from "./SearchModal";
import { useAuth } from "@/lib/AuthContext";

const tabs = [
  { href: "/", label: "EXPLORE", icon: BarChart3 },
  { href: "/holdings", label: "HOLDINGS", icon: Briefcase },
  { href: "/positions", label: "POSITIONS", icon: LineChart },
  { href: "/orders", label: "ORDERS", icon: ClipboardList },
  { href: "/watchlist", label: "WATCHLIST", icon: Eye },
];

export default function TopNav() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isLoggedIn, logout } = useAuth();

  // Ctrl+K global shortcut
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

  return (
    <>
      {/* Desktop + Mobile Top Nav */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between h-14 px-4 md:px-6">
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
            {tabs.map((tab) => {
              const active =
                tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href);
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
            {/* Search */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 h-8 px-3 border border-white/20 hover:border-white/60 transition-colors duration-200"
            >
              <Search size={14} strokeWidth={1.5} />
              <span className="hidden sm:block text-[10px] tracking-[0.1em] text-white/30">Ctrl+K</span>
            </motion.button>

            {/* Notification bell */}
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
                {notifOpen && (
                  <NotificationDropdown onClose={() => setNotifOpen(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* Avatar / Profile */}
            <div className="relative hidden md:block">
              {isLoggedIn ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="w-8 h-8 border border-white flex items-center justify-center text-[10px] font-monument tracking-wider hover:bg-white hover:text-black transition-all duration-200"
                  >
                    DA
                  </motion.button>
                  <AnimatePresence>
                    {profileOpen && (
                      <ProfileDropdown onClose={() => setProfileOpen(false)} />
                    )}
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

            {/* Mobile hamburger */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </motion.button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10">
        <div className="flex items-center justify-around h-14 px-2">
          {tabs.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                href={tab.href}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-3 transition-all duration-200 ${
                  active ? "text-white" : "text-white/35"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[8px] tracking-[0.1em] uppercase">
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-[#0a0a0a] border-l border-white/10 z-50 md:hidden flex flex-col"
            >
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-10 h-10 border border-white flex items-center justify-center">
                    <span className="font-monument text-xs font-extrabold">DA</span>
                  </div>
                  <div>
                    <p className="font-[var(--font-anton)] text-sm tracking-[0.08em]">DEEPAK AELENI</p>
                    <p className="text-[10px] text-white/40">aeleni@mcse.in</p>
                  </div>
                </div>
              </div>

              {/* Portfolio summary */}
              <div className="px-6 py-4 border-b border-white/10">
                <p className="text-[9px] tracking-[0.2em] text-white/30 mb-1">PORTFOLIO VALUE</p>
                <p className="font-[var(--font-anton)] text-xl tracking-tight">{"\u20B9"}4,87,693.69</p>
                <p className="text-[10px] text-[#00D26A] mt-0.5">+{"\u20B9"}2,847.30 (+0.59%) today</p>
              </div>

              <div className="flex-1 p-4 space-y-1">
                {[
                  { label: "MY PROFILE", href: "/profile" },
                  { label: "ALL ORDERS", href: "/orders" },
                  { label: "HOLDINGS", href: "/holdings" },
                  { label: "WATCHLIST", href: "/watchlist" },
                  { label: "POSITIONS", href: "/positions" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-left px-3 py-3 text-[11px] tracking-[0.12em] text-white/50 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-between px-3 py-2 mb-2">
                  <span className="text-[10px] tracking-[0.1em] text-white/40">BALANCE</span>
                  <span className="font-[var(--font-anton)] text-sm">{"\u20B9"}693.69</span>
                </div>
                {isLoggedIn ? (
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-3 text-[10px] tracking-[0.15em] text-white/40 hover:text-white transition-colors"
                  >
                    LOG OUT
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full block text-left px-3 py-3 text-[10px] tracking-[0.15em] text-white/60 hover:text-white transition-colors"
                  >
                    LOG IN
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Global Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
