"use client";

import LoadingScreen from "@/components/LoadingScreen";
import TickerTape from "@/components/TickerTape";

export default function LoadingPage() {
  return (
    <div className="-mx-4 md:-mx-6 lg:-mx-12 flex flex-col h-[calc(100dvh-7rem)] min-h-[480px]">
      {/* Top ticker strip (in addition to the AppShell tape above). */}
      <div className="shrink-0">
        <TickerTape />
      </div>

      {/* Endless boot animation fills the middle. */}
      <div className="flex-1 relative overflow-hidden">
        <LoadingScreen endless />
      </div>

      {/* Bottom ticker strip. */}
      <div className="shrink-0 border-t border-white/8">
        <TickerTape />
      </div>
    </div>
  );
}
