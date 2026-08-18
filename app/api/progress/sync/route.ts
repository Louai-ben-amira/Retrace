import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { parseVocabTags } from "@/lib/utils";
import { lineXP } from "@/lib/scoring";

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

    // The line attempt is recorded regardless of outcome — a fuzzy-graded "fail" still
    // reveals the answer and moves the reader on, so it needs to count toward the
    // story's average score below just as much as a pass does.
    const [, story] = await Promise.all([
      db.lineAttempt.create({ data: { userId: user.id, lineId, attempt, score, passed, timeMs } }),
      db.story.findUnique({ where: { id: storyId }, include: { lines: true } }),
    ]);
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const totalLines = story.lines.length;
    const line = story.lines.find((l) => l.id === lineId);
    const position = line?.position ?? 1;
    const isLast = position === totalLines;

    // On the final line, StoryProgress.score is the average across every LineAttempt
    // made against this story — passes and revealed fails alike. LineAttempt.score is
    // the raw 0–1 fuzzy match score (see SyncSchema above and the admin analytics page,
    // which applies the same *100 convention) — scaled to a 0–100 percentage here since
    // that's what the progress page renders it as.
    let finalScore: number | undefined;
    if (isLast) {
      const attempts = await db.lineAttempt.findMany({
        where: { userId: user.id, line: { storyId } },
        select: { score: true },
      });
      const avg = attempts.length > 0 ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length : score;
      finalScore = avg * 100;
    }

    // Progress and streak advance on every submission — that's when the reader actually
    // moves to the next line, whether it was typed correctly or revealed after a fail.
    // Word-bank collection stays gated on `passed`: only a correctly typed line means
    // the vocabulary in it was actually demonstrated.
    const [, progress, streak] = await Promise.all([
      passed && line ? collectWordBank(user.id, storyId, story.topic, line.vocabTags) : Promise.resolve(),
      db.storyProgress.upsert({
        where: { userId_storyId: { userId: user.id, storyId } },
        update: {
          currentLine: isLast ? position : position + 1,
          completedLines: { increment: 1 },
          completed: isLast,
          completedAt: isLast ? new Date() : undefined,
          score: isLast ? finalScore : undefined,
        },
        create: {
          userId: user.id,
          storyId,
          currentLine: isLast ? position : position + 1,
          completedLines: 1,
          totalLines,
          completed: isLast,
          completedAt: isLast ? new Date() : undefined,
          score: isLast ? finalScore : undefined,
        },
      }),
      updateStreak(user.id),
    ]);

    // XP is only earned for lines actually passed — a revealed fail advances the story
    // but doesn't reward XP.
    if (passed) {
      const xp = lineXP(score, timeMs, streak.current);
      if (xp > 0) await db.user.update({ where: { id: user.id }, data: { totalXp: { increment: xp } } });
    }

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
