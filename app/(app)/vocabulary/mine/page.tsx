import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { MasteryLevel } from "@/lib/vocabSrs";
import { TOPICS, topicMeta } from "@/lib/topics";
import { VocabularySidebar } from "@/components/vocabulary/VocabularySidebar";
import { VocabularyTodayStrip } from "@/components/vocabulary/VocabularyTodayStrip";
import { VocabularyMasteryBar } from "@/components/vocabulary/VocabularyMasteryBar";
import { VocabularyTopicExplorer, type VocabTopicStat } from "@/components/vocabulary/VocabularyTopicExplorer";
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard";
import { getAppCopy, type AppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My words" };

type Filter = "due" | "weak" | "mastered";

function filterMeta(t: AppCopy): Record<Filter, { label: string; sub: string }> {
  return {
    due:      { label: t.wordbank.dueForReview,   sub: t.wordbank.dueForReviewSub },
    weak:     { label: t.wordbank.weakWords,       sub: t.wordbank.weakWordsSub },
    mastered: { label: t.wordbank.masteredFilter,  sub: t.wordbank.masteredFilterSub },
  };
}

function aggregateMastery(levels: MasteryLevel[]): MasteryLevel {
  const mastered = levels.filter((m) => m === "MASTERED").length;
  const good = levels.filter((m) => m === "GOOD").length;
  if (mastered === levels.length) return "MASTERED";
  if (mastered + good >= levels.length / 2) return "GOOD";
  return "LEARNING";
}

export default async function VocabularyPage({ searchParams }: { searchParams: { filter?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const t = getAppCopy(user.uiLanguage);

  const words = await db.vocabWord.findMany({
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
  const dueCount = words.filter((w) => w.nextReviewAt <= now).length;

  const masteryCounts: Record<MasteryLevel, number> = { NEW: 0, LEARNING: 0, GOOD: 0, MASTERED: 0 };
  for (const w of words) masteryCounts[w.masteryLevel]++;
  const weakCount = masteryCounts.LEARNING;
  const masteredCount = masteryCounts.MASTERED;

  const todayWords = words.filter((w) => now.getTime() - new Date(w.createdAt).getTime() < 24 * 60 * 60 * 1000);

  const knownKeys = new Set(TOPICS.map((t) => t.key));
  const extraKeys = Array.from(new Set(words.map((w) => w.topic).filter((t): t is string => !!t && !knownKeys.has(t))));
  const allTopicMetas = [...TOPICS, ...extraKeys.map((k) => topicMeta(k))];

  const topicStats: VocabTopicStat[] = allTopicMetas.map((meta) => {
    const inTopic = words.filter((w) => w.topic === meta.key);
    const count = inTopic.length;
    const mastery = count > 0 ? aggregateMastery(inTopic.map((w) => w.masteryLevel)) : null;
    const progressed = inTopic.filter((w) => w.masteryLevel === "GOOD" || w.masteryLevel === "MASTERED").length;
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

  let filteredWords: typeof words = [];
  if (filter === "due") filteredWords = words.filter((w) => w.nextReviewAt <= now);
  else if (filter === "weak") filteredWords = words.filter((w) => w.masteryLevel === "LEARNING");
  else if (filter === "mastered") filteredWords = words.filter((w) => w.masteryLevel === "MASTERED");

  const meta = filterMeta(t);

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 items-stretch lg:items-start">
      <VocabularySidebar
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
        <Link href="/vocabulary" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToGroups}</Link>

        {filter ? (
          <div className="mb-6 mt-2">
            <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream">{meta[filter].label}</h1>
            <p className="text-cream/50 mt-1">{meta[filter].sub}</p>
          </div>
        ) : (
          <div className="mb-6 mt-2">
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
            <Link href="/vocabulary/mine/review" className="bg-brand-500 text-ink font-semibold text-sm px-5 py-3 rounded-lg hover:bg-brand-300 transition-colors shrink-0 text-center">
              {t.wordbank.startReviewSession}
            </Link>
          </div>
        )}

        {!filter && <VocabularyTodayStrip words={todayWords} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />}
        {!filter && <VocabularyMasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />}

        {filter ? (
          filteredWords.length === 0 ? (
            <p className="text-center py-16 text-cream/40 text-sm">{t.wordbank.noWordsInCategory}</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredWords.map((w) => <VocabularyWordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
            </div>
          )
        ) : (
          <VocabularyTopicExplorer topics={topicStats} nativeLanguage={user.nativeLanguage} />
        )}
      </div>
    </div>
  );
}
