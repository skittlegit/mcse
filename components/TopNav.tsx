"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Bell, BarChart3, Briefcase, LineChart, ClipboardList, Eye, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProfileDropdown from "./ProfileDropdown";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <AnimatePresence>
              {searchOpen ? (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                  placeholder="Search stocks..."
                  autoFocus
                  className="h-8 bg-transparent border border-white/40 px-3 text-[11px] tracking-[0.08em] text-white placeholder:text-white/30 outline-none focus:border-white transition-colors"
                />
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchOpen(true)}
                  className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors duration-200"
                >
                  <Search size={14} strokeWidth={1.5} />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Notification bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 border border-white/20 flex items-center justify-center hover:border-white/60 transition-colors duration-200 relative"
            >
              <Bell size={14} strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-white" />
            </motion.button>

            {/* Avatar / Profile */}
            <div className="relative hidden md:block">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-8 h-8 border border-white flex items-center justify-center text-[10px] font-monument tracking-wider hover:bg-white hover:text-black transition-all duration-200"
              >
                AJ
              </motion.button>
              <AnimatePresence>
                {profileOpen && (
                  <ProfileDropdown onClose={() => setProfileOpen(false)} />
                )}
              </AnimatePresence>
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
                className={`flex flex-col items-center gap-1 py-1 px-2 transition-all duration-200 ${
                  active ? "text-white" : "text-white/35"
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[8px] tracking-[0.12em] uppercase">
                  {tab.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="mobile-tab-dot"
                    className="w-1 h-1 bg-white absolute -top-0.5"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 border border-white flex items-center justify-center">
                    <span className="font-monument text-xs font-extrabold">AJ</span>
                  </div>
                  <div>
                    <p className="font-[var(--font-anton)] text-sm tracking-[0.08em]">AELENI JAMES</p>
                    <p className="text-[10px] text-white/40">aeleni@mcse.in</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4 space-y-1">
                {["ALL ORDERS", "BANK DETAILS", "REPORTS", "CUSTOMER SUPPORT"].map(
                  (item) => (
                    <button
                      key={item}
                      className="w-full text-left px-3 py-3 text-[11px] tracking-[0.12em] text-white/50 hover:text-white hover:bg-white/5 transition-all"
                    >
                      {item}
                    </button>
                  )
                )}
              </div>
              <div className="p-4 border-t border-white/10">
                <button className="w-full text-left px-3 py-3 text-[10px] tracking-[0.15em] text-white/40 hover:text-white transition-colors">
                  LOG OUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
