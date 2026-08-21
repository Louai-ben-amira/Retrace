import Link from "next/link";
import { StoryCover } from "@/components/library/StoryCover";
import { difficultyLabel } from "@/lib/utils";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import type { Story, StoryProgress, Translations } from "@/types";
import { cn } from "@/lib/cn";

interface StoryCardProps {
  story: Story & { tags: { tag: string }[] };
  progress?: StoryProgress | null;
  locked?: boolean;
  locale?: string;
  uiLanguage?: string | null;
  /** Set on the first row of the grid so its artwork is not lazy-loaded. */
  priority?: boolean;
}

const dotColor = { started: "bg-white/25", progress: "bg-brand-500", done: "bg-emerald-400" };
const pctColor = { started: "text-cream/30", progress: "text-brand-400", done: "text-emerald-400" };

// Badges sit on top of photography, so they carry their own dark backdrop rather than the
// translucent fills the flat Badge component uses.
const badgeStyle = {
  BEGINNER: "bg-brand-500/90 text-ink",
  INTERMEDIATE: "bg-amber-400/90 text-ink",
  ADVANCED: "bg-violet-400/90 text-ink",
} as const;

export function StoryCard({ story, progress, locked, locale = "ar", uiLanguage, priority }: StoryCardProps) {
  const t = getAppCopy(uiLanguage);
  const pct = progress && progress.totalLines > 0
    ? Math.round((progress.completedLines / progress.totalLines) * 100)
    : 0;
  const isCompleted = progress?.completed ?? false;
  // Completion is a fact, not a ratio — once a story is marked done, the bar should always
  // read as fully finished even if completedLines/totalLines has drifted slightly (e.g. the
  // story's line count changed after someone started it).
  const displayPct = isCompleted ? 100 : pct;
  const status = isCompleted ? "done" : progress && pct > 0 ? "progress" : "started";
  const statusLabel = isCompleted
    ? t.library.completed
    : progress && pct > 0
    ? t.reader.lineOf(progress!.currentLine, progress!.totalLines)
    : t.library.notStarted;
  const translatedTitle = getTranslation(story.titleTranslations as Translations, locale);
  const isArabicScript = locale === "ar";

  return (
    <Link
      href={locked ? "/settings" : `/story/${story.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-ink-surface",
        "transition-all duration-300 hover:-translate-y-1 hover:border-brand-500/30 hover:shadow-[0_8px_32px_rgba(14,207,183,0.1)]",
        locked && "hover:border-violet-400/30 hover:shadow-[0_8px_32px_rgba(167,139,250,0.12)]"
      )}
    >
      <div className="relative">
        <StoryCover
          src={story.coverImage}
          topic={story.topic}
          alt={story.title}
          priority={priority}
          className={cn("aspect-[16/10] w-full", locked && "opacity-65")}
        />

        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-[0_2px_10px_rgba(0,0,0,0.35)]",
            badgeStyle[story.difficulty]
          )}
        >
          {difficultyLabel(story.difficulty, t.common.difficulty)}
        </span>

        {locked && (
          <span
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-ink/60 text-violet-300 backdrop-blur-sm"
            title={t.common.pro}
          >
            <LockIcon />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <h3 className="font-serif text-[19px] font-bold leading-snug text-cream transition-colors group-hover:text-brand-400">
          {story.title}
        </h3>

        {translatedTitle && (
          <p
            className={cn("mt-1 text-[15px] text-cream/40", isArabicScript && "font-arabic")}
            dir={isRTL(locale) ? "rtl" : "ltr"}
          >
            {translatedTitle}
          </p>
        )}

        <div className="mt-auto pt-4">
          {locked ? (
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-violet-300">
              <LockIcon /> {t.vocabulary.upgradeToUnlock}
            </p>
          ) : (
            <>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn("h-2 w-2 shrink-0 rounded-full", dotColor[status])} />
                  <span className="truncate text-[13px] text-cream/45">{statusLabel}</span>
                </span>
                <span className={cn("shrink-0 text-[13px] font-semibold tabular-nums", pctColor[status])}>
                  {displayPct}%
                </span>
              </div>

              <div className="h-[3px] overflow-hidden rounded-full bg-white/[0.07]">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    isCompleted ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-brand-500"
                  )}
                  style={{ width: `${displayPct}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mx-5 h-px bg-white/[0.06]" />

      <div className="flex items-center gap-1.5 px-5 py-3 text-[13px] text-cream/40">
        <PagesIcon />
        {t.common.words(story.wordCount)}
      </div>
    </Link>
  );
}

function LockIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function PagesIcon() {
  return (
    <svg className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
