import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const LearnSchema = z.object({
  wordId: z.string(),
  learned: z.boolean(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { wordId, learned } = LearnSchema.parse(await req.json());

    const word = await db.vocabGroupWord.findUnique({ where: { id: wordId } });
    if (!word || word.groupId !== params.id) return NextResponse.json({ error: "Word not found" }, { status: 404 });

    const progress = await db.vocabGroupProgress.upsert({
      where: { userId_wordId: { userId: user.id, wordId } },
      create: { userId: user.id, groupId: params.id, wordId, learned },
      update: { learned },
    });

    return NextResponse.json({ ok: true, progress });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/vocab-groups/[id]/learn]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
