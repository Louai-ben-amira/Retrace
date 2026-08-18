import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    const story = await db.story.findUnique({
      where: { id: params.id },
      include: { lines: { orderBy: { position: "asc" } }, tags: true },
    });
    if (!story || !story.isPublished) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Premium content requires positive proof of Pro. The previous `story.isPremium &&
    // userId` guard skipped the paywall entirely when there was no session, so the gate
    // held only because middleware happens to block anonymous callers — one matcher change
    // away from serving full premium text to the world.
    if (story.isPremium) {
      const user = userId
        ? await db.user.findUnique({ where: { clerkId: userId }, include: { subscription: true } })
        : null;

      if (user?.subscription?.tier !== "PRO") {
        return NextResponse.json({
          story: {
            ...story,
            lines: story.lines.map((l) => ({ ...l, text: "", translations: {}, locked: true })),
          },
        });
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

    // getPublishedStories/getAdminStoriesList are unstable_cache'd under this tag. Without
    // this call the tag was decorative: publishing a story stayed invisible in the library
    // until the 60s revalidate window happened to expire.
    revalidateTag("stories");

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

    revalidateTag("stories");

    return NextResponse.json({ deleted: true });
  } catch { return NextResponse.json({ error: "Internal error" }, { status: 500 }); }
}
