import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LineResult } from "@/types";

interface CompletionScreenProps {
  storyTitle: string;
  results: LineResult[];
  totalXP: number;
  wpm: number;
  accuracy: number;
  onRetrace: () => void;
}

export function CompletionScreen({ storyTitle, results, totalXP, wpm, accuracy, onRetrace }: CompletionScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-10 px-6 animate-scale-in">
      <div>
        <div className="text-5xl mb-5 text-brand-500">✦</div>
        <p className="text-sm text-brand-500 mb-2 tracking-wide">Story complete</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-cream text-balance">{storyTitle}</h1>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
        <Stat label="Score" value={`${accuracy}%`} />
        <Stat label="XP" value={`+${totalXP}`} accent="amber" />
        <Stat label="WPM" value={wpm} />
      </div>

      <p className="text-sm text-cream/40">{results.length} lines retraced</p>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetrace}
          className="bg-brand-500 text-ink font-semibold px-6 py-3 rounded-full shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:-translate-y-0.5 transition-all duration-200"
        >
          Retrace again
        </button>
        <Link
          href="/library"
          className="text-cream/70 border border-white/15 font-medium px-6 py-3 rounded-full hover:bg-white/5 hover:text-cream transition-all duration-200"
        >
          Go to library
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "amber" }) {
  return (
    <div className="bg-white/5 rounded-xl px-3 py-4 border border-white/10 hover:border-brand-500/25 transition-colors duration-300">
      <p className="text-xs text-cream/40 mb-1">{label}</p>
      <p className={cn("font-serif text-2xl font-black", accent === "amber" ? "text-amber-300" : "text-brand-500")}>{value}</p>
    </div>
  );
}
