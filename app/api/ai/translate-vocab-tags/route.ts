import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { translateWords } from "@/lib/ai";
import { SUPPORTED_LANGUAGE_CODES, getLanguage } from "@/lib/languages";
import { parseVocabTags } from "@/lib/utils";

const TranslateSchema = z.object({
  storyId: z.string().min(1),
  targetLocale: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]),
});

interface FlatTag {
  lineId: string;
  index: number;
  word: string;
}

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

    const linesWithTags = story.lines
      .map((line) => ({ line, tags: parseVocabTags(line.vocabTags) }))
      .filter((l) => l.tags.length > 0);

    if (linesWithTags.length === 0) return NextResponse.json({ translated: 0, total: 0 });

    const flat: FlatTag[] = [];
    for (const { line, tags } of linesWithTags) {
      tags.forEach((tag, index) => flat.push({ lineId: line.id, index, word: tag.word }));
    }

    const translated = await translateWords(flat.map((f) => f.word), language.name);
    if (translated.length !== flat.length) {
      return NextResponse.json({ error: "Translation count mismatch — try again" }, { status: 502 });
    }

    const translationByLineAndIndex = new Map<string, string>();
    flat.forEach((f, i) => translationByLineAndIndex.set(`${f.lineId}:${f.index}`, translated[i]));

    await db.$transaction(
      linesWithTags.map(({ line, tags }) => {
        const nextTags = tags.map((tag, index) => {
          const value = translationByLineAndIndex.get(`${line.id}:${index}`);
          if (value === undefined) return tag;
          return { ...tag, translations: { ...tag.translations, [targetLocale]: value } };
        });
        return db.line.update({
          where: { id: line.id },
          data: { vocabTags: nextTags as unknown as Prisma.InputJsonValue },
        });
      })
    );

    return NextResponse.json({ translated: flat.length, total: flat.length });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/ai/translate-vocab-tags]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
