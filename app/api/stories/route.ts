import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty") ?? undefined;
    const topic = searchParams.get("topic") ?? undefined;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const stories = await db.story.findMany({
      where: {
        isPublished: true,
        ...(difficulty && { difficulty: difficulty as any }),
        ...(topic && { topic }),
      },
      include: { tags: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await db.story.count({ where: { isPublished: true } });
    return NextResponse.json({ stories, total, page, limit });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const { lines, tags, titleAr, descriptionAr, ...storyData } = body;

    // The AI-generation flow (StoryForm) still produces a single Arabic draft — map it
    // into the "ar" key of the new translation JSON columns on create.
    const linesData = (lines ?? []).map((l: { position: number; text: string; translation?: string }) => ({
      position: l.position,
      text: l.text,
      translations: l.translation ? { ar: l.translation } : {},
    }));

    const story = await db.story.create({
      data: {
        ...storyData,
        titleTranslations: titleAr ? { ar: titleAr } : {},
        descriptionTranslations: descriptionAr ? { ar: descriptionAr } : {},
        wordCount: lines?.reduce((sum: number, l: any) => sum + l.text.split(" ").length, 0) ?? 0,
        lines: { create: linesData },
        tags: tags ? { create: tags.map((t: string) => ({ tag: t })) } : undefined,
      },
      include: { lines: true, tags: true },
    });
    return NextResponse.json({ story }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
