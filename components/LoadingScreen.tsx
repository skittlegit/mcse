"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";

/* ── Seeded RNG + chart path ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateChartPath(w: number, h: number, points: number): string {
  const rng = seededRandom(42);
  const step = w / (points - 1);
  const pts: [number, number][] = [];
  let y = h * 0.5;
  for (let i = 0; i < points; i++) {
    y += (rng() - 0.42) * (h * 0.18);
    y = Math.max(h * 0.1, Math.min(h * 0.9, y));
    pts.push([i * step, y]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const cp1x = pts[i - 1][0] + step * 0.4;
    const cp1y = pts[i - 1][1];
    const cp2x = pts[i][0] - step * 0.4;
    const cp2y = pts[i][1];
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${pts[i][0]} ${pts[i][1]}`;
  }
  return d;
}

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0); // 0=boot 1=chart 2=text 3=exit
  const [scrambledText, setScrambledText] = useState("MCSE");
  const rafRef = useRef<number>(0);
  const scrambleRef = useRef<number>(0);

  const chartPath = useMemo(() => generateChartPath(600, 120, 30), []);

  // Phase timeline
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase(1), 200));
    timers.push(setTimeout(() => setPhase(2), 900));
    timers.push(setTimeout(() => setPhase(3), 2000));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Progress bar
  useEffect(() => {
    const start = performance.now();
    const dur = 1800;
    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / dur) * 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Text scramble effect
  useEffect(() => {
    if (phase < 2) return;
    const target = "MCSE";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%";
    let iteration = 0;
    const maxIterations = 12;
    const run = () => {
      const result = target
        .split("")
        .map((char, i) => {
          if (iteration / 3 > i) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setScrambledText(result);
      iteration++;
      if (iteration < maxIterations) {
        scrambleRef.current = window.setTimeout(run, 50);
      }
    };
    run();
    return () => clearTimeout(scrambleRef.current);
  }, [phase]);

  // Exit
  const stableOnDone = useCallback(onDone, [onDone]);
  useEffect(() => {
    if (phase !== 3) return;
    const t = setTimeout(stableOnDone, 600);
    return () => clearTimeout(t);
  }, [phase, stableOnDone]);

  return (
    <div className={`ld-screen${phase === 3 ? " ld-exit" : ""}`}>
      <div className="ld-grain" />
      <div className="ld-scanline" />
      <div className="ld-grid" />

      <div className="ld-inner">
        {/* Rapid data flash at boot */}
        <div className={`ld-dataflash ${phase >= 1 ? "ld-dataflash-done" : ""}`}>
          {["SYS.INIT", "LOAD MARKET_DATA", "CONNECT EXCHANGE", "VERIFY PROTOCOL"].map(
            (line, i) => (
              <div
                key={i}
                className="ld-dataline"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <span className="ld-dataline-prefix">&gt;</span> {line}
                <span
                  className="ld-dataline-ok"
                  style={{ animationDelay: `${i * 120 + 80}ms` }}
                >
                  OK
                </span>
              </div>
            )
          )}
        </div>

        {/* Chart SVG */}
        <div className={`ld-chart ${phase >= 1 ? "ld-chart-visible" : ""}`}>
          <svg viewBox="0 0 600 120" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d={`${chartPath} L 600 120 L 0 120 Z`}
              fill="url(#chartGrad)"
              className="ld-chart-area"
            />
            <path
              d={chartPath}
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.5"
              className="ld-chart-line"
            />
          </svg>
        </div>

        {/* MCSE title */}
        <div className={`ld-title-row ${phase >= 2 ? "ld-title-visible" : ""}`}>
          <p className="ld-mcse">{scrambledText}</p>
          <p className="ld-subtitle">MATH CLUB STOCK EXCHANGE</p>
        </div>

        {/* Progress */}
        <div className="ld-progress-wrap">
          <div className="ld-progress-track">
            <div className="ld-progress-bar ld-progress-bar-animate" />
          </div>
          <span className="ld-progress-pct">{Math.floor(progress)}%</span>
        </div>
      </div>
    </div>
  );
}
