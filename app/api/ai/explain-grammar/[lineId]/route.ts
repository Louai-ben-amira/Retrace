import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { explainGrammar } from "@/lib/ai";
import { getTranslation } from "@/lib/languages";
import type { Translations } from "@/types";

export async function POST(_: NextRequest, { params }: { params: { lineId: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const line = await db.line.findUnique({ where: { id: params.lineId } });
    if (!line) return NextResponse.json({ error: "Line not found" }, { status: 404 });

    if (line.grammarNote) return NextResponse.json({ explanation: line.grammarNote });

    const explanation = await explainGrammar(line.text, getTranslation(line.translations as Translations, "ar"));
    await db.line.update({ where: { id: line.id }, data: { grammarNote: explanation } });
    return NextResponse.json({ explanation });
  } catch (err) {
    console.error(`[POST /api/ai/explain-grammar/${params.lineId}]`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
