import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import Stripe from "stripe";
import { db } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

const PlanSchema = z.object({ tier: z.enum(["PRO", "FREE"]) });

// Admin override: grants or revokes Pro access directly, independent of real Stripe billing.
// Upgrading never creates a paid Stripe subscription (no payment method to charge) — it's a
// comp. Downgrading cancels any real Stripe subscription so billing and access stay in sync.
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
      let customerId = user.subscription?.stripeCustomerId;
      if (!customerId) {
        // Best-effort: a real Stripe customer is nice to have (keeps this account linkable to
        // billing later), but a comp grant must not fail just because Stripe is unreachable or
        // misconfigured — fall back to a synthetic id so the local override still applies.
        try {
          const customer = await stripe.customers.create({
            email: user.email,
            name: user.name ?? undefined,
            metadata: { userId: user.id, clerkId: user.clerkId, source: "admin_comp" },
          });
          customerId = customer.id;
        } catch (err) {
          console.error("[POST /api/admin/users/:id/plan] Stripe customer creation failed, using synthetic id", err);
          customerId = `admin_comp_${user.id}`;
        }
      }

      const subscription = await db.subscription.upsert({
        where: { userId: user.id },
        update: { tier: "PRO", status: "ACTIVE" },
        create: { userId: user.id, stripeCustomerId: customerId, tier: "PRO", status: "ACTIVE" },
      });

      return NextResponse.json({ subscription });
    }

    // tier === "FREE"
    if (!user.subscription) {
      return NextResponse.json({ subscription: null });
    }

    if (user.subscription.stripeSubscriptionId) {
      try {
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
      } catch (err) {
        console.error("[POST /api/admin/users/:id/plan] Stripe cancel failed", err);
      }
    }

    const subscription = await db.subscription.update({
      where: { userId: user.id },
      data: { tier: "FREE", status: "CANCELED", cancelAtPeriodEnd: false },
    });

    return NextResponse.json({ subscription });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/admin/users/:id/plan]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
