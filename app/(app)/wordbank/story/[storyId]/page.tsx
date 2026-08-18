import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { masteryLabel } from "@/lib/srs";
import type { MasteryLevel } from "@/lib/srs";
import { WordCard } from "@/components/wordbank/WordCard";
import { MasteryBar } from "@/components/wordbank/MasteryBar";
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
  return { title: story ? `${story.title} — Word bank` : "Word bank" };
}

export default async function WordBankStoryPage({ params }: StoryPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [user, story] = await Promise.all([
    requireUser(),
    db.story.findUnique({ where: { id: params.storyId } }),
  ]);
  if (!story) notFound();

  const words = await db.wordBankEntry.findMany({
    where: { userId: user.id, storyId: params.storyId },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  if (words.length === 0) notFound();

  const withMastery = words.map((w) => ({ ...w, mastery: masteryLabel(w.reviewCount, w.interval) }));
  const masteryCounts: Record<MasteryLevel, number> = { new: 0, learning: 0, good: 0, mastered: 0 };
  for (const w of withMastery) masteryCounts[w.mastery]++;
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <Link href="/wordbank" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToAllTopics}</Link>
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

      <MasteryBar counts={masteryCounts} total={words.length} uiLanguage={user.uiLanguage} />

      <div className="grid sm:grid-cols-2 gap-3">
        {withMastery.map((w) => <WordCard key={w.id} word={w} showStory={false} nativeLanguage={user.nativeLanguage} uiLanguage={user.uiLanguage} />)}
      </div>
    </div>
  );
}
