"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  PieChart,
  ArrowLeftRight,
  SlidersHorizontal,
  User,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/ThemeProvider";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/portfolio", icon: PieChart, label: "Portfolio" },
  { href: "/transfer", icon: ArrowLeftRight, label: "Transfer" },
  { href: "/markets", icon: BarChart3, label: "Markets" },
  { href: "/analytics", icon: SlidersHorizontal, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 h-full bg-surface border-r border-border z-40 transition-all duration-200 ${
        collapsed ? "w-[72px]" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
          SF
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">
            StockFlow
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 space-y-1">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "text-accent bg-accent-light"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-accent" />
              )}
              <item.icon size={20} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg transition-colors"
      >
        {theme === "dark" ? <Sun size={20} className="shrink-0" /> : <Moon size={20} className="shrink-0" />}
        {!collapsed && <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
      </button>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-border text-text-secondary hover:text-text-primary"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* User */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-border">
        <div className="w-8 h-8 rounded-full bg-dark-card text-white flex items-center justify-center text-xs font-bold shrink-0">
          AJ
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Alex Julia</p>
            <p className="text-xs text-text-secondary truncate">
              alex@email.com
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
