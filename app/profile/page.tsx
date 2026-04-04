"use client";

import { Moon, Sun, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { useTheme } from "@/lib/ThemeProvider";

export default function ProfilePage() {
  const { theme, toggle } = useTheme();

  return (
    <div className="max-w-lg mx-auto px-5 md:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Profile</h1>

      {/* Avatar card */}
      <div className="bg-surface rounded-2xl border border-border p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-dark-card text-white flex items-center justify-center text-xl font-bold">
          AJ
        </div>
        <div>
          <p className="text-lg font-bold">Alex Julia</p>
          <p className="text-sm text-text-secondary">alex@email.com</p>
          <p className="text-xs text-accent font-semibold mt-1">Premium Member</p>
        </div>
      </div>

      {/* Settings list */}
      <div className="bg-surface rounded-2xl border border-border divide-y divide-border">
        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg transition-colors"
        >
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Sun size={20} className="text-text-secondary" /> : <Moon size={20} className="text-text-secondary" />}
            <span className="text-sm font-medium">
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
          <div
            className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${
              theme === "dark" ? "bg-accent justify-end" : "bg-border justify-start"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-white shadow" />
          </div>
        </button>

        {[
          { icon: Bell, label: "Notifications" },
          { icon: Shield, label: "Security" },
          { icon: HelpCircle, label: "Help & Support" },
        ].map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-bg transition-colors text-left"
          >
            <item.icon size={20} className="text-text-secondary" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-bg transition-colors text-left text-negative">
          <LogOut size={20} />
          <span className="text-sm font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}
