import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({ where: { clerkId: userId }, include: { subscription: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.subscription?.tier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 });

  const cards = await db.wordBankEntry.findMany({
    where: { userId: user.id, dueDate: { lte: new Date() } },
    include: { story: { select: { title: true, slug: true } } },
    orderBy: { dueDate: "asc" },
    take: 20,
  });

  return NextResponse.json({ cards });
}
