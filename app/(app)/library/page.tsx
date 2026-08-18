import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getPublishedStories } from "@/lib/queries";
import { StoryCard } from "@/components/progress/StoryCard";
import { StreakBanner } from "@/components/library/StreakBanner";
import { ContinueReadingCard } from "@/components/library/ContinueReadingCard";
import { NotificationPrompt } from "@/components/ui/NotificationPrompt";
import { getAppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Story Library" };

interface LibraryPageProps {
  searchParams: { difficulty?: string; topic?: string };
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  // Fire both immediately — storiesPromise doesn't depend on the user, and
  // progressRecords (below) only depends on user.id, not on stories.
  const storiesPromise = getPublishedStories(searchParams.difficulty, searchParams.topic);
  const user = await getCurrentUser();
  const isPro = user?.subscription?.tier === "PRO";

  const [stories, progressRecords, lastInProgress, firstUnstartedBeginner] = await Promise.all([
    storiesPromise,
    user ? db.storyProgress.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    user
      ? db.storyProgress.findFirst({
          where: { userId: user.id, completed: false, completedLines: { gt: 0 } },
          orderBy: { updatedAt: "desc" },
          include: { story: true },
        })
      : Promise.resolve(null),
    user
      ? db.story.findFirst({
          where: { difficulty: "BEGINNER", isPublished: true, progress: { none: { userId: user.id } } },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve(null),
  ]);

  const progressMap = new Map(progressRecords.map((p) => [p.storyId, p]));

  const difficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
  const t = getAppCopy(user?.uiLanguage);
  const locale = user?.nativeLanguage ?? "ar";

  // Streak banner: computed in UTC so "studied today" and the dismissal cookie's
  // scope agree regardless of the user's local timezone.
  const todayUTC = new Date().toISOString().slice(0, 10);
  const dismissCookieName = `streak_banner_dismissed_${todayUTC}`;
  const bannerDismissed = cookies().get(dismissCookieName)?.value === "1";

  const streak = user?.streak;
  const currentStreak = streak?.current ?? 0;
  const longestStreak = streak?.longest ?? 0;
  const lastActivityUTC = streak?.lastActivity ? new Date(streak.lastActivity).toISOString().slice(0, 10) : null;
  const studiedToday = lastActivityUTC === todayUTC;

  const continueHref = lastInProgress
    ? `/story/${lastInProgress.storyId}`
    : firstUnstartedBeginner
    ? `/story/${firstUnstartedBeginner.id}`
    : "/library";
  const startHref = firstUnstartedBeginner ? `/story/${firstUnstartedBeginner.id}` : "/library";

  return (
    <div>
      {user && !bannerDismissed && (
        <StreakBanner
          current={currentStreak}
          longest={longestStreak}
          studiedToday={studiedToday}
          continueHref={continueHref}
          startHref={startHref}
          dismissCookieName={dismissCookieName}
          uiLanguage={user?.uiLanguage}
        />
      )}

      <div className="mb-8 animate-fade-up">
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream mb-1.5">{t.library.title}</h1>
        <p className="text-[15px] text-cream/50">{t.library.subtitle}</p>
      </div>

      {lastInProgress && (
        <ContinueReadingCard story={lastInProgress.story} progress={lastInProgress} locale={locale} t={t} />
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-9 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <FilterChip href="/library" active={!searchParams.difficulty} label={t.library.allLevels} />
        {difficulties.map((d) => (
          <FilterChip
            key={d}
            href={`/library?difficulty=${d}`}
            active={searchParams.difficulty === d}
            label={t.common.difficulty[d]}
          />
        ))}
      </div>

      {stories.length === 0 ? (
        <div className="text-center py-24 text-cream/40 animate-fade-up">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-base font-medium text-cream/60 mb-2">{t.library.emptyTitle}</p>
          <p className="text-sm">{t.library.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {stories.map((story, i) => (
            <div key={story.id} className="animate-fade-up" style={{ animationDelay: `${140 + i * 60}ms` }}>
              <StoryCard
                story={story}
                progress={progressMap.get(story.id) ?? null}
                locked={story.isPremium && !isPro}
                locale={locale}
                uiLanguage={user?.uiLanguage}
              />
            </div>
          ))}
        </div>
      )}

      <NotificationPrompt uiLanguage={user?.uiLanguage} />
    </div>
  );
}

function FilterChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <a
      href={href}
      className={`text-sm px-4 py-2 rounded-full border transition-all duration-200 font-medium ${
        active
          ? "bg-brand-500 text-ink border-brand-500"
          : "bg-white/5 text-cream/50 border-white/10 hover:border-brand-500/40 hover:text-brand-400"
      }`}
    >
      {label}
    </a>
  );
}
