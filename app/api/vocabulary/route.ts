import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const words = await db.vocabWord.findMany({
    where: { userId: user.id },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  const byMastery: Record<string, number> = { NEW: 0, LEARNING: 0, GOOD: 0, MASTERED: 0 };
  const byTopic: Record<string, number> = {};
  const now = new Date();
  let dueCount = 0;

  for (const w of words) {
    byMastery[w.masteryLevel]++;
    const topic = w.topic ?? "general";
    byTopic[topic] = (byTopic[topic] ?? 0) + 1;
    if (w.nextReviewAt <= now) dueCount++;
  }

  return NextResponse.json({
    words,
    stats: {
      total: words.length,
      byMastery,
      byTopic,
      dueCount,
    },
  });
}
