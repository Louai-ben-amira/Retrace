import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const words = await db.wordBankEntry.findMany({
    where: { userId: user.id },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: [{ frequencyRank: "asc" }, { word: "asc" }],
  });

  return NextResponse.json({ words });
}
