import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { name, titleTranslations, emoji, difficulty, isPremium, wordTarget, words } = body;
    if (!name || !titleTranslations?.ar || !words?.length) {
      return NextResponse.json({ error: "name, titleTranslations.ar, and at least one word are required" }, { status: 400 });
    }

    const group = await db.vocabGroup.create({
      data: {
        slug: slugify(name),
        name,
        titleTranslations,
        emoji: emoji || "📖",
        difficulty: difficulty ?? "BEGINNER",
        isPremium: isPremium ?? false,
        wordTarget: wordTarget ?? words.length,
        isPublished: false,
        words: {
          create: words.map((w: { word: string; translation: string; example: string }, i: number) => ({
            word: w.word,
            translations: w.translation ? { ar: w.translation } : {},
            example: w.example,
            position: i,
          })),
        },
      },
      include: { words: true },
    });

    revalidateTag("vocab-groups");

    return NextResponse.json({ group }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/vocab-groups]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
