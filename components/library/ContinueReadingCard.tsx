import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { StoryCover } from "@/components/library/StoryCover";
import { difficultyLabel } from "@/lib/utils";
import { getTranslation, isRTL } from "@/lib/languages";
import type { AppCopy } from "@/lib/i18n/app";
import type { Story, StoryProgress, Translations } from "@/types";
import { cn } from "@/lib/cn";

interface ContinueReadingCardProps {
  story: Story;
  progress: StoryProgress;
  locale: string;
  t: AppCopy;
}

export function ContinueReadingCard({ story, progress, locale, t }: ContinueReadingCardProps) {
  const pct = progress.totalLines > 0 ? Math.round((progress.completedLines / progress.totalLines) * 100) : 0;
  const translatedTitle = getTranslation(story.titleTranslations as Translations, locale);
  const remainingLines = Math.max(progress.totalLines - progress.completedLines, 0);
  const rawMinutes = remainingLines * 0.5;
  const minutesLeft = Math.round(rawMinutes * 2) / 2;
  const minutesLabel = Number.isInteger(minutesLeft) ? `${minutesLeft}` : minutesLeft.toFixed(1);

  return (
    <div className="mb-9 animate-fade-up" style={{ animationDelay: "100ms" }}>
      <p className="text-xs font-semibold uppercase tracking-wide text-cream/40 mb-2.5">{t.continueReading.label}</p>
      <div
        className="flex flex-col sm:flex-row sm:items-center gap-5 rounded-xl border border-white/15 border-l-[3px] border-l-brand-500 bg-white/[0.045] px-5 py-5"
      >
        <StoryCover
          src={story.coverImage}
          topic={story.topic}
          alt={story.title}
          sizes="112px"
          emojiClassName="text-3xl"
          className="group hidden sm:block h-[72px] w-[112px] shrink-0 rounded-lg"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-lg text-cream truncate">{story.title}</h3>
            <Badge variant={story.difficulty === "BEGINNER" ? "brand" : story.difficulty === "INTERMEDIATE" ? "amber" : "rose"}>
              {difficultyLabel(story.difficulty, t.common.difficulty)}
            </Badge>
          </div>
          {translatedTitle && (
            <p
              className={cn("text-sm text-cream/40 mb-2", locale === "ar" && "font-arabic")}
              dir={isRTL(locale) ? "rtl" : "ltr"}
            >
              {translatedTitle}
            </p>
          )}
          <p className="text-[13px] text-cream/50 mb-2.5">{t.reader.lineOf(progress.currentLine, progress.totalLines)}</p>

          <div className="h-1.5 bg-white/[0.08] rounded-full overflow-hidden max-w-sm">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-cream/35 mt-2">{t.continueReading.minutesLeft(minutesLabel)}</p>
        </div>

        <Link
          href={`/story/${story.id}`}
          className="shrink-0 bg-brand-500 text-ink font-semibold text-base px-6 py-3 rounded-full shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-0.5 transition-all duration-200 text-center"
        >
          {t.continueReading.cta}
        </Link>
      </div>
    </div>
  );
}
