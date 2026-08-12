import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseVocabTags } from "@/lib/utils";

const SyncSchema = z.object({
  storyId: z.string(), lineId: z.string(), attempt: z.string(),
  score: z.number().min(0).max(1), passed: z.boolean(), timeMs: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId }, include: { streak: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = SyncSchema.parse(await req.json());
    const { storyId, lineId, attempt, score, passed, timeMs } = body;

    await db.lineAttempt.create({ data: { userId: user.id, lineId, attempt, score, passed, timeMs } });
    if (!passed) return NextResponse.json({ ok: true });

    const story = await db.story.findUnique({ where: { id: storyId }, include: { lines: true } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const totalLines = story.lines.length;
    const line = story.lines.find((l) => l.id === lineId);
    const position = line?.position ?? 1;
    const isLast = position === totalLines;

    if (line) await collectWordBank(user.id, storyId, story.topic, line.vocabTags);

    const progress = await db.storyProgress.upsert({
      where: { userId_storyId: { userId: user.id, storyId } },
      update: { currentLine: isLast ? position : position + 1, completedLines: { increment: 1 }, completed: isLast, completedAt: isLast ? new Date() : undefined },
      create: { userId: user.id, storyId, currentLine: isLast ? position : position + 1, completedLines: 1, totalLines, completed: isLast, completedAt: isLast ? new Date() : undefined },
    });

    const streak = await updateStreak(user.id);
    return NextResponse.json({ ok: true, progress, streak: { current: streak.current, longest: streak.longest } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

// Auto-collects the AI-tagged vocabulary from a completed line into the user's word bank.
// A word bank entry is unique per (user, word) — repeat encounters just bump timesSeen
// rather than overwriting the translations/example, so review context stays stable.
// The full translations map is copied (not resolved to one language) so the word bank
// re-renders correctly if the user later switches their native language.
async function collectWordBank(userId: string, storyId: string, topic: string | null, vocabTagsJson: unknown) {
  const tags = parseVocabTags(vocabTagsJson);
  if (tags.length === 0) return;

  try {
    await Promise.all(
      tags.map((tag) =>
        db.wordBankEntry.upsert({
          where: { userId_word: { userId, word: tag.word.toLowerCase() } },
          update: { timesSeen: { increment: 1 } },
          create: {
            userId,
            storyId,
            topic,
            word: tag.word.toLowerCase(),
            translations: tag.translations as unknown as Prisma.InputJsonValue,
            example: tag.example,
            frequencyRank: tag.frequencyRank,
          },
        })
      )
    );
  } catch (err) {
    console.error("[collectWordBank]", err);
  }
}

async function updateStreak(userId: string) {
  const streak = await db.streak.findUnique({ where: { userId } });
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!streak) return db.streak.create({ data: { userId, current: 1, longest: 1, lastActivity: now } });
  const last = streak.lastActivity ? new Date(streak.lastActivity) : null;
  const lastDay = last ? new Date(last.getFullYear(), last.getMonth(), last.getDate()) : null;
  const diffDays = lastDay ? Math.floor((today.getTime() - lastDay.getTime()) / 86400000) : null;
  if (diffDays === 0) return streak;
  const newCurrent = diffDays === 1 ? streak.current + 1 : 1;
  return db.streak.update({ where: { userId }, data: { current: newCurrent, longest: Math.max(streak.longest, newCurrent), lastActivity: now } });
}
