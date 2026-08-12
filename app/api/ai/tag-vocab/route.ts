import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { tagLineVocab } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { storyId } = await req.json();
    const story = await db.story.findUnique({ where: { id: storyId }, include: { lines: true } });
    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });

    const results = await Promise.allSettled(
      story.lines.map(async (line) => {
        const tags = await tagLineVocab(line.text, story.difficulty);
        await db.line.update({ where: { id: line.id }, data: { vocabTags: tags as unknown as Prisma.InputJsonValue } });
        return { lineId: line.id, tags };
      })
    );

    const tagged = results.filter((r) => r.status === "fulfilled").length;
    return NextResponse.json({ tagged, total: story.lines.length });
  } catch (err) {
    console.error("[POST /api/ai/tag-vocab]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
