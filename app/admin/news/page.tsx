"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useAdmin } from "@/lib/AdminContext";
import type { CompanyNews } from "@/lib/AdminContext";

export default function AdminNewsPage() {
  const { role } = useAuth();
  const router = useRouter();
  const { companyNews, submitNews, approveNews, rejectNews } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const isTotalAdmin = role === "admin";
  const isCompanyAdmin = role === "company";

  // Company admin sees their news; total admin sees all
  const visibleNews = companyNews;
  const pendingNews = visibleNews.filter((n) => n.status === "PENDING");
  const publishedNews = visibleNews.filter((n) => n.status === "PUBLISHED");
  const rejectedNews = visibleNews.filter((n) => n.status === "REJECTED");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    submitNews(title.trim(), content.trim(), "ENIGMA");
    setTitle("");
    setContent("");
    setShowForm(false);
  }

  const statusBadge = (status: CompanyNews["status"]) => {
    if (status === "PENDING") return <span className="text-[8px] tracking-[0.15em] text-amber-400 border border-amber-400/30 bg-amber-400/5 px-1.5 py-0.5 inline-flex items-center gap-1"><Clock size={8} />PENDING</span>;
    if (status === "PUBLISHED") return <span className="text-[8px] tracking-[0.15em] text-[#00D26A] border border-[#00D26A]/30 bg-[#00D26A]/5 px-1.5 py-0.5 inline-flex items-center gap-1"><CheckCircle size={8} />PUBLISHED</span>;
    return <span className="text-[8px] tracking-[0.15em] text-[#FF5252] border border-[#FF5252]/30 bg-[#FF5252]/5 px-1.5 py-0.5 inline-flex items-center gap-1"><XCircle size={8} />REJECTED</span>;
  };

  const renderNewsItem = (item: CompanyNews) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 p-5 hover:bg-white/[0.02] transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {statusBadge(item.status)}
            <span className="text-[8px] tracking-[0.1em] text-white/20">{item.company}</span>
          </div>
          <h3 className="text-[13px] text-white/80 font-medium mb-1">{item.title}</h3>
          <p className="text-[11px] text-white/40 leading-relaxed">{item.content}</p>
          <p className="text-[9px] text-white/20 mt-2">{new Date(item.timestamp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
        </div>
        {isTotalAdmin && item.status === "PENDING" && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => approveNews(item.id)}
              className="h-8 px-3 text-[9px] tracking-[0.1em] bg-[#00D26A] text-black font-semibold hover:bg-[#00D26A]/80 transition-colors"
            >
              APPROVE
            </button>
            <button
              onClick={() => rejectNews(item.id)}
              className="h-8 px-3 text-[9px] tracking-[0.1em] border border-[#FF5252]/40 text-[#FF5252] hover:bg-[#FF5252]/10 transition-colors"
            >
              REJECT
            </button>
          </div>
        )}
      </div>
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
          <h1 className="font-[var(--font-anton)] text-2xl tracking-[0.08em] uppercase">
            {isTotalAdmin ? "NEWS APPROVAL" : "MANAGE NEWS"}
          </h1>
          <p className="text-[10px] tracking-[0.1em] text-white/30 mt-1">
            {isTotalAdmin ? "Review and approve pending company news" : "Submit and manage your company news articles"}
          </p>
        </div>
        {isCompanyAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-9 px-4 text-[9px] tracking-[0.15em] font-semibold bg-white text-black hover:bg-white/80 transition-colors flex items-center gap-1.5"
          >
            <Plus size={12} />
            NEW ARTICLE
          </button>
        )}
      </div>

      {/* New article form */}
      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          onSubmit={handleSubmit}
          className="border border-white/15 p-5 mb-6 space-y-4"
        >
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">TITLE</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article headline"
              className="w-full h-10 bg-transparent border border-white/20 px-4 text-[13px] text-white placeholder:text-white/15 outline-none focus:border-white transition-colors"
            />
          </div>
          <div>
            <label className="text-[9px] tracking-[0.2em] text-white/30 uppercase mb-2 block">CONTENT</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content..."
              rows={3}
              className="w-full bg-transparent border border-white/20 px-4 py-3 text-[12px] text-white/70 placeholder:text-white/15 outline-none focus:border-white transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="h-9 px-5 text-[9px] tracking-[0.15em] font-semibold bg-white text-black hover:bg-white/80 transition-colors">
              SUBMIT FOR APPROVAL
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="h-9 px-5 text-[9px] tracking-[0.15em] text-white/40 border border-white/15 hover:text-white transition-colors">
              CANCEL
            </button>
          </div>
        </motion.form>
      )}

      {/* Pending news (shown first for total admin) */}
      {isTotalAdmin && pendingNews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.2em] text-amber-400/60 uppercase mb-4">PENDING APPROVAL ({pendingNews.length})</h2>
          <div className="space-y-3">
            {pendingNews.map(renderNewsItem)}
          </div>
        </div>
      )}

      {/* Published news */}
      {publishedNews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-4">PUBLISHED ({publishedNews.length})</h2>
          <div className="space-y-3">
            {publishedNews.map(renderNewsItem)}
          </div>
        </div>
      )}

      {/* Pending news (company admin view) */}
      {isCompanyAdmin && pendingNews.length > 0 && (
        <div className="mb-8">
          <h2 className="text-[10px] tracking-[0.2em] text-amber-400/60 uppercase mb-4">PENDING ({pendingNews.length})</h2>
          <div className="space-y-3">
            {pendingNews.map(renderNewsItem)}
          </div>
        </div>
      )}

      {/* Rejected news */}
      {rejectedNews.length > 0 && (
        <div>
          <h2 className="text-[10px] tracking-[0.2em] text-[#FF5252]/50 uppercase mb-4">REJECTED ({rejectedNews.length})</h2>
          <div className="space-y-3">
            {rejectedNews.map(renderNewsItem)}
          </div>
        </div>
      )}

      {visibleNews.length === 0 && (
        <div className="text-center py-20">
          <p className="text-[11px] tracking-[0.1em] text-white/20">No news articles yet</p>
        </div>
      )}
    </div>
  );
}
