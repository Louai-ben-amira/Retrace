import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { explainGrammar } from "@/lib/ai";
import { getTranslation, getLanguage } from "@/lib/languages";
import type { Translations } from "@/types";

export async function POST(_: NextRequest, { params }: { params: { lineId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // The explanation is written in the learner's own language, so it has to be keyed to
    // the user rather than generated once globally. Previously this route hardcoded "ar"
    // and cached into a single column, so French/Spanish/Turkish users got Arabic.
    const user = await getCurrentUser();
    const locale = user?.nativeLanguage ?? "ar";
    const languageName = getLanguage(locale)?.name ?? "Arabic";

    const line = await db.line.findUnique({ where: { id: params.lineId } });
    if (!line) return NextResponse.json({ error: "Line not found" }, { status: 404 });

    const notes = (line.grammarNotes ?? {}) as Record<string, string>;
    const cached = notes[locale];
    if (cached) return NextResponse.json({ explanation: cached, locale });

    const translation = getTranslation(line.translations as Translations, locale);
    const explanation = await explainGrammar(line.text, translation, languageName);

    await db.line.update({
      where: { id: line.id },
      data: { grammarNotes: { ...notes, [locale]: explanation } as Prisma.InputJsonValue },
    });

    return NextResponse.json({ explanation, locale });
  } catch (err) {
    console.error(`[POST /api/ai/explain-grammar/${params.lineId}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
