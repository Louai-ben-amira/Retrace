import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VocabularyGroupCard, type GroupCardData } from "@/components/vocabulary/VocabularyGroupCard";
import { getAppCopy } from "@/lib/i18n/app";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vocabulary groups" };

const DIFFICULTIES = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

export default async function VocabularyGroupsPage({ searchParams }: { searchParams: { difficulty?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [user, groups] = await Promise.all([
    requireUser(),
    db.vocabGroup.findMany({
      where: searchParams.difficulty ? { difficulty: searchParams.difficulty as (typeof DIFFICULTIES)[number] } : undefined,
      include: { _count: { select: { words: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);
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
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream">{t.vocabulary.pageTitle}</h1>
        <a href="/vocabulary/mine" className="text-sm text-brand-400 hover:text-brand-300 hover:underline">{t.vocabulary.myWords}</a>
      </div>
      <p className="text-cream/50 mb-8">{t.vocabulary.pageSubtitle}</p>

      <div className="flex flex-wrap gap-2 mb-9">
        <FilterChip href="/vocabulary" active={!searchParams.difficulty} label={t.library.allLevels} />
        {DIFFICULTIES.map((d) => (
          <FilterChip
            key={d}
            href={`/vocabulary?difficulty=${d}`}
            active={searchParams.difficulty === d}
            label={t.common.difficulty[d]}
          />
        ))}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-24 text-cream/40">
          <div className="text-4xl mb-4">📖</div>
          <p className="text-base font-medium text-cream/60 mb-2">{t.library.emptyTitle}</p>
          <p className="text-sm">{t.library.emptySubtitle}</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((group) => <VocabularyGroupCard key={group.id} group={group} locale={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
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
