import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    const story = await db.story.findUnique({
      where: { id: params.id },
      include: { lines: { orderBy: { position: "asc" } }, tags: true },
    });
    if (!story || !story.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (story.isPremium && userId) {
      const user = await db.user.findUnique({ where: { clerkId: userId }, include: { subscription: true } });
      if (user?.subscription?.tier !== "PRO") {
        return NextResponse.json({ story: { ...story, lines: story.lines.map((l) => ({ ...l, text: "", translations: {}, locked: true })) } });
      }
    }
    return NextResponse.json({ story });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { lines, ...storyFields } = await req.json();

    const story = await db.story.update({ where: { id: params.id }, data: storyFields });

    if (Array.isArray(lines) && lines.length > 0) {
      await db.$transaction(
        lines.map((l: { id: string; text?: string; translations?: Record<string, string> }) =>
          db.line.update({
            where: { id: l.id },
            data: {
              ...(l.text !== undefined && { text: l.text }),
              ...(l.translations !== undefined && { translations: l.translations }),
            },
          })
        )
      );
    }

    return NextResponse.json({ story });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    await db.story.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
