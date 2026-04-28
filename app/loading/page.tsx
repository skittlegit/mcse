"use client";

import LoadingScreen from "@/components/LoadingScreen";
import TickerTape from "@/components/TickerTape";

export default function LoadingPage() {
  return (
    <div className="fixed inset-0 flex flex-col bg-bg overflow-hidden">
      {/* Top ticker strip */}
      <div className="shrink-0">
        <TickerTape />
      </div>

      {/* Endless boot animation fills the middle */}
      <div className="flex-1 relative overflow-hidden">
        <LoadingScreen endless />
      </div>

      {/* Bottom ticker strip */}
      <div className="shrink-0 border-t border-white/8">
        <TickerTape />
      </div>
    </div>
  );
}
