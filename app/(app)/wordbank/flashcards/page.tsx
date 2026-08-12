import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FlashcardSession } from "@/components/wordbank/FlashcardSession";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Flashcards" };

export default async function FlashcardsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.subscription?.tier !== "PRO") redirect("/wordbank");

  const cards = await db.wordBankEntry.findMany({
    where: { userId: user.id, dueDate: { lte: new Date() } },
    include: { story: { select: { title: true } } },
    orderBy: { dueDate: "asc" },
    take: 20,
  });

  return <FlashcardSession initialCards={cards} nativeLanguage={user.nativeLanguage} />;
}
