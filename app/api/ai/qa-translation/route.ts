import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { checkTranslations } from "@/lib/ai";
import { getTranslation } from "@/lib/languages";
import type { Translations } from "@/types";

const QASchema = z.object({ storyId: z.string() });

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { storyId } = QASchema.parse(await req.json());
    const story = await db.story.findUnique({ where: { id: storyId }, include: { lines: true } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const issues = await checkTranslations(
      story.lines.map((l) => ({ position: l.position, text: l.text, translation: getTranslation(l.translations as Translations, "ar") }))
    );
    return NextResponse.json({ issues });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/ai/qa-translation]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
