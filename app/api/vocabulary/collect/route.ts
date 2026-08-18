import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const CollectSchema = z.object({
  lineId: z.string(),
  storyId: z.string(),
  words: z.array(
    z.object({
      word: z.string(),
      translations: z.record(z.string()),
      topic: z.string().nullable().optional(),
    })
  ),
});

// Called automatically after each passed line in the story reader — silent, no user-facing
// feedback. Upserts by (userId, word): a word already in the bank is never duplicated or
// overwritten, it just gets its updatedAt touched (its "last seen" signal).
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { lineId, storyId, words } = CollectSchema.parse(await req.json());
    if (words.length === 0) return NextResponse.json({ ok: true, collected: 0 });

    const [user, story] = await Promise.all([
      db.user.findUnique({ where: { clerkId: userId } }),
      db.story.findUnique({ where: { id: storyId }, select: { topic: true } }),
    ]);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await Promise.all(
      words.map((w) =>
        db.vocabWord.upsert({
          where: { userId_word: { userId: user.id, word: w.word.toLowerCase() } },
          create: {
            userId: user.id,
            lineId,
            storyId,
            word: w.word.toLowerCase(),
            translations: w.translations as unknown as Prisma.InputJsonValue,
            topic: w.topic ?? story?.topic ?? null,
          },
          update: {}, // word already known — just touch updatedAt ("last seen")
        })
      )
    );

    return NextResponse.json({ ok: true, collected: words.length });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/vocabulary/collect]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
