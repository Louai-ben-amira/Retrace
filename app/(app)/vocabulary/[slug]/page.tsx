import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { difficultyLabel } from "@/lib/utils";
import { VocabularyGroupStudy } from "@/components/vocabulary/VocabularyGroupStudy";
import { getTranslation, isRTL } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import { cn } from "@/lib/cn";
import type { Translations } from "@/types";
import type { Metadata } from "next";

interface GroupPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const group = await db.vocabGroup.findUnique({ where: { slug: params.slug }, select: { name: true } });
  return { title: group ? `${group.name} — Vocabulary` : "Vocabulary" };
}

export default async function VocabularyGroupPage({ params }: GroupPageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const [user, group] = await Promise.all([
    getCurrentUser(),
    db.vocabGroup.findUnique({
      where: { slug: params.slug },
      include: { words: { orderBy: { position: "asc" } } },
    }),
  ]);
  if (!user) redirect("/login");
  const isPro = user.subscription?.tier === "PRO";
  if (!group || !group.isPublished) notFound();
  if (group.isPremium && !isPro) redirect("/settings");

  const progress = await db.vocabGroupProgress.findMany({
    where: { userId: user.id, groupId: group.id },
  });
  const learnedIds = new Set(progress.filter((p) => p.learned).map((p) => p.wordId));

  const words = group.words.map((w) => ({ ...w, learned: learnedIds.has(w.id) }));
  const nativeLanguage = user.nativeLanguage;
  const translatedName = getTranslation(group.titleTranslations as Translations, nativeLanguage);
  const isArabicScript = nativeLanguage === "ar";
  const t = getAppCopy(user.uiLanguage);

  return (
    <div>
      <Link href="/vocabulary" className="text-sm text-cream/40 hover:text-cream/70">{t.wordbank.backToGroups}</Link>
      <div className="flex items-center gap-3 mt-2 mb-1">
        <span className="text-3xl">{group.emoji}</span>
        <h1 className="font-serif text-2xl sm:text-[28px] font-bold tracking-tight text-cream">{group.name}</h1>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-400">{difficultyLabel(group.difficulty, t.common.difficulty)}</span>
      </div>
      <p className={cn("text-cream/40 mb-6", isArabicScript && "font-arabic")} dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}>
        {translatedName}
      </p>

      <VocabularyGroupStudy groupId={group.id} words={words} nativeLanguage={nativeLanguage} />
    </div>
  );
}
