import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { masteryLabel, MASTERY_META, type MasteryLevel } from "@/lib/srs";
import { TOPICS, topicMeta } from "@/lib/topics";
import { WordBankSidebar } from "@/components/wordbank/WordBankSidebar";
import { TodayWordsStrip } from "@/components/wordbank/TodayWordsStrip";
import { MasteryBar } from "@/components/wordbank/MasteryBar";
import { TopicExplorer, type TopicStat } from "@/components/wordbank/TopicExplorer";
import { WordCard } from "@/components/wordbank/WordCard";
import { getAppCopy, type AppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Word bank" };

type Filter = "due" | "weak" | "mastered";

function filterMeta(t: AppCopy): Record<Filter, { label: string; sub: string }> {
  return {
    due:      { label: t.wordbank.dueForReview,   sub: t.wordbank.dueForReviewSub },
    weak:     { label: t.wordbank.weakWords,       sub: t.wordbank.weakWordsSub },
    mastered: { label: t.wordbank.masteredFilter,  sub: t.wordbank.masteredFilterSub },
  };
}

function aggregateMastery(items: MasteryLevel[]): MasteryLevel {
  const mastered = items.filter((m) => m === "mastered").length;
  const good = items.filter((m) => m === "good").length;
  if (mastered === items.length) return "mastered";
  if (mastered + good >= items.length / 2) return "good";
  return "learning";
}

export default async function WordBankPage({ searchParams }: { searchParams: { filter?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await requireUser();
  const isPro = user.subscription?.tier === "PRO";
  const t = getAppCopy(user.uiLanguage);

  const words = await db.wordBankEntry.findMany({
    where: { userId: user.id },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) {
    return (
      <div className="text-center py-24 text-cream/40">
        <div className="text-4xl mb-4">📖</div>
        <p className="text-lg mb-3 text-cream/70">{t.wordbank.emptyTitle}</p>
        <p className="text-sm mb-1">{t.wordbank.emptyBody}</p>
        <Link href="/library" className="text-brand-400 hover:underline text-sm">{t.wordbank.startCollecting}</Link>
      </div>
    );
  }

  const progressRecordsPromise = db.storyProgress.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { story: { select: { title: true } } },
  });

  const now = new Date();
  const withMastery = words.map((w) => ({ ...w, mastery: masteryLabel(w.reviewCount, w.interval) }));

  const dueCount = words.filter((w) => w.dueDate <= now).length;
  const masteryCounts: Record<MasteryLevel, number> = { new: 0, learning: 0, good: 0, mastered: 0 };
  for (const w of withMastery) masteryCounts[w.mastery]++;
  const weakCount = masteryCounts.learning;
  const masteredCount = masteryCounts.mastered;

  const todayWords = words.filter((w) => now.getTime() - new Date(w.createdAt).getTime() < 24 * 60 * 60 * 1000);

  // Known catalog topics, plus a catch-all bucket for any words whose story had no/unrecognised topic.
  const knownKeys = new Set(TOPICS.map((t) => t.key));
  const extraKeys = Array.from(new Set(words.map((w) => w.topic).filter((t): t is string => !!t && !knownKeys.has(t))));
  const allTopicMetas = [...TOPICS, ...extraKeys.map((k) => topicMeta(k))];

  const topicStats: TopicStat[] = allTopicMetas.map((meta) => {
    const inTopic = withMastery.filter((w) => w.topic === meta.key);
    const count = inTopic.length;
    const mastery = count > 0 ? aggregateMastery(inTopic.map((w) => w.mastery)) : null;
    const progressed = inTopic.filter((w) => w.mastery === "good" || w.mastery === "mastered").length;
    const pct = count > 0 ? Math.round((progressed / count) * 100) : 0;
    return { key: meta.key, label: meta.label, translations: meta.translations, emoji: meta.emoji, count, mastery, pct };
  });

  const progressRecords = await progressRecordsPromise;
  const recentStories = progressRecords.map((p) => ({
    id: p.storyId,
    title: p.story.title,
    count: words.filter((w) => w.storyId === p.storyId).length,
  }));

  const filter = (["due", "weak", "mastered"] as const).includes(searchParams.filter as Filter)
    ? (searchParams.filter as Filter)
    : undefined;

  let filteredWords: typeof withMastery = [];
  if (filter === "due") filteredWords = withMastery.filter((w) => w.dueDate <= now);
  else if (filter === "weak") filteredWords = withMastery.filter((w) => w.mastery === "learning");
  else if (filter === "mastered") filteredWords = withMastery.filter((w) => w.mastery === "mastered");

  const meta = filterMeta(t);

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-stretch lg:items-start">
      <WordBankSidebar
        totalCount={words.length}
        dueCount={dueCount}
        weakCount={weakCount}
        masteredCount={masteredCount}
        topics={topicStats.filter((ts) => ts.count > 0).map((ts) => ({ key: ts.key, count: ts.count }))}
        recentStories={recentStories}
        activeFilter={filter}
        uiLanguage={user.uiLanguage}
      />

      <div className="flex-1 min-w-0">
        {filter ? (
          <div className="mb-6">
            <Link href="/wordbank" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToAllTopics}</Link>
            <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream mt-2">{meta[filter].label}</h1>
            <p className="text-cream/50 mt-1">{meta[filter].sub}</p>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream">{t.wordbank.myWordsTitle}</h1>
            <p className="text-cream/50 mt-1">{t.wordbank.myWordsSubtitle}</p>
          </div>
        )}

        {dueCount > 0 && (
          <div className="mb-8 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <p className="text-cream font-semibold">{t.wordbank.wordsReadyToReview(dueCount)}</p>
              <p className="text-sm text-cream/50 mt-0.5">{t.wordbank.spacedRepetitionHint}</p>
            </div>
            {isPro ? (
              <Link href="/wordbank/flashcards" className="bg-brand-500 text-ink font-semibold text-sm px-5 py-3 rounded-lg hover:bg-brand-300 transition-colors shrink-0 text-center">
                {t.wordbank.startReviewSession}
              </Link>
            ) : (
              <Link href="/settings" className="border border-brand-500/40 text-brand-400 font-semibold text-sm px-5 py-3 rounded-lg hover:bg-brand-500/10 transition-colors shrink-0 text-center">
                {t.wordbank.upgradeToReview}
              </Link>
            )}
          </div>
        )}

        {!filter && <TodayWordsStrip words={todayWords} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />}
        {!filter && <MasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />}

        {filter ? (
          filteredWords.length === 0 ? (
            <p className="text-center py-16 text-cream/40 text-sm">{t.wordbank.noWordsInCategory}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredWords.map((w) => <WordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
            </div>
          )
        ) : (
          <TopicExplorer topics={topicStats} nativeLanguage={user.nativeLanguage} />
        )}
      </div>
    </div>
  );
}
