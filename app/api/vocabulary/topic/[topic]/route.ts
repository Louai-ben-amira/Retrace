import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: { topic: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const words = await db.vocabWord.findMany({
    where: { userId: user.id, topic: params.topic },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ word: "asc" }],
  });

  return NextResponse.json({ topic: params.topic, words });
}
