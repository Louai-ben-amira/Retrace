import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

// Keep in sync with the "free for N days" promise in lib/i18n/landing.ts.
const TRIAL_DAYS = 7;

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });
    if (!user) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);

    let customerId = user.subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId: user.id, clerkId: userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgraded=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
      metadata: { userId: user.id },
      // Stripe does NOT copy Checkout Session metadata onto the Subscription object it
      // creates — the webhook reads `sub.metadata.userId` off the *subscription*, so
      // without this the webhook can never link a real subscription back to a user.
      //
      // trial_period_days backs the "Start Pro free for 7 days" promise on the pricing
      // page. Without it Stripe charges on signup, which is what the landing copy in all
      // five locales tells the user will not happen.
      subscription_data: {
        metadata: { userId: user.id },
        trial_period_days: TRIAL_DAYS,
      },
    });

    return NextResponse.redirect(session.url!);
  } catch (err) {
    console.error("[Stripe checkout]", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=1`);
  }
}
