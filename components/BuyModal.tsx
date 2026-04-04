"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function BuyModal({
  ticker,
  onClose,
}: {
  ticker: string;
  onClose: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 space-y-4 animate-slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">
            {confirmed ? "Order Confirmed" : `Buy ${ticker}`}
          </h3>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary">
            <X size={20} />
          </button>
        </div>

        {confirmed ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-accent-light flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-text-secondary text-sm">
              Your order to buy {ticker} has been placed successfully.
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-text-secondary">
              Place a market order for {ticker} shares.
            </p>
            <button
              onClick={() => setConfirmed(true)}
              className="w-full py-3 rounded-full bg-accent text-white font-semibold hover:bg-accent/90 transition-colors"
            >
              Confirm Purchase
            </button>
          </>
        )}
      </div>
    </div>
  );
}
