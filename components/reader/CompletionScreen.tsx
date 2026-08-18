"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import { ShareCard } from "@/components/reader/ShareCard";
import type { LineResult } from "@/types";

interface CompletionScreenProps {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  results: LineResult[];
  totalXP: number;
  wpm: number;
  accuracy: number;
  onRetrace: () => void;
}

export function CompletionScreen({ storyId, storySlug, storyTitle, results, totalXP, wpm, accuracy, onRetrace }: CompletionScreenProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center gap-7 sm:gap-10 px-5 sm:px-6 py-16 sm:py-12 animate-scale-in">
      <div>
        <div className="text-4xl sm:text-5xl mb-4 sm:mb-5 text-brand-500">✦</div>
        <p className="text-sm text-brand-500 mb-2 tracking-wide">{t.reader.storyComplete}</p>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-bold text-cream text-balance">{storyTitle}</h1>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-sm">
        <Stat label={t.reader.score} value={`${accuracy}%`} />
        <Stat label={t.reader.xp} value={`+${totalXP}`} accent="amber" />
        <Stat label={t.reader.wpm} value={wpm} />
      </div>

      <p className="text-sm text-cream/40">{t.reader.linesRetraced(results.length)}</p>

      <div className="flex flex-col xs:flex-row gap-3 w-full max-w-sm xs:w-auto">
        <button
          type="button"
          onClick={onRetrace}
          className="bg-brand-500 text-ink font-semibold px-6 py-3.5 rounded-full shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 sm:hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        >
          {t.reader.retraceAgain}
        </button>
        <Link
          href="/library"
          className="text-cream/70 border border-white/15 font-medium px-6 py-3.5 rounded-full hover:bg-white/5 hover:text-cream transition-all duration-200 text-center"
        >
          {t.reader.goToLibrary}
        </Link>
      </div>

      <ShareCard storyId={storyId} storySlug={storySlug} storyTitle={storyTitle} score={accuracy} lines={results.length} wpm={wpm} />
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: "amber" }) {
  return (
    <div className="bg-white/5 rounded-xl px-2 sm:px-3 py-3.5 sm:py-4 border border-white/10 hover:border-brand-500/25 transition-colors duration-300">
      <p className="text-[11px] sm:text-xs text-cream/40 mb-1 truncate">{label}</p>
      <p className={cn("font-serif text-xl sm:text-2xl font-black", accent === "amber" ? "text-amber-300" : "text-brand-500")}>{value}</p>
    </div>
  );
}
