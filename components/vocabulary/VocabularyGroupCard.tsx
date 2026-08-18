import Link from "next/link";
import { cn } from "@/lib/cn";
import { difficultyLabel } from "@/lib/utils";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import type { VocabGroup, Translations } from "@/types";

export interface GroupCardData extends VocabGroup {
  wordCount: number;
  learnedCount: number;
  isPro: boolean;
}

export function VocabularyGroupCard({ group, locale = "ar", uiLanguage }: { group: GroupCardData; locale?: string; uiLanguage?: string | null }) {
  const t = getAppCopy(uiLanguage);
  const draft = !group.isPublished;
  const locked = !draft && group.isPremium && !group.isPro;
  const pct = group.wordCount > 0 ? Math.round((group.learnedCount / group.wordCount) * 100) : 0;
  const hasProgress = group.learnedCount > 0;
  const translatedName = getTranslation(group.titleTranslations as Translations, locale);
  const isArabicScript = locale === "ar";

  const inner = (
    <div
      className={cn(
        "bg-ink-surface border border-white/[0.08] rounded-xl p-5 transition-all duration-200 h-full flex flex-col",
        draft ? "opacity-50" : "hover:border-brand-500/30 hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn("text-3xl", draft && "grayscale")}>{group.emoji}</span>
        {draft ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 shrink-0">{t.vocabulary.comingSoon}</span>
        ) : locked ? (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-400/15 text-violet-300 shrink-0">{t.common.pro}</span>
        ) : (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400 shrink-0">{t.common.free}</span>
        )}
      </div>

      <p className="font-serif text-lg font-bold text-cream mb-0.5">{group.name}</p>
      <p className={cn("text-cream/40 text-sm mb-4", isArabicScript && "font-arabic")} dir={isRTL(locale) ? "rtl" : "ltr"}>
        {translatedName}
      </p>

      <div className="flex items-center justify-between mb-3 mt-auto">
        <span className="text-xs text-cream/40">{draft ? "—" : t.vocabulary.wordCount(group.wordCount)}</span>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            group.difficulty === "BEGINNER" && "bg-brand-500/15 text-brand-400",
            group.difficulty === "INTERMEDIATE" && "bg-amber-400/15 text-amber-300",
            group.difficulty === "ADVANCED" && "bg-rose-400/15 text-rose-300"
          )}
        >
          {difficultyLabel(group.difficulty, t.common.difficulty)}
        </span>
      </div>

      {draft ? (
        <p className="text-xs text-cream/30 flex items-center gap-1.5">
          {t.vocabulary.preparingGroup}
        </p>
      ) : locked ? (
        <p className="text-xs text-violet-300 font-medium">{t.vocabulary.upgradeToUnlock}</p>
      ) : hasProgress ? (
        <div>
          <div className="h-[3px] bg-white/[0.07] rounded-full overflow-hidden mb-1.5">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-cream/40">{t.vocabulary.learnedProgress(group.learnedCount, group.wordCount)}</p>
        </div>
      ) : (
        <p className="text-xs text-cream/30">{t.vocabulary.notStarted}</p>
      )}
    </div>
  );

  if (draft) return inner;
  return <Link href={locked ? "/settings" : `/vocabulary/${group.slug}`} className="block h-full">{inner}</Link>;
}
