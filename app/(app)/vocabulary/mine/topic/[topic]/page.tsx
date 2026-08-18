import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { MasteryLevel } from "@/lib/vocabSrs";
import { topicMeta } from "@/lib/topics";
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard";
import { VocabularyMasteryBar } from "@/components/vocabulary/VocabularyMasteryBar";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { Metadata } from "next";

interface TopicPageProps {
  params: { topic: string };
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const meta = topicMeta(params.topic);
  return { title: `${meta.label} — Vocabulary` };
}

export default async function VocabularyTopicPage({ params }: TopicPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const words = await db.vocabWord.findMany({
    where: { userId: user.id, topic: params.topic },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) notFound();

  const meta = topicMeta(params.topic);
  const masteryCounts: Record<MasteryLevel, number> = { NEW: 0, LEARNING: 0, GOOD: 0, MASTERED: 0 };
  for (const w of words) masteryCounts[w.masteryLevel]++;
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <Link href="/vocabulary/mine" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToAllTopics}</Link>
      <div className="flex items-center gap-3 mt-2 mb-1">
        <span className="text-3xl">{meta.emoji}</span>
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream">{meta.label}</h1>
      </div>
      <p
        className={cn("text-cream/40 mb-1", (user.nativeLanguage === "ar") && "font-arabic")}
        dir={isRTL(user.nativeLanguage) ? "rtl" : "ltr"}
      >
        {getTranslation(meta.translations, user.nativeLanguage)}
      </p>
      <p className="text-cream/50 mb-8">{t.wordbank.wordsFromTopic(words.length)}</p>

      <VocabularyMasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />

      <div className="grid sm:grid-cols-2 gap-3">
        {words.map((w) => <VocabularyWordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
      </div>
    </div>
  );
}
