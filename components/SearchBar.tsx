import { Search, SlidersHorizontal } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: Props) {
  return (
    <div className="flex items-center gap-2 bg-bg rounded-full px-4 py-2.5">
      <Search size={18} className="text-text-secondary shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-secondary"
      />
      <button className="text-text-secondary hover:text-text-primary">
        <SlidersHorizontal size={18} />
      </button>
    </div>
  );
}
