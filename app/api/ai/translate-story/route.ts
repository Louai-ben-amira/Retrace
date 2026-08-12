import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { translateStoryLines } from "@/lib/ai";
import { SUPPORTED_LANGUAGE_CODES, getLanguage } from "@/lib/languages";
import type { Translations } from "@/types";

const TranslateSchema = z.object({
  storyId: z.string().min(1),
  targetLocale: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { storyId, targetLocale } = TranslateSchema.parse(await req.json());
    const language = getLanguage(targetLocale);
    if (!language) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });

    const story = await db.story.findUnique({
      where: { id: storyId },
      include: { lines: { orderBy: { position: "asc" } } },
    });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
    if (story.lines.length === 0) return NextResponse.json({ translated: 0, total: 0 });

    const translated = await translateStoryLines(
      story.lines.map((l) => l.text),
      language.name
    );

    if (translated.length !== story.lines.length) {
      return NextResponse.json({ error: "Translation count mismatch — try again" }, { status: 502 });
    }

    await db.$transaction(
      story.lines.map((line, i) => {
        const existing = (line.translations && typeof line.translations === "object" ? line.translations : {}) as Translations;
        const next: Translations = { ...existing, [targetLocale]: translated[i] };
        return db.line.update({
          where: { id: line.id },
          data: { translations: next as unknown as Prisma.InputJsonValue },
        });
      })
    );

    return NextResponse.json({ translated: translated.length, total: story.lines.length });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/ai/translate-story]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
