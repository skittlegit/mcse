"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";

export interface Preferences {
  notifications: boolean;
  emailAlerts: boolean;
  darkMode: boolean;
  confirmOrders: boolean;
}

const DEFAULT_PREFS: Preferences = {
  notifications: true,
  emailAlerts: false,
  darkMode: true,
  confirmOrders: true,
};

interface PreferencesState extends Preferences {
  setPref: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  togglePref: (key: keyof Preferences) => void;
}

const PreferencesContext = createContext<PreferencesState>({
  ...DEFAULT_PREFS,
  setPref: () => {},
  togglePref: () => {},
});

const STORAGE_KEY = "mcse-preferences";

// ─── Module-scoped store (SSR-safe) ──────────────────────
let cachedPrefs: Preferences = DEFAULT_PREFS;
const listeners = new Set<() => void>();

function hydrateFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      cachedPrefs = { ...DEFAULT_PREFS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
}
hydrateFromStorage();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

function notify() {
  listeners.forEach((cb) => cb());
}

function mutate(next: Preferences) {
  cachedPrefs = next;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore quota errors
    }
  }
  notify();
}

function getSnapshot() {
  return cachedPrefs;
}
function getServerSnapshot() {
  return DEFAULT_PREFS;
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Apply theme whenever darkMode changes
  useEffect(() => {
    const theme = prefs.darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    const themeColor = prefs.darkMode ? "#0a0a0a" : "#f5f5f5";
    document.querySelectorAll('meta[name="theme-color"]').forEach((el) =>
      el.setAttribute("content", themeColor),
    );
  }, [prefs.darkMode]);

  const setPref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    mutate({ ...cachedPrefs, [key]: value });
  }, []);

  const togglePref = useCallback((key: keyof Preferences) => {
    mutate({ ...cachedPrefs, [key]: !cachedPrefs[key] });
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
