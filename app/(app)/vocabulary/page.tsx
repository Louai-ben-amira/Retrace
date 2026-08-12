import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { VocabularyGroupCard, type GroupCardData } from "@/components/vocabulary/VocabularyGroupCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vocabulary groups" };

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export default async function VocabularyGroupsPage({ searchParams }: { searchParams: { difficulty?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [user, groups] = await Promise.all([
    getCurrentUser(),
    db.vocabGroup.findMany({
      where: searchParams.difficulty ? { difficulty: searchParams.difficulty as (typeof DIFFICULTIES)[number] } : undefined,
      include: { _count: { select: { words: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  if (!user) redirect("/login");
  const isPro = user.subscription?.tier === "PRO";

  const learnedCounts = await db.vocabGroupProgress.groupBy({
    by: ["groupId"],
    where: { userId: user.id, learned: true },
    _count: { _all: true },
  });
  const learnedMap = new Map(learnedCounts.map((l) => [l.groupId, l._count._all]));

  const cards: GroupCardData[] = groups.map((g) => ({
    ...g,
    wordCount: g._count.words,
    learnedCount: learnedMap.get(g.id) ?? 0,
    isPro,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-[28px] font-bold tracking-tight text-cream">Vocabulary groups</h1>
        <a href="/vocabulary/mine" className="text-sm text-brand-400 hover:text-brand-300 hover:underline">My words →</a>
      </div>
      <p className="text-cream/50 mb-8">Curated word lists by topic — study them, then find them in real stories.</p>

      <div className="flex flex-wrap gap-2 mb-9">
        <FilterChip href="/vocabulary" active={!searchParams.difficulty} label="All levels" />
        {DIFFICULTIES.map((d) => (
          <FilterChip
            key={d}
            href={`/vocabulary?difficulty=${d}`}
            active={searchParams.difficulty === d}
            label={d.charAt(0) + d.slice(1).toLowerCase()}
          />
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-24 text-cream/40">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-base font-medium text-cream/60 mb-2">No groups at this level yet</p>
          <p className="text-sm">More coming soon — try another level for now.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((group) => <VocabularyGroupCard key={group.id} group={group} locale={user.nativeLanguage} />)}
        </div>
      )}
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
