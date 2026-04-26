"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Building,
  Check,
  X,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { getRegistrationQueue, approveRegistration, rejectRegistration, type CompanyRegistration } from "@/lib/api";
import { Skeleton } from "@/components/Skeleton";

export default function RegistrationsPage() {
  const { isLoggedIn, role } = useAuth();
  const [registrations, setRegistrations] = useState<CompanyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  useEffect(() => {
    async function fetchRegistrations() {
      const res = await getRegistrationQueue();
      if (res.data) {
        setRegistrations(res.data);
      }
      setLoading(false);
    }
    fetchRegistrations();
  }, []);

  async function handleApprove(id: string) {
    setProcessing(id);
    setActionMsg(null);

    const res = await approveRegistration(id);
    if (res.error) {
      setActionMsg({ ok: false, text: `Failed to approve: ${res.error}` });
    } else {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" as const } : r))
      );
      setActionMsg({ ok: true, text: "Registration approved" });
    }
    setProcessing(null);
    setTimeout(() => setActionMsg(null), 3000);
  }

  async function handleReject(id: string) {
    setProcessing(id);
    setActionMsg(null);

    const res = await rejectRegistration(id);
    if (res.error) {
      setActionMsg({ ok: false, text: `Failed to reject: ${res.error}` });
    } else {
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" as const } : r))
      );
      setActionMsg({ ok: true, text: "Registration rejected" });
    }
    setProcessing(null);
    setTimeout(() => setActionMsg(null), 3000);
  }

  const filtered = registrations.filter((r) =>
    filter === "ALL" ? true : r.status === filter
  );

  const pendingCount = registrations.filter((r) => r.status === "PENDING").length;

  // Access control
  if (!isLoggedIn || role !== "admin") {
    return (
      <div className="pb-24 md:pb-12 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <AlertTriangle size={32} className="text-white/20 mb-4" />
          <p className="font-[var(--font-anton)] text-lg tracking-[0.1em] mb-2">ACCESS DENIED</p>
          <p className="text-[11px] text-white/40 mb-6">Only total admins can access registration queue.</p>
          <Link
            href="/admin"
            className="px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            BACK TO ADMIN
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
          >
            <ArrowLeft size={15} />
          </Link>
          <div className="flex items-center gap-3">
            <Building size={18} className="text-white/40" />
            <div>
              <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
                REGISTRATION QUEUE
              </h1>
              <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">
                {pendingCount} PENDING · {registrations.length} TOTAL
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-[9px] tracking-[0.1em] border transition-all ${
                filter === f
                  ? "border-white/40 text-white bg-white/5"
                  : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Action message */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`mb-6 px-4 py-3 border text-[11px] tracking-[0.1em] ${
              actionMsg.ok
                ? "bg-up/10 border-up/30 text-up"
                : "bg-down/10 border-down/30 text-down"
            }`}
          >
            {actionMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Registration list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-white/10 p-12 text-center"
        >
          <Building size={32} className="mx-auto text-white/10 mb-4" />
          <p className="text-[11px] text-white/30">
            {filter === "PENDING" ? "No pending registrations" : "No registrations found"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg, idx) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="border border-white/10 overflow-hidden"
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                onClick={() => setExpandedId(expandedId === reg.id ? null : reg.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-medium text-white/40">
                      {reg.ticker}
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white/70">{reg.companyName}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      Submitted by {reg.contactName} · {new Date(reg.submittedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={`text-[8px] tracking-[0.1em] px-2 py-1 border ${
                      reg.status === "PENDING"
                        ? "text-amber-400 border-amber-400/20 bg-amber-400/5"
                        : reg.status === "APPROVED"
                        ? "text-up border-up/20 bg-up/5"
                        : "text-down border-down/20 bg-down/5"
                    }`}
                  >
                    {reg.status}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-white/30 transition-transform ${
                      expandedId === reg.id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expandedId === reg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-white/8"
                  >
                    <div className="px-5 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-[9px] tracking-[0.1em] text-white/20 mb-1">SECTOR</p>
                        <p className="text-[11px] text-white/50">{reg.sector}</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.1em] text-white/20 mb-1">INITIAL SHARES</p>
                        <p className="text-[11px] text-white/50">{(reg.initialShares ?? 0).toLocaleString("en-IN")}</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.1em] text-white/20 mb-1">IPO PRICE</p>
                        <p className="text-[11px] text-white/50">₹{(reg.ipoPrice ?? 0).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] tracking-[0.1em] text-white/20 mb-1">CONTACT EMAIL</p>
                        <p className="text-[11px] text-white/50">{reg.contactEmail}</p>
                      </div>
                    </div>

                    <div className="px-5 py-3 border-t border-white/6">
                      <p className="text-[9px] tracking-[0.1em] text-white/20 mb-1">DESCRIPTION</p>
                      <p className="text-[11px] text-white/40 leading-relaxed">{reg.description}</p>
                    </div>

                    {/* Actions for pending registrations */}
                    {reg.status === "PENDING" && (
                      <div className="px-5 py-4 border-t border-white/8 flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApprove(reg.id);
                          }}
                          disabled={processing === reg.id}
                          className="flex items-center gap-2 px-4 py-2 bg-up text-black text-[10px] tracking-[0.1em] font-semibold hover:bg-up/90 transition-colors disabled:opacity-50"
                        >
                          <Check size={12} />
                          APPROVE
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(reg.id);
                          }}
                          disabled={processing === reg.id}
                          className="flex items-center gap-2 px-4 py-2 border border-down/40 text-down text-[10px] tracking-[0.1em] hover:bg-down/10 transition-colors disabled:opacity-50"
                        >
                          <X size={12} />
                          REJECT
                        </button>
                        {processing === reg.id && (
                          <span className="text-[10px] text-white/30 animate-pulse ml-2">
                            Processing...
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
