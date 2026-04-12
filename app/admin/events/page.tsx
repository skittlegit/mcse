"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Calendar, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useAdmin } from "@/lib/AdminContext";

export default function AdminEventsPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { companyEvents, addEvent, removeEvent } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");

  const isCompanyAdmin = role === "company";

  // Sort by date ascending
  const sortedEvents = [...companyEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const upcoming = sortedEvents.filter((e) => new Date(e.date) >= new Date());
  const past = sortedEvents.filter((e) => new Date(e.date) < new Date());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addEvent(title.trim(), description.trim(), date, "ENIGMA");
    setTitle("");
    setDescription("");
    setDate("");
    setShowForm(false);
  }

  const renderEvent = (evt: typeof companyEvents[0]) => (
    <motion.div
      key={evt.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 p-5 hover:bg-white/[0.02] transition-colors flex items-start gap-5"
    >
      {/* Date block */}
      <div className="shrink-0 w-14 text-center border border-white/10 py-2">
        <p className="font-[var(--font-anton)] text-lg leading-none">
          {new Date(evt.date).getDate()}
        </p>
        <p className="text-[8px] tracking-[0.15em] text-white/30 mt-1">
          {new Date(evt.date).toLocaleDateString("en-IN", { month: "short" }).toUpperCase()}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={10} className="text-white/25" />
          <span className="text-[8px] tracking-[0.1em] text-white/20">{evt.company}</span>
        </div>
        <h3 className="text-[13px] text-white/80 font-medium mb-1">{evt.title}</h3>
        {evt.description && (
          <p className="text-[11px] text-white/40 leading-relaxed">{evt.description}</p>
        )}
        <p className="text-[9px] text-white/20 mt-2">
          {new Date(evt.date).toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </p>
      </div>

      {isCompanyAdmin && (
        <button
          onClick={() => removeEvent(evt.id)}
          className="shrink-0 p-2 text-white/20 hover:text-[#FF5252] transition-colors"
          title="Remove event"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-4xl mx-auto px-5 md:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/admin")} className="text-white/30 hover:text-white transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="font-[var(--font-anton)] text-2xl tracking-[0.08em] uppercase">EVENTS</h1>
          <p className="text-[10px] tracking-[0.1em] text-white/30 mt-1">Manage company events and announcements</p>
        </div>
        {isCompanyAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 px-4 text-[9px] tracking-[0.15em] font-semibold bg-white text-black hover:bg-white/80 transition-colors flex items-center gap-1.5"
          >
            <Plus size={12} />
            NEW EVENT
          </button>
        )}
      </div>

      {/* New event form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="border border-white/15 p-5 mb-6 space-y-4"
        >
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">EVENT TITLE</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event name"
              className="w-full h-10 bg-transparent border border-white/20 px-4 text-[13px] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">DESCRIPTION</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event details (optional)"
              rows={2}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-[12px] text-white/70 placeholder:text-white/15 outline-none focus:border-white transition-colors resize-none"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">DATE</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-10 bg-transparent border border-white/20 px-4 text-[13px] text-white outline-none focus:border-white transition-colors [color-scheme:dark]"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="h-9 px-5 text-[9px] tracking-[0.15em] font-semibold bg-white text-black hover:bg-white/80 transition-colors">
              CREATE EVENT
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-9 px-5 text-[9px] tracking-[0.15em] text-white/40 border border-white/15 hover:text-white transition-colors">
              CANCEL
            </button>
          </div>
        </motion.form>
      )}

      {/* Upcoming events */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-4">UPCOMING ({upcoming.length})</h2>
          <div className="space-y-3">
            {upcoming.map(renderEvent)}
          </div>
        </div>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] text-white/20 uppercase mb-4">PAST ({past.length})</h2>
          <div className="space-y-3 opacity-60">
            {past.map(renderEvent)}
          </div>
        </div>
      )}

      {companyEvents.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[11px] tracking-[0.1em] text-white/20">No events scheduled</p>
        </div>
      )}
    </div>
  );
}
