"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  PieChart,
  BarChart3,
  SlidersHorizontal,
  User,
} from "lucide-react";

const items = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/portfolio", icon: PieChart, label: "Portfolio" },
  { href: "/markets", icon: BarChart3, label: "Markets", fab: true },
  { href: "/analytics", icon: SlidersHorizontal, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-surface border-t border-border rounded-t-3xl md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          if (item.fab) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center justify-center w-12 h-12 -mt-6 rounded-full bg-accent text-white shadow-lg"
              >
                <item.icon size={22} />
              </Link>
            );
          }
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 text-xs ${
                active ? "text-accent" : "text-text-secondary"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
