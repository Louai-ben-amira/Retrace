import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { translateWords } from "@/lib/ai";
import { SUPPORTED_LANGUAGE_CODES, getLanguage } from "@/lib/languages";
import type { Translations } from "@/types";

const TranslateSchema = z.object({
  groupId: z.string().min(1),
  targetLocale: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]),
});

function asTranslations(value: unknown): Translations {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Translations) : {};
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { groupId, targetLocale } = TranslateSchema.parse(await req.json());
    const language = getLanguage(targetLocale);
    if (!language) return NextResponse.json({ error: "Unsupported language" }, { status: 400 });

    const group = await db.vocabGroup.findUnique({
      where: { id: groupId },
      include: { words: { orderBy: { position: "asc" } } },
    });
    if (!group) return NextResponse.json({ error: "Group not found" }, { status: 404 });
    if (group.words.length === 0) return NextResponse.json({ translated: 0, total: 0 });

    const translated = await translateWords(
      group.words.map((w) => w.word),
      language.name
    );

    if (translated.length !== group.words.length) {
      return NextResponse.json({ error: "Translation count mismatch — try again" }, { status: 502 });
    }

    await db.$transaction(
      group.words.map((word, i) => {
        const existing = asTranslations(word.translations);
        const next: Translations = { ...existing, [targetLocale]: translated[i] };
        return db.vocabGroupWord.update({
          where: { id: word.id },
          data: { translations: next as unknown as Prisma.InputJsonValue },
        });
      })
    );

    return NextResponse.json({ translated: translated.length, total: group.words.length });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/ai/translate-vocab-group]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
