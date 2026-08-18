import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/api/webhooks(.*)",
  "/api/subscriptions/webhook",
  "/api/preferences/anon",
  // The service worker precaches /offline at install time. Behind auth it would cache a
  // redirect to /login instead of the page, so the offline fallback would never render.
  "/offline",
  // Called by Vercel Cron, which carries no Clerk session — the route authenticates
  // itself with CRON_SECRET.
  "/api/push/send-daily",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth().protect();
  }
  // Admin routes: additional check happens inside the route itself
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
