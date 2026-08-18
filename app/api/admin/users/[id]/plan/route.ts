import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const PlanSchema = z.object({ tier: z.enum(["PRO", "FREE"]) });

// Admin override for *access only*. This app holds no Paddle API key, so it cannot create
// or cancel anything on Paddle's side — this endpoint moves the local tier and nothing else.
//
// Upgrading is a comp: it grants Pro without any payment, as it always did.
// Downgrading revokes Pro immediately but does NOT stop Paddle billing. If the user has a
// real subscription (paddleSubscriptionId is set), cancel it in the Paddle dashboard too,
// or they keep being charged for access they no longer have. The admin drawer warns about
// this at the point of the click.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const admin = await db.user.findUnique({ where: { clerkId: userId } });
    if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { tier } = PlanSchema.parse(await req.json());

    const user = await db.user.findUnique({ where: { id: params.id }, include: { subscription: true } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (tier === "PRO") {
      const subscription = await db.subscription.upsert({
        where: { userId: user.id },
        update: { tier: "PRO", status: "ACTIVE" },
        // paddleCustomerId is required and unique. A comped user has no Paddle customer
        // yet, so stand in a synthetic id; a real `ctm_` value replaces it if they ever
        // check out for real.
        create: { userId: user.id, paddleCustomerId: `admin_comp_${user.id}`, tier: "PRO", status: "ACTIVE" },
      });

      return NextResponse.json({ subscription });
    }

    // tier === "FREE"
    if (!user.subscription) {
      return NextResponse.json({ subscription: null });
    }

    const subscription = await db.subscription.update({
      where: { userId: user.id },
      data: { tier: "FREE", status: "CANCELED", cancelAtPeriodEnd: false },
    });

    // Surfaced to the admin UI so a still-billing subscription can't be revoked silently.
    return NextResponse.json({
      subscription,
      billingStillActive: Boolean(user.subscription.paddleSubscriptionId),
    });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/admin/users/:id/plan]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
