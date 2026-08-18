import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { masteryLabel } from "@/lib/srs";
import type { MasteryLevel } from "@/lib/srs";
import { topicMeta } from "@/lib/topics";
import { WordCard } from "@/components/wordbank/WordCard";
import { MasteryBar } from "@/components/wordbank/MasteryBar";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { Metadata } from "next";

interface TopicPageProps {
  params: { topic: string };
}

export function generateMetadata({ params }: TopicPageProps): Metadata {
  const meta = topicMeta(params.topic);
  return { title: `${meta.label} — Word bank` };
}

export default async function WordBankTopicPage({ params }: TopicPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await requireUser();

  const words = await db.wordBankEntry.findMany({
    where: { userId: user.id, topic: params.topic },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) notFound();

  const meta = topicMeta(params.topic);
  const withMastery = words.map((w) => ({ ...w, mastery: masteryLabel(w.reviewCount, w.interval) }));
  const masteryCounts: Record<MasteryLevel, number> = { new: 0, learning: 0, good: 0, mastered: 0 };
  for (const w of withMastery) masteryCounts[w.mastery]++;
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <Link href="/wordbank" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToAllTopics}</Link>
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

      <MasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />

      <div className="grid sm:grid-cols-2 gap-3">
        {withMastery.map((w) => <WordCard key={w.id} word={w} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
      </div>
    </div>
  );
}
