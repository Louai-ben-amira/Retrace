import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { storyId: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const words = await db.vocabWord.findMany({
    where: { userId: user.id, storyId: params.storyId },
    include: { story: { select: { title: true, slug: true } }, line: { select: { text: true } } },
    orderBy: [{ word: "asc" }],
  });

  return NextResponse.json({ storyId: params.storyId, words });
}
