import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { scheduleReview } from "@/lib/srs";

const ReviewSchema = z.object({
  wordId: z.string(),
  rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await db.user.findUnique({ where: { clerkId: userId }, include: { subscription: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.subscription?.tier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 });

    const { wordId, rating } = ReviewSchema.parse(await req.json());

    const card = await db.wordBankEntry.findUnique({ where: { id: wordId } });
    if (!card || card.userId !== user.id) return NextResponse.json({ error: "Word not found" }, { status: 404 });

    const schedule = scheduleReview(
      { interval: card.interval, easeFactor: card.easeFactor, reviewCount: card.reviewCount },
      rating
    );

    const updated = await db.wordBankEntry.update({
      where: { id: wordId },
      data: {
        interval: schedule.interval,
        easeFactor: schedule.easeFactor,
        reviewCount: schedule.reviewCount,
        dueDate: schedule.dueDate,
        lastReviewed: new Date(),
      },
    });

    return NextResponse.json({ ok: true, word: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/wordbank/review]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
