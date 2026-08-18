import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { VocabularyReviewSession } from "@/components/vocabulary/VocabularyReviewSession";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Review — Vocabulary" };

export default async function VocabularyReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await requireUser();

  const cards = await db.vocabWord.findMany({
    where: { userId: user.id, nextReviewAt: { lte: new Date() } },
    include: { story: { select: { title: true, slug: true } }, line: { select: { text: true } } },
    orderBy: { nextReviewAt: "asc" },
    take: 20,
  });

  return <VocabularyReviewSession initialCards={cards} nativeLanguage={user.nativeLanguage} />;
}
