import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { VOCAB_MASTERY_META } from "@/lib/vocabSrs";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { VocabWordWithStory, VocabWordWithLine, Translations } from "@/types";

interface VocabularyWordCardProps {
  word: VocabWordWithStory | VocabWordWithLine;
  showStory?: boolean;
  nativeLanguage?: string;
  uiLanguage?: string | null;
}

const LOWER = { MASTERED: "mastered", GOOD: "good", LEARNING: "learning", NEW: "new" } as const;

export function VocabularyWordCard({ word, showStory = true, nativeLanguage = "ar", uiLanguage }: VocabularyWordCardProps) {
  const t = getAppCopy(uiLanguage);
  const meta = VOCAB_MASTERY_META[word.masteryLevel];
  const due = word.nextReviewAt <= new Date();
  const sentence = "line" in word ? word.line.text : null;
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
          <Badge variant={meta.badge}>{t.common.mastery[LOWER[word.masteryLevel]]}</Badge>
        </div>
      </div>
      {sentence && <p className="text-sm text-cream/40 italic mb-2">{sentence}</p>}
      {showStory && (
        <p className="text-xs text-cream/30">
          {t.wordbank.fromPrefix}<Link href={`/vocabulary/mine/story/${word.storyId}`} className="hover:text-brand-400">{word.story.title}</Link>
        </p>
      )}
    </div>
  );
}
