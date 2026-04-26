"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-20 md:py-32">
      <div className="w-16 h-16 border border-white/15 flex items-center justify-center mb-6">
        <span className="text-2xl">!</span>
      </div>
      <h2 className="font-[var(--font-anton)] text-xl md:text-2xl tracking-[0.1em] uppercase mb-2">
        SOMETHING WENT WRONG
      </h2>
      <p className="text-[11px] tracking-[0.1em] text-white/40 text-center max-w-xs mb-6">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="px-8 py-3 text-[10px] tracking-[0.15em] bg-white text-black font-semibold hover:bg-transparent hover:text-white border border-white transition-all duration-300"
      >
        TRY AGAIN
      </button>
    </div>
  );
}
