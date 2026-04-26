"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Building, ArrowLeft, Send, AlertTriangle, Check, Info } from "lucide-react";
import { submitRegistration } from "@/lib/api";

const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Consumer Goods",
  "Energy",
  "Manufacturing",
  "Media & Entertainment",
  "Real Estate",
  "Education",
  "Other",
] as const;

interface FormData {
  companyName: string;
  ticker: string;
  sector: string;
  description: string;
  initialShares: string;
  ipoPrice: string;
  contactName: string;
  contactEmail: string;
  parentCompany: string;
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    companyName: "",
    ticker: "",
    sector: "",
    description: "",
    initialShares: "10000",
    ipoPrice: "100",
    contactName: "",
    contactEmail: "",
    parentCompany: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function updateField(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.ticker.trim()) {
      newErrors.ticker = "Ticker symbol is required";
    } else if (!/^[A-Z]{2,6}$/.test(formData.ticker.toUpperCase())) {
      newErrors.ticker = "Ticker must be 2-6 uppercase letters";
    }

    if (!formData.sector) {
      newErrors.sector = "Please select a sector";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description should be at least 50 characters";
    }

    const shares = parseInt(formData.initialShares);
    if (isNaN(shares) || shares < 1000 || shares > 1000000) {
      newErrors.initialShares = "Initial shares must be between 1,000 and 1,000,000";
    }

    const price = parseFloat(formData.ipoPrice);
    if (isNaN(price) || price < 10 || price > 10000) {
      newErrors.ipoPrice = "IPO price must be between ₹10 and ₹10,000";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Contact name is required";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const res = await submitRegistration({
      companyName: formData.companyName.trim(),
      ticker: formData.ticker.toUpperCase().trim(),
      sector: formData.sector,
      description: formData.description.trim(),
      initialShares: parseInt(formData.initialShares),
      ipoPrice: parseFloat(formData.ipoPrice),
      contactName: formData.contactName.trim(),
      contactEmail: formData.contactEmail.trim(),
      parentCompany: formData.parentCompany.trim() || undefined,
    });

    if (res.error) {
      setSubmitError(res.error);
    } else {
      setSubmitted(true);
    }
    setIsSubmitting(false);
  }

  // Success state
  if (submitted) {
    return (
      <div className="py-6 md:py-12 max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="border border-up/30 bg-up/5 p-8 text-center"
        >
          <div className="w-16 h-16 border-2 border-up flex items-center justify-center mx-auto mb-6">
            <Check size={28} className="text-up" />
          </div>
          <h2 className="font-[var(--font-anton)] text-xl tracking-[0.1em] mb-3">
            REGISTRATION SUBMITTED
          </h2>
          <p className="text-[12px] text-white/50 leading-relaxed mb-6">
            Your company registration request has been submitted successfully.
            Our admin team will review your application and contact you at{" "}
            <span className="text-white/70">{formData.contactEmail}</span> with the next steps.
          </p>
          <p className="text-[10px] text-white/30 mb-6">
            Typical review time: 1-3 business days
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-white/90 transition-colors"
          >
            BACK TO HOME
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-6 md:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-4 mb-8"
      >
        <Link
          href="/"
          className="w-11 h-11 border border-white/20 flex items-center justify-center hover:border-white transition-colors"
        >
          <ArrowLeft size={15} />
        </Link>
        <div className="flex items-center gap-3">
          <Building size={18} className="text-white/40" />
          <div>
            <h1 className="font-[var(--font-anton)] text-lg md:text-xl tracking-[0.1em] uppercase">
              COMPANY REGISTRATION
            </h1>
            <p className="text-[10px] tracking-[0.15em] text-white/30 mt-0.5">
              LIST YOUR COMPANY ON MCSE
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-2xl">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="border border-white/10 bg-white/[0.02] p-4 mb-6 flex items-start gap-3"
        >
          <Info size={14} className="text-white/30 shrink-0 mt-0.5" />
          <div className="text-[11px] text-white/40 leading-relaxed">
            <p>
              Register your club or organization to be listed on the Mock Capital Stock Exchange.
              Once approved, your company will receive a dedicated trading page and can issue shares
              to the public market.
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Company Info */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-4">COMPANY INFORMATION</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  COMPANY NAME *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateField("companyName", e.target.value)}
                  placeholder="e.g., Enigma Computer Science"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                {errors.companyName && (
                  <p className="text-[9px] text-down mt-1">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  TICKER SYMBOL *
                </label>
                <input
                  type="text"
                  value={formData.ticker}
                  onChange={(e) => updateField("ticker", e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="e.g., ENAI"
                  maxLength={6}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white uppercase outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                {errors.ticker && (
                  <p className="text-[9px] text-down mt-1">{errors.ticker}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  SECTOR *
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => updateField("sector", e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none appearance-none cursor-pointer focus:border-white/30 transition-colors"
                >
                  <option value="" className="bg-[#111]">Select sector...</option>
                  {SECTORS.map((s) => (
                    <option key={s} value={s} className="bg-[#111]">{s}</option>
                  ))}
                </select>
                {errors.sector && (
                  <p className="text-[9px] text-down mt-1">{errors.sector}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  PARENT COMPANY (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={formData.parentCompany}
                  onChange={(e) => updateField("parentCompany", e.target.value)}
                  placeholder="e.g., Enigma Group"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                DESCRIPTION *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Describe your organization, its mission, and why it should be listed on MCSE..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 resize-none focus:border-white/30 transition-colors"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.description ? (
                  <p className="text-[9px] text-down">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span className="text-[9px] text-white/20">
                  {formData.description.length} / 500
                </span>
              </div>
            </div>
          </div>

          {/* IPO Details */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-4">IPO DETAILS</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  INITIAL SHARES *
                </label>
                <input
                  type="number"
                  value={formData.initialShares}
                  onChange={(e) => updateField("initialShares", e.target.value)}
                  min={1000}
                  max={1000000}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                <p className="text-[9px] text-white/20 mt-1">Between 1,000 and 1,000,000</p>
                {errors.initialShares && (
                  <p className="text-[9px] text-down mt-1">{errors.initialShares}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  IPO PRICE (₹) *
                </label>
                <input
                  type="number"
                  value={formData.ipoPrice}
                  onChange={(e) => updateField("ipoPrice", e.target.value)}
                  min={10}
                  max={10000}
                  step={0.01}
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                <p className="text-[9px] text-white/20 mt-1">Between ₹10 and ₹10,000</p>
                {errors.ipoPrice && (
                  <p className="text-[9px] text-down mt-1">{errors.ipoPrice}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="border border-white/10 p-5">
            <p className="text-[9px] tracking-[0.15em] text-white/30 mb-4">CONTACT INFORMATION</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  CONTACT NAME *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => updateField("contactName", e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                {errors.contactName && (
                  <p className="text-[9px] text-down mt-1">{errors.contactName}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] tracking-[0.1em] text-white/40 block mb-2">
                  CONTACT EMAIL *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20 focus:border-white/30 transition-colors"
                />
                {errors.contactEmail && (
                  <p className="text-[9px] text-down mt-1">{errors.contactEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Error message */}
          {submitError && (
            <div className="flex items-center gap-2 px-4 py-3 border border-down/30 bg-down/10 text-[11px] text-down">
              <AlertTriangle size={14} />
              {submitError}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 text-[11px] tracking-[0.2em] font-semibold flex items-center justify-center gap-2 transition-all ${
              isSubmitting
                ? "bg-white/20 text-white/50 cursor-not-allowed"
                : "bg-white text-black hover:bg-white/90"
            }`}
          >
            <Send size={14} />
            {isSubmitting ? "SUBMITTING..." : "SUBMIT REGISTRATION"}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
