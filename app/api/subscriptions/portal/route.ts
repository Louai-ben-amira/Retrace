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

    const customerId = user.subscription?.stripeCustomerId;
    if (!customerId) return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=1`);

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });

    return NextResponse.redirect(session.url);
  } catch (err) {
    console.error("[Stripe billing portal]", err);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?error=1`);
  }
}
