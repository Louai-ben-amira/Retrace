import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { MasteryLevel } from "@/lib/vocabSrs";
import { VocabularyWordCard } from "@/components/vocabulary/VocabularyWordCard";
import { VocabularyMasteryBar } from "@/components/vocabulary/VocabularyMasteryBar";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { Translations } from "@/types";
import type { Metadata } from "next";

interface StoryPageProps {
  params: { storyId: string };
}

export async function generateMetadata({ params }: StoryPageProps): Promise<Metadata> {
  const story = await db.story.findUnique({ where: { id: params.storyId }, select: { title: true } });
  return { title: story ? `${story.title} — Vocabulary` : "Vocabulary" };
}

export default async function VocabularyStoryPage({ params }: StoryPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [user, story] = await Promise.all([
    getCurrentUser(),
    db.story.findUnique({ where: { id: params.storyId } }),
  ]);
  if (!user) redirect("/login");
  if (!story) notFound();

  const words = await db.vocabWord.findMany({
    where: { userId: user.id, storyId: params.storyId },
    include: { story: { select: { title: true, slug: true } }, line: { select: { text: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) notFound();

  const masteryCounts: Record<MasteryLevel, number> = { NEW: 0, LEARNING: 0, GOOD: 0, MASTERED: 0 };
  for (const w of words) masteryCounts[w.masteryLevel]++;
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <Link href="/vocabulary/mine" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToAllTopics}</Link>
      <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream mt-2 mb-1">{story.title}</h1>
      <p
        className={cn("text-cream/40 mb-1", (user.nativeLanguage === "ar") && "font-arabic")}
        dir={isRTL(user.nativeLanguage) ? "rtl" : "ltr"}
      >
        {getTranslation(story.titleTranslations as Translations, user.nativeLanguage)}
      </p>
      <p className="text-cream/50 mb-8">
        {t.wordbank.wordsFromStory(words.length)}{" "}
        <Link href={`/story/${story.id}`} className="text-brand-400 hover:underline">{t.wordbank.readItAgain}</Link>
      </p>

      <VocabularyMasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />

      <div className="grid sm:grid-cols-2 gap-3">
        {words.map((w) => <VocabularyWordCard key={w.id} word={w} showStory={false} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
      </div>
    </div>
  );
}
