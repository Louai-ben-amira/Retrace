import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { VocabWord, Translations } from "@/types";

export function VocabularyTodayStrip({
  words,
  nativeLanguage = "ar",
  uiLanguage,
}: {
  words: VocabWord[];
  nativeLanguage?: string;
  uiLanguage?: string | null;
}) {
  if (words.length === 0) return null;
  const t = getAppCopy(uiLanguage);
  const now = new Date();
  const isArabicScript = nativeLanguage === "ar";

  return (
    <div className="mb-8">
      <h2 className="text-sm font-semibold text-cream/50 uppercase tracking-wide mb-3">{t.wordbank.todaysWords}</h2>
      <div className="flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {words.map((w) => {
          const due = w.nextReviewAt <= now;
          return (
            <div
              key={w.id}
              className="flex-none flex items-center gap-2 bg-ink-surface border border-white/[0.08] rounded-full pl-4 pr-3 py-2"
            >
              <span className="text-sm text-cream font-medium">{w.word}</span>
              <span className={cn("text-sm text-cream/50", isArabicScript && "font-arabic")} dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}>
                {getTranslation(w.translations as Translations, nativeLanguage)}
              </span>
              {due && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" title={t.wordbank.dueForReview} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
