import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const getSubscription = async (sub: Stripe.Subscription) => {
    const userId = sub.metadata?.userId;
    if (!userId) return;

    await db.subscription.upsert({
      where: { userId },
      update: {
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id,
        tier: sub.status === "active" || sub.status === "trialing" ? "PRO" : "FREE",
        status: sub.status === "active" ? "ACTIVE" : sub.status === "past_due" ? "PAST_DUE" : sub.status === "trialing" ? "TRIALING" : "CANCELED",
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
        cancelAtPeriodEnd: sub.cancel_at_period_end,
      },
      create: {
        userId,
        stripeCustomerId: sub.customer as string,
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id,
        tier: "PRO",
        status: "ACTIVE",
        currentPeriodEnd: new Date((sub as any).current_period_end * 1000),
      },
    });
  };

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await getSubscription(event.data.object as Stripe.Subscription);
      break;
    case "customer.subscription.deleted":
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await db.subscription.updateMany({
          where: { userId },
          data: { tier: "FREE", status: "CANCELED" },
        });
      }
      break;
  }

  return NextResponse.json({ received: true });
}
