import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { difficultyColor, difficultyLabel, truncate } from "@/lib/utils";
import { getTranslation, isRTL } from "@/lib/languages";
import type { Story, StoryProgress, Translations } from "@/types";
import { cn } from "@/lib/cn";

interface StoryCardProps {
  story: Story & { tags: { tag: string }[] };
  progress?: StoryProgress | null;
  locked?: boolean;
  locale?: string;
}

const dotColor = { started: "bg-white/20", progress: "bg-brand-500", done: "bg-emerald-400" };

export function StoryCard({ story, progress, locked, locale = "ar" }: StoryCardProps) {
  const pct = progress
    ? Math.round((progress.completedLines / progress.totalLines) * 100)
    : 0;
  const isCompleted = progress?.completed ?? false;
  const status = isCompleted ? "done" : progress && pct > 0 ? "progress" : "started";
  const statusLabel = isCompleted ? "Completed" : progress && pct > 0 ? "In progress" : "Not started";
  const translatedTitle = getTranslation(story.titleTranslations as Translations, locale);
  const isArabicScript = locale === "ar";

  return (
    <Link
      href={locked ? "/settings" : `/story/${story.id}`}
      className={cn(
        "group flex flex-col bg-ink-surface rounded-xl border border-white/[0.07] overflow-hidden hover:border-brand-500/30 hover:shadow-[0_8px_32px_rgba(14,207,183,0.1)] hover:-translate-y-1 transition-all duration-300",
        locked && "opacity-60 cursor-pointer"
      )}
    >
      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-semibold text-[17px] leading-snug text-cream group-hover:text-brand-400 transition-colors">
            {story.title}
          </h3>
          <div className="flex flex-col items-end gap-1.5 shrink-0 mt-0.5">
            <Badge variant={story.difficulty === "BEGINNER" ? "brand" : story.difficulty === "INTERMEDIATE" ? "amber" : "rose"}>
              {difficultyLabel(story.difficulty)}
            </Badge>
            {locked && (
              <span className="text-xs text-cream/40 flex items-center gap-1">
                <LockIcon /> Pro
              </span>
            )}
          </div>
        </div>

        {translatedTitle && (
          <p
            className={cn("text-[15px] text-cream/35 text-center mb-3.5", isArabicScript && "font-arabic")}
            dir={isRTL(locale) ? "rtl" : "ltr"}
          >
            {translatedTitle}
          </p>
        )}

        {story.description && (
          <p className="text-sm text-cream/50 leading-relaxed mb-5">
            {truncate(story.description, 100)}
          </p>
        )}
      </div>

      <div className="h-px bg-white/[0.07] mx-5" />

      <div className="px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full", dotColor[status])} />
          <span className="text-[13px] text-cream/40">{statusLabel}</span>
        </div>
        <span className="text-[13px] text-cream/40">{story.wordCount} words</span>
      </div>

      {(progress || isCompleted) && (
        <div className="h-[3px] bg-white/[0.07] mx-5 mb-4 rounded-full overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all duration-500", isCompleted ? "bg-brand-400" : "bg-brand-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </Link>
  );
}

function LockIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
