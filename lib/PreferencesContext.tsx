"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Preferences {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  confirmOrders: boolean;
  showBalance: boolean;
  defaultOrderType: "DELIVERY" | "INTRADAY";
  defaultQty: number;
}

const DEFAULT_PREFS: Preferences = {
  notifications: true,
  emailAlerts: false,
  darkMode: true,
  confirmOrders: true,
  showBalance: false,
  defaultOrderType: "DELIVERY",
  defaultQty: 1,
};

interface PreferencesState extends Preferences {
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  togglePref: (key: keyof Pick<Preferences, "notifications" | "emailAlerts" | "darkMode" | "confirmOrders" | "showBalance">) => void;
}

const PreferencesContext = createContext<PreferencesState>({
  ...DEFAULT_PREFS,
  setPref: () => {},
  togglePref: () => {},
});

const STORAGE_KEY = "mcse-preferences";

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPrefs(prev => ({ ...prev, ...parsed }));
      }
    } catch {
      // Ignore parse errors
    }
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (after initial hydration)
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    }
  }, [prefs, hydrated]);

  // Apply theme
  useEffect(() => {
    if (!hydrated) return;
    const theme = prefs.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    // Update phone status bar / navigation bar color
    const themeColor = prefs.darkMode ? "#0a0a0a" : "#f5f5f5";
    document.querySelectorAll('meta[name="theme-color"]').forEach(el =>
      el.setAttribute("content", themeColor)
    );
  }, [prefs.darkMode, hydrated]);

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  }, []);

  const togglePref = useCallback((key: keyof Pick<Preferences, "notifications" | "emailAlerts" | "darkMode" | "confirmOrders" | "showBalance">) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <PreferencesContext.Provider value={{ ...prefs, setPref, togglePref }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  return useContext(PreferencesContext);
}
