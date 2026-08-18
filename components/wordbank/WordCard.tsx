import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { masteryLabel, MASTERY_META } from "@/lib/srs";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { WordBankEntryWithStory, Translations } from "@/types";

export function WordCard({
  word,
  showStory = true,
  nativeLanguage = "ar",
  uiLanguage,
}: {
  word: WordBankEntryWithStory;
  showStory?: boolean;
  nativeLanguage?: string;
  uiLanguage?: string | null;
}) {
  const t = getAppCopy(uiLanguage);
  const masteryKey = masteryLabel(word.reviewCount, word.interval);
  const mastery = MASTERY_META[masteryKey];
  const due = word.dueDate <= new Date();
  const translation = getTranslation(word.translations as Translations, nativeLanguage);

  return (
    <div className="bg-ink-surface border border-white/[0.07] rounded-xl px-5 py-4 hover:border-brand-500/25 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <span className="text-cream font-semibold">{word.word}</span>
          <span
            className={cn("text-cream/60 ml-2", (nativeLanguage === "ar") && "font-arabic")}
            dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}
          >
            {translation}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {due && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" title={t.wordbank.dueForReview} />}
          <Badge variant={mastery.badge}>{t.common.mastery[masteryKey]}</Badge>
        </div>
      </div>
      <p className="text-sm text-cream/40 italic mb-2">{word.example}</p>
      {showStory && (
        <p className="text-xs text-cream/30">
          {t.wordbank.fromPrefix}<Link href={`/wordbank/story/${word.storyId}`} className="hover:text-brand-400">{word.story.title}</Link>
          {word.timesSeen > 1 && t.wordbank.seenTimes(word.timesSeen)}
        </p>
      )}
    </div>
  );
}
