import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await db.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = await db.user.findUnique({
      where: { id: params.id },
      include: { subscription: true, streak: true },
    });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [storiesCompleted, storiesStarted, wordBankSize, attemptStats, passedAttempts, clerkUser] = await Promise.all([
      db.storyProgress.count({ where: { userId: user.id, completed: true } }),
      db.storyProgress.count({ where: { userId: user.id } }),
      db.wordBankEntry.count({ where: { userId: user.id } }),
      db.lineAttempt.aggregate({
        where: { userId: user.id },
        _count: { _all: true },
      }),
      db.lineAttempt.count({ where: { userId: user.id, passed: true } }),
      clerkClient()
        .users.getUser(user.clerkId)
        .catch((err) => {
          console.error("[GET /api/admin/users/:id] Clerk lookup failed", err);
          return null;
        }),
    ]);

    const totalAttempts = attemptStats._count._all;
    const accuracyPct = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : null;
    const lastActive = clerkUser?.lastSignInAt ? new Date(clerkUser.lastSignInAt).toISOString() : null;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        uiLanguage: user.uiLanguage,
        nativeLanguage: user.nativeLanguage,
        createdAt: user.createdAt,
      },
      subscription: user.subscription,
      streak: user.streak,
      stats: {
        storiesCompleted,
        storiesStarted,
        wordBankSize,
        totalAttempts,
        accuracyPct,
        lastActive,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/users/:id]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
