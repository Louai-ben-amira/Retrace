import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect("/login");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: { subscription: true },
    });
    if (!user) return NextResponse.redirect("/login");

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
    });

    return NextResponse.redirect(session.url!);
  } catch (err) {
    console.error("[Stripe checkout]", err);
    return NextResponse.redirect("/settings?error=1");
  }
}
