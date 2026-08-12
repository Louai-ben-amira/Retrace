"use client";

import { cn } from "@/lib/cn";

interface LanguageCardProps {
  flag: string;
  name: string;
  selected?: boolean;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}

export function LanguageCard({ flag, name, selected, disabled, badge, onClick }: LanguageCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative flex flex-col items-center justify-center gap-2 rounded-xl border px-4 py-5 transition-all duration-200",
        disabled
          ? "border-white/[0.06] bg-white/[0.02] opacity-40 cursor-not-allowed"
          : selected
          ? "border-brand-500/60 bg-brand-500/10 shadow-[0_0_0_1px_rgba(14,207,183,0.3)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]"
      )}
    >
      <span className="text-3xl" aria-hidden>{flag}</span>
      <span className={cn("text-sm font-medium", selected ? "text-cream" : "text-cream/70")}>{name}</span>
      {badge && (
        <span className="absolute -top-2 right-2 text-[10px] font-semibold uppercase tracking-wide bg-white/10 text-cream/50 px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
