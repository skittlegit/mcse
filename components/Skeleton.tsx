"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-white/[0.06]",
        className
      )}
      style={style}
    />
  );
}

export function SkeletonText({ className, lines = 1 }: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3",
            i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("border border-white/10 p-5 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4, className }: SkeletonProps & { rows?: number; cols?: number }) {
  return (
    <div className={cn("border border-white/10", className)}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/8 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div
          key={rowIdx}
          className={cn(
            "px-5 py-3 flex gap-4",
            rowIdx < rows - 1 && "border-b border-white/6"
          )}
        >
          {Array.from({ length: cols }).map((_, colIdx) => (
            <Skeleton key={colIdx} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonStats({ count = 4, className }: SkeletonProps & { count?: number }) {
  return (
    <div className={cn("grid gap-[1px] bg-white/8", className)} style={{ gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)` }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-bg p-4 md:p-5 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ className }: SkeletonProps) {
  const barHeights = [58, 42, 71, 35, 83, 49, 67, 38, 76, 53, 62, 44, 79, 36, 69, 47, 85, 41, 73, 55];
  return (
    <div className={cn("border border-white/10 p-5", className)}>
      <Skeleton className="h-3 w-24 mb-4" />
      <div className="h-48 md:h-56 flex items-end gap-1">
        {barHeights.map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ items = 3, className }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("border border-white/10", className)}>
      <div className="px-5 py-4 border-b border-white/8">
        <Skeleton className="h-3 w-24" />
      </div>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "flex items-center justify-between px-5 py-3",
            i < items - 1 && "border-b border-white/6"
          )}
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2 w-16" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonNotification({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-start gap-3.5 px-5 py-3.5", className)}>
      <Skeleton className="w-5 h-5 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2 w-12" />
        </div>
        <Skeleton className="h-3 w-full" />
      </div>
      <Skeleton className="w-10 h-3" />
    </div>
  );
}

export function SkeletonButton({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-9 w-24", className)} />;
}

export function SkeletonInput({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-10 w-full", className)} />;
}

export function SkeletonAvatar({ className }: SkeletonProps) {
  return <Skeleton className={cn("w-10 h-10 rounded-full", className)} />;
}

export function SkeletonBadge({ className }: SkeletonProps) {
  return <Skeleton className={cn("h-5 w-16", className)} />;
}

// Compound loading states for specific views

export function LoadingAdminDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <SkeletonStats count={5} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonList items={3} />
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonList items={5} />
        </div>
        <div className="space-y-6">
          <SkeletonList items={3} />
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  );
}

export function LoadingHoldingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-10" />
      </div>
      <SkeletonStats count={3} />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}

export function LoadingStockPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center gap-4">
        <Skeleton className="w-11 h-11" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <SkeletonStats count={4} />
      <SkeletonChart />
      <SkeletonTable rows={4} cols={3} />
    </div>
  );
}

export function LoadingNotifications() {
  return (
    <div className="animate-in fade-in duration-300">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonNotification key={i} className={i < 3 ? "border-b border-white/6" : ""} />
      ))}
    </div>
  );
}

export function LoadingAnalysePage() {
  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      <SkeletonCard />
      <SkeletonStats count={3} />
      <SkeletonChart />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SkeletonList items={4} />
        <SkeletonList items={4} />
      </div>
    </div>
  );
}
