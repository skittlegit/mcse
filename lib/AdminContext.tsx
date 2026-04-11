"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { allStocksRaw } from "@/lib/mockData";

interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

interface AdminState {
  marketOpen: boolean;
  toggleMarket: () => void;
  listedStocks: string[];
  toggleListing: (ticker: string) => void;
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string) => void;
}

const AdminContext = createContext<AdminState>({
  marketOpen: true,
  toggleMarket: () => {},
  listedStocks: [],
  toggleListing: () => {},
  announcements: [],
  addAnnouncement: () => {},
});

export function AdminProvider({ children }: { children: ReactNode }) {
  const [marketOpen, setMarketOpen] = useState(true);
  const [listedStocks, setListedStocks] = useState<string[]>(
    allStocksRaw.map((s) => s.ticker)
  );
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: "ANN-1", title: "Welcome to MCSE Exchange", content: "The mock stock exchange is now live for all members.", timestamp: Date.now() - 86400000 * 3 },
    { id: "ANN-2", title: "Trading hours updated", content: "Market is now open 9 AM - 3:30 PM on weekdays.", timestamp: Date.now() - 86400000 },
  ]);

  const toggleMarket = useCallback(() => setMarketOpen((p) => !p), []);

  const toggleListing = useCallback((ticker: string) => {
    setListedStocks((prev) =>
      prev.includes(ticker) ? prev.filter((t) => t !== ticker) : [...prev, ticker]
    );
  }, []);

  const addAnnouncement = useCallback((title: string, content: string) => {
    setAnnouncements((prev) => [
      { id: `ANN-${Date.now()}`, title, content, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  return (
    <AdminContext.Provider
      value={{ marketOpen, toggleMarket, listedStocks, toggleListing, announcements, addAnnouncement }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
