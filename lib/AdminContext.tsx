"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { allStocksRaw } from "@/lib/mockData";

interface Announcement {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface CompanyNews {
  id: string;
  company: string;
  title: string;
  content: string;
  timestamp: number;
  status: "PENDING" | "PUBLISHED" | "REJECTED";
}

export interface CompanyEvent {
  id: string;
  company: string;
  title: string;
  description: string;
  date: string; // ISO date string
  timestamp: number;
}

interface AdminState {
  marketOpen: boolean;
  toggleMarket: () => void;
  listedStocks: string[];
  toggleListing: (ticker: string) => void;
  announcements: Announcement[];
  addAnnouncement: (title: string, content: string) => void;
  companyNews: CompanyNews[];
  submitNews: (title: string, content: string, company: string) => void;
  approveNews: (id: string) => void;
  rejectNews: (id: string) => void;
  companyEvents: CompanyEvent[];
  addEvent: (title: string, description: string, date: string, company: string) => void;
  removeEvent: (id: string) => void;
}

const AdminContext = createContext<AdminState>({
  marketOpen: true,
  toggleMarket: () => {},
  listedStocks: [],
  toggleListing: () => {},
  announcements: [],
  addAnnouncement: () => {},
  companyNews: [],
  submitNews: () => {},
  approveNews: () => {},
  rejectNews: () => {},
  companyEvents: [],
  addEvent: () => {},
  removeEvent: () => {},
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

  const [companyNews, setCompanyNews] = useState<CompanyNews[]>([
    { id: "NEWS-1", company: "ENIGMA", title: "Enigma Q3 results beat estimates", content: "Revenue up 23% YoY with strong club membership growth.", timestamp: Date.now() - 86400000 * 2, status: "PUBLISHED" },
    { id: "NEWS-2", company: "ENIGMA", title: "New campus expansion planned", content: "Enigma announces expansion to three new buildings by next semester.", timestamp: Date.now() - 86400000, status: "PENDING" },
  ]);

  const submitNews = useCallback((title: string, content: string, company: string) => {
    setCompanyNews((prev) => [
      { id: `NEWS-${Date.now()}`, company, title, content, timestamp: Date.now(), status: "PENDING" },
      ...prev,
    ]);
  }, []);

  const approveNews = useCallback((id: string) => {
    setCompanyNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "PUBLISHED" as const } : n))
    );
  }, []);

  const rejectNews = useCallback((id: string) => {
    setCompanyNews((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "REJECTED" as const } : n))
    );
  }, []);

  const [companyEvents, setCompanyEvents] = useState<CompanyEvent[]>([
    { id: "EVT-1", company: "ENIGMA", title: "Annual General Meeting", description: "Yearly shareholder meeting for Enigma club.", date: "2025-08-15", timestamp: Date.now() - 86400000 },
    { id: "EVT-2", company: "ENIGMA", title: "Hackathon 2025", description: "48-hour coding marathon open to all members.", date: "2025-09-01", timestamp: Date.now() },
  ]);

  const addEvent = useCallback((title: string, description: string, date: string, company: string) => {
    setCompanyEvents((prev) => [
      { id: `EVT-${Date.now()}`, company, title, description, date, timestamp: Date.now() },
      ...prev,
    ]);
  }, []);

  const removeEvent = useCallback((id: string) => {
    setCompanyEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <AdminContext.Provider
      value={{ marketOpen, toggleMarket, listedStocks, toggleListing, announcements, addAnnouncement, companyNews, submitNews, approveNews, rejectNews, companyEvents, addEvent, removeEvent }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
