"use client";

interface Props {
  ranges: string[];
  active: string;
  onChange: (range: string) => void;
}

export default function TimeRangeTabs({ ranges, active, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            active === r
              ? "bg-accent text-white"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
