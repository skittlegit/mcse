"use client";

import { useId, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";

export default function Sparkline({
  data,
  width = 80,
  height = 28,
  strokeWidth = 1.5,
  color,
  positive,
  interactive,
  labels,
  baseline,
}: {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  positive?: boolean;
  interactive?: boolean;
  labels?: string[];
  baseline?: number;
}) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Interactive hover handler
  const getIndexFromEvent = useCallback(
    (clientX: number) => {
      const svg = svgRef.current;
      if (!svg) return null;
      const rect = svg.getBoundingClientRect();
      const relX = (clientX - rect.left) / rect.width;
      const idx = Math.round(relX * (data.length - 1));
      return Math.max(0, Math.min(data.length - 1, idx));
    },
    [data.length]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!interactive) return;
      const idx = getIndexFromEvent(e.clientX);
      setHoverIndex(idx);
    },
    [interactive, getIndexFromEvent]
  );

  const handlePointerLeave = useCallback(() => {
    setHoverIndex(null);
  }, []);

  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const topPad = interactive ? 32 : padding;

  // Auto-detect trend if not explicitly set
  const isPositive = positive ?? data[data.length - 1] >= data[0];
  const strokeColor = color ?? (isPositive ? "var(--color-up)" : "var(--color-down)");
  const fillColor = isPositive ? "rgba(0,210,106,0.08)" : "rgba(255,82,82,0.08)";

  // Build smooth cubic bezier path
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * (width - padding * 2) + padding,
    y: height - padding - ((v - min) / range) * (height - topPad - padding),
  }));

  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
    const cpx2 = curr.x - (curr.x - prev.x) * 0.4;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaD = `${d} L ${pts[pts.length - 1].x} ${height} L ${pts[0].x} ${height} Z`;
  const gradId = `spark-grad-${id}`;

  // Baseline Y position
  const baselineY = baseline != null
    ? height - padding - ((baseline - min) / range) * (height - topPad - padding)
    : null;

  const hPt = hoverIndex != null ? pts[hoverIndex] : null;
  const hVal = hoverIndex != null ? data[hoverIndex] : null;
  const hLabel = hoverIndex != null && labels ? labels[hoverIndex] : null;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Sparkline chart: ${isPositive ? "trending up" : "trending down"}`}
      className="block overflow-visible"
      style={{ maxWidth: '100%', height: 'auto', touchAction: interactive ? 'none' : undefined }}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerLeave={interactive ? handlePointerLeave : undefined}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>

      {/* Baseline dotted line */}
      {baselineY != null && (
        <line
          x1={padding}
          y1={baselineY}
          x2={width - padding}
          y2={baselineY}
          stroke="white"
          strokeOpacity={0.15}
          strokeWidth={0.8}
          strokeDasharray="4 3"
        />
      )}

      <motion.path
        d={areaD}
        fill={`url(#${gradId})`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      />
      <motion.path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      />

      {/* Interactive tooltip overlay */}
      {interactive && hPt && hVal != null && (
        <>
          {/* Vertical guide line */}
          <line
            x1={hPt.x}
            y1={topPad - 4}
            x2={hPt.x}
            y2={height}
            stroke="white"
            strokeOpacity={0.2}
            strokeWidth={0.7}
            strokeDasharray="3 2"
          />
          {/* Dot on curve */}
          <circle
            cx={hPt.x}
            cy={hPt.y}
            r={3}
            fill={strokeColor}
            stroke="white"
            strokeWidth={1.2}
            strokeOpacity={0.5}
          />
          {/* Price label */}
          <text
            x={hPt.x}
            y={topPad - 14}
            textAnchor="middle"
            fill="white"
            fontSize={14}
            fontWeight={600}
            fontFamily="var(--font-inter), sans-serif"
          >
            {"\u20B9"}{hVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </text>
          {/* Time label */}
          {hLabel && (
            <text
              x={hPt.x}
              y={topPad - 3}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.4}
              fontSize={10}
              fontFamily="var(--font-inter), sans-serif"
            >
              {hLabel}
            </text>
          )}
        </>
      )}
    </svg>
  );
}
