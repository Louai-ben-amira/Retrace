import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateVocabGroupWords } from "@/lib/ai";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, difficulty, wordCount } = await req.json();
    if (!name || !difficulty || !wordCount) {
      return NextResponse.json({ error: "name, difficulty, and wordCount are required" }, { status: 400 });
    }

    const words = await generateVocabGroupWords(name, difficulty, Math.min(Math.max(Number(wordCount), 1), 60));
    return NextResponse.json({ words });
  } catch (err) {
    console.error("[POST /api/vocab-groups/generate]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
