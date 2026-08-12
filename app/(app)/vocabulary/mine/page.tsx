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
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My words" };

type Filter = "due" | "weak" | "mastered";

const FILTER_META: Record<Filter, { label: string; sub: string }> = {
  due:      { label: "Due for review", sub: "Words waiting for their next spaced-repetition pass." },
  weak:     { label: "Weak words",     sub: "Actively being learned, but not solid yet." },
  mastered: { label: "Mastered",       sub: "Long intervals, well retained." },
};

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

  const words = await db.vocabWord.findMany({
    where: { userId: user.id },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) {
    return (
      <div className="text-center py-24 text-cream/40">
        <div className="text-4xl mb-4">📖</div>
        <p className="text-lg mb-3 text-cream/70">Your vocabulary is empty.</p>
        <p className="text-sm mb-1">Words are never added manually — every word you type correctly in a story is saved here automatically.</p>
        <Link href="/library" className="text-brand-400 hover:underline text-sm">Start a story to begin collecting words →</Link>
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

  return (
    <div className="flex gap-8 items-start">
      <VocabularySidebar
        totalCount={words.length}
        dueCount={dueCount}
        weakCount={weakCount}
        masteredCount={masteredCount}
        topics={topicStats.filter((t) => t.count > 0).map((t) => ({ key: t.key, count: t.count }))}
        recentStories={recentStories}
        activeFilter={filter}
      />

      <div className="flex-1 min-w-0">
        <Link href="/vocabulary" className="text-sm text-cream/40 hover:text-cream/70">← Vocabulary groups</Link>

        {filter ? (
          <div className="mb-6 mt-2">
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream">{FILTER_META[filter].label}</h1>
            <p className="text-cream/50 mt-1">{FILTER_META[filter].sub}</p>
          </div>
        ) : (
          <div className="mb-6 mt-2">
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream">My words</h1>
            <p className="text-cream/50 mt-1">Every word you&apos;ve typed and learned, collected automatically.</p>
          </div>
        )}

        {dueCount > 0 && (
          <div className="mb-8 rounded-xl border border-brand-500/25 bg-brand-500/10 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-cream font-semibold">{dueCount} word{dueCount === 1 ? "" : "s"} ready to review</p>
              <p className="text-sm text-cream/50 mt-0.5">Spaced repetition keeps them fresh in memory.</p>
            </div>
            <Link href="/vocabulary/mine/review" className="bg-brand-500 text-ink font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-300 transition-colors shrink-0">
              Start review session →
            </Link>
          </div>
        )}

        {!filter && <VocabularyTodayStrip words={todayWords} nativeLanguage={user.nativeLanguage} />}
        {!filter && <VocabularyMasteryBar counts={masteryCounts} total={words.length} />}

        {filter ? (
          filteredWords.length === 0 ? (
            <p className="text-center py-16 text-cream/40 text-sm">No words in this category yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredWords.map((w) => <VocabularyWordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} />)}
            </div>
          )
        ) : (
          <VocabularyTopicExplorer topics={topicStats} nativeLanguage={user.nativeLanguage} />
        )}
      </div>
    </div>
  );
}
