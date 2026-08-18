import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Translations } from "@/types";

interface IncomingWord {
  id?: string;
  word: string;
  translations: Translations;
  example: string;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { words, ...meta } = body as { words?: IncomingWord[] } & Record<string, unknown>;

    // Diff-based word update: preserves VocabGroupProgress rows for words that are only
    // edited (matched by id) rather than wiping every learner's progress on every save.
    // The metadata update and the existing-words read touch different tables and don't
    // depend on each other's result, so they can run concurrently.
    const [, existing] = await Promise.all([
      Object.keys(meta).length > 0
        ? db.vocabGroup.update({ where: { id: params.id }, data: meta })
        : Promise.resolve(null),
      Array.isArray(words)
        ? db.vocabGroupWord.findMany({ where: { groupId: params.id }, select: { id: true } })
        : Promise.resolve([] as { id: string }[]),
    ]);

    if (Array.isArray(words)) {
      const existingIds = new Set(existing.map((w) => w.id));
      const incomingIds = new Set(words.filter((w) => w.id).map((w) => w.id));
      const toDelete = Array.from(existingIds).filter((id) => !incomingIds.has(id));

      await db.$transaction([
        ...(toDelete.length ? [db.vocabGroupWord.deleteMany({ where: { id: { in: toDelete } } })] : []),
        ...words.map((w, i) =>
          w.id
            ? db.vocabGroupWord.update({
                where: { id: w.id },
                data: { word: w.word, translations: w.translations, example: w.example, position: i },
              })
            : db.vocabGroupWord.create({
                data: { groupId: params.id, word: w.word, translations: w.translations, example: w.example, position: i },
              })
        ),
      ]);
    }

    const group = await db.vocabGroup.findUnique({
      where: { id: params.id },
      include: { words: { orderBy: { position: "asc" } } },
    });
    return NextResponse.json({ group });
  } catch (err) {
    console.error("[PATCH /api/vocab-groups/[id]]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
