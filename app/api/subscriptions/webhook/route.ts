import { NextRequest, NextResponse } from "next/server";
import {
  EventName,
  Webhooks,
  type SubscriptionCreatedNotification,
  type SubscriptionNotification,
} from "@paddle/paddle-node-sdk";
import { db } from "@/lib/db";

// `Webhooks` is a standalone verifier — unlike the full Paddle client it needs no API key,
// only the destination's signing secret. This route is the sole point where Paddle data
// enters the app, so a leaked API key is not a risk this integration carries.
const webhooks = new Webhooks();

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("paddle-signature");
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    // Verifies the HMAC *and* the timestamp, so replayed deliveries are rejected here.
    event = await webhooks.unmarshal(body, secret, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (!event) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });

  // `subscription.created` carries an extra transactionId, so it arrives as its own type.
  // Every field read below is common to both.
  const syncSubscription = async (sub: SubscriptionNotification | SubscriptionCreatedNotification) => {
    // customData is set when the browser opens checkout. Falling back to the customer id
    // covers repeat events for a subscription already on file — including ones created by
    // hand in the Paddle dashboard, which carry no custom data at all.
    const userId =
      (sub.customData as { userId?: string } | null)?.userId ??
      (await db.subscription.findUnique({
        where: { paddleCustomerId: sub.customerId },
        select: { userId: true },
      }))?.userId;

    if (!userId) {
      console.error("[Paddle webhook] no user for subscription", sub.id, sub.customerId);
      return;
    }

    // Access follows the same rule the Stripe integration used: only a live or trialing
    // subscription grants Pro. A past_due subscription loses access until payment recovers.
    const tier = sub.status === "active" || sub.status === "trialing" ? "PRO" : "FREE";
    const status =
      sub.status === "active" ? "ACTIVE"
      : sub.status === "past_due" ? "PAST_DUE"
      : sub.status === "trialing" ? "TRIALING"
      : "CANCELED";

    const currentPeriodEnd = sub.currentBillingPeriod?.endsAt
      ? new Date(sub.currentBillingPeriod.endsAt)
      : null;

    // Paddle has no cancel_at_period_end flag; a pending cancellation is a scheduled change.
    const cancelAtPeriodEnd = sub.scheduledChange?.action === "cancel";

    const fields = {
      paddleSubscriptionId: sub.id,
      paddlePriceId: sub.items[0]?.price?.id,
      tier,
      status,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    } as const;

    // This is where paddleCustomerId first gets a real `ctm_` value — nothing is created up
    // front, because without the API there is no server-side customer creation.
    await db.subscription.upsert({
      where: { userId },
      update: { ...fields, paddleCustomerId: sub.customerId },
      create: { userId, paddleCustomerId: sub.customerId, ...fields },
    });
  };

  switch (event.eventType) {
    // Every one of these carries the full subscription entity with an up-to-date status,
    // including `canceled` — so a single sync handles the whole lifecycle rather than
    // needing a separate delete branch.
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionTrialing:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused:
    case EventName.SubscriptionResumed:
    case EventName.SubscriptionCanceled:
      await syncSubscription(event.data);
      break;
  }

  return NextResponse.json({ received: true });
}
