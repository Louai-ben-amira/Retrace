import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { masteryLabel, MASTERY_META, type MasteryLevel } from "@/lib/srs";
import { TOPICS, topicMeta } from "@/lib/topics";
import { WordBankSidebar } from "@/components/wordbank/WordBankSidebar";
import { TodayWordsStrip } from "@/components/wordbank/TodayWordsStrip";
import { MasteryBar } from "@/components/wordbank/MasteryBar";
import { TopicExplorer, type TopicStat } from "@/components/wordbank/TopicExplorer";
import { WordCard } from "@/components/wordbank/WordCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Word bank" };

type Filter = "due" | "weak" | "mastered";

const FILTER_META: Record<Filter, { label: string; sub: string }> = {
  due:      { label: "Due for review", sub: "Words waiting for their next spaced-repetition pass." },
  weak:     { label: "Weak words",     sub: "Actively being learned, but not solid yet." },
  mastered: { label: "Mastered",       sub: "Long intervals, well retained." },
};

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

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const isPro = user.subscription?.tier === "PRO";

  const words = await db.wordBankEntry.findMany({
    where: { userId: user.id },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) {
    return (
      <div className="text-center py-24 text-cream/40">
        <div className="text-4xl mb-4">📖</div>
        <p className="text-lg mb-3 text-cream/70">Your word bank is empty.</p>
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

  return (
    <div className="flex gap-8 items-start">
      <WordBankSidebar
        totalCount={words.length}
        dueCount={dueCount}
        weakCount={weakCount}
        masteredCount={masteredCount}
        topics={topicStats.filter((t) => t.count > 0).map((t) => ({ key: t.key, count: t.count }))}
        recentStories={recentStories}
        activeFilter={filter}
      />

      <div className="flex-1 min-w-0">
        {filter ? (
          <div className="mb-6">
            <Link href="/wordbank" className="text-sm text-cream/40 hover:text-cream/70">← All topics</Link>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream mt-2">{FILTER_META[filter].label}</h1>
            <p className="text-cream/50 mt-1">{FILTER_META[filter].sub}</p>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream">Word bank</h1>
            <p className="text-cream/50 mt-1">Every word you&apos;ve typed and learned, collected automatically.</p>
          </div>
        )}

        {dueCount > 0 && (
          <div className="mb-8 rounded-xl border border-brand-500/25 bg-brand-500/10 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-cream font-semibold">{dueCount} word{dueCount === 1 ? "" : "s"} ready to review</p>
              <p className="text-sm text-cream/50 mt-0.5">Spaced repetition keeps them fresh in memory.</p>
            </div>
            {isPro ? (
              <Link href="/wordbank/flashcards" className="bg-brand-500 text-ink font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-300 transition-colors shrink-0">
                Start review session →
              </Link>
            ) : (
              <Link href="/settings" className="border border-brand-500/40 text-brand-400 font-semibold text-sm px-5 py-2.5 rounded-lg hover:bg-brand-500/10 transition-colors shrink-0">
                Upgrade to Pro to review →
              </Link>
            )}
          </div>
        )}

        {!filter && <TodayWordsStrip words={todayWords} nativeLanguage={user.nativeLanguage} />}
        {!filter && <MasteryBar counts={masteryCounts} total={words.length} />}

        {filter ? (
          filteredWords.length === 0 ? (
            <p className="text-center py-16 text-cream/40 text-sm">No words in this category yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredWords.map((w) => <WordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} />)}
            </div>
          )
        ) : (
          <TopicExplorer topics={topicStats} nativeLanguage={user.nativeLanguage} />
        )}
      </div>
    </div>
  );
}
