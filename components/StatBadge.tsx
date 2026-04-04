import { TrendingUp, TrendingDown } from "lucide-react";

interface Props {
  value: number;
  className?: string;
}

export default function StatBadge({ value, className = "" }: Props) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
        positive
          ? "bg-accent-light text-accent"
          : "bg-red-50 text-negative"
      } ${className}`}
    >
      {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}
