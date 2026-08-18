import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const SubscribeSchema = z.object({
  subscription: z
    .object({
      endpoint: z.string().url(),
      keys: z.object({ p256dh: z.string(), auth: z.string() }),
    })
    .passthrough(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { subscription } = SubscribeSchema.parse(await req.json());

    // Dedup by endpoint — a user re-subscribing on the same device (e.g. after a
    // permission reset) shouldn't accumulate duplicate rows that would each fire
    // a separate push.
    const existing = await db.pushSubscription.findMany({ where: { userId: user.id } });
    const alreadySaved = existing.some((s) => (s.subscription as { endpoint?: string })?.endpoint === subscription.endpoint);

    if (!alreadySaved) {
      await db.pushSubscription.create({
        data: { userId: user.id, subscription: subscription as unknown as Prisma.InputJsonValue },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/push/subscribe]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
