import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateStory } from "@/lib/ai";

const GenerateSchema = z.object({
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  topic: z.string().min(1),
  customPrompt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = GenerateSchema.parse(await req.json());
    const story = await generateStory(body.difficulty, body.topic, body.customPrompt);
    return NextResponse.json({ story });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/ai/generate-story]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
