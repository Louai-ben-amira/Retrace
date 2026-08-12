import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { scheduleVocabReview } from "@/lib/vocabSrs";

const ReviewSchema = z.object({
  wordId: z.string(),
  result: z.enum(["easy", "good", "hard", "forgot"]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { wordId, result } = ReviewSchema.parse(await req.json());

    const card = await db.vocabWord.findUnique({ where: { id: wordId } });
    if (!card || card.userId !== user.id) return NextResponse.json({ error: "Word not found" }, { status: 404 });

    const schedule = scheduleVocabReview(
      { interval: card.interval, easeFactor: card.easeFactor, reviewCount: card.reviewCount },
      result
    );

    const updated = await db.vocabWord.update({
      where: { id: wordId },
      data: {
        interval: schedule.interval,
        easeFactor: schedule.easeFactor,
        reviewCount: schedule.reviewCount,
        masteryLevel: schedule.masteryLevel,
        nextReviewAt: schedule.nextReviewAt,
      },
    });

    return NextResponse.json({ ok: true, word: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/vocabulary/review]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
