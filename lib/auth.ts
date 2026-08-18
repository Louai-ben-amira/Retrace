import { cache } from "react";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/utils";

const USER_INCLUDE = { subscription: true, streak: true } as const;

/**
 * Looks up the signed-in user's DB row (with subscription + streak), creating it if it
 * does not exist yet.
 *
 * The row is normally written by the Clerk `user.created` webhook. That webhook is not a
 * dependency this app can afford: a misconfigured signing secret, a signup that happened
 * before the endpoint was registered, or one dropped delivery all leave a user with a
 * valid Clerk session and no row — and the failure is silent and deeply confusing. Pages
 * that tolerate a null user (library, settings) render, while pages that require one
 * (`if (!user) redirect("/login")`) send the user to /login, where Clerk sees a live
 * session and immediately redirects to NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL. The user just
 * sees half the app silently bouncing them back to the library, with nothing in the logs.
 *
 * Provisioning here makes the webhook a latency optimisation rather than a correctness
 * requirement: it keeps profile data fresh, but nothing breaks permanently if it fails.
 *
 * Wrapped in React's cache() so the layout and the page it wraps share one query per
 * request instead of each re-fetching (or each trying to provision) the same row.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
    include: USER_INCLUDE,
  });
  if (existing) return existing;

  return provisionUser(userId);
});

/**
 * Mirrors what the `user.created` webhook handler writes, sourcing the same fields from
 * Clerk directly. Returns null rather than throwing: a failure here should degrade to the
 * signed-out experience, not replace every page with an error boundary.
 */
async function provisionUser(clerkId: string) {
  let clerkUser;
  try {
    clerkUser = await clerkClient().users.getUser(clerkId);
  } catch (err) {
    console.error("[getCurrentUser] Clerk lookup failed, cannot provision", clerkId, err);
    return null;
  }

  const email =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    console.error("[getCurrentUser] Clerk user has no email address, cannot provision", clerkId);
    return null;
  }

  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null;

  try {
    // Logged at error level deliberately: reaching this line means the Clerk webhook did
    // not do its job, which is worth surfacing even though the request itself recovers.
    console.error("[getCurrentUser] no DB row for signed-in user, provisioning now", clerkId, email);

    return await db.user.create({
      // Role is resolved here too, not just in the webhook: this path exists precisely for
      // when the webhook did not run, and an admin provisioned this way would otherwise be
      // stuck as a USER until the next user.updated event.
      data: {
        clerkId,
        email,
        name,
        image: clerkUser.imageUrl,
        role: isAdmin(email) ? "ADMIN" : "USER",
        streak: { create: {} },
      },
      include: USER_INCLUDE,
    });
  } catch (err) {
    // Two things can legitimately collide here. Concurrent requests (the layout and the
    // page it wraps render in parallel on a cold session) can both reach this point, and
    // `email` is unique independently of `clerkId`, so an account deleted and recreated
    // in Clerk arrives with a new clerkId but an address already on file.
    const byClerkId = await db.user.findUnique({ where: { clerkId }, include: USER_INCLUDE });
    if (byClerkId) return byClerkId;

    const byEmail = await db.user.findUnique({ where: { email } });
    if (byEmail) {
      // Clerk verifies email ownership before a session exists, so re-pointing the row at
      // the new Clerk id reunites the user with their history rather than stranding them
      // behind a unique-constraint violation they can never clear.
      console.error("[getCurrentUser] adopting existing row for", email, "under new clerkId", clerkId);
      return db.user.update({
        where: { id: byEmail.id },
        data: { clerkId, name, image: clerkUser.imageUrl },
        include: USER_INCLUDE,
      });
    }

    console.error("[getCurrentUser] provisioning failed for", clerkId, email, err);
    return null;
  }
}

/**
 * For pages that cannot render without a user row.
 *
 * The distinction this draws matters: "no session" is a normal state with an obvious
 * destination (/login), while "valid session but no row" is a bug. The previous code
 * treated both as /login, which meant the bug redirected a signed-in user to a login page
 * that Clerk instantly bounced to the library — an invisible failure that looked like a
 * broken nav link and left nothing behind to debug. Throwing surfaces it as an error page
 * with a digest that maps to a logged stack trace instead.
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (user) return user;

  const { userId } = await auth();
  if (!userId) redirect("/login");

  throw new Error(
    `Signed-in Clerk user ${userId} has no database row and could not be provisioned. ` +
      `Check the Clerk user.created webhook and CLERK_WEBHOOK_SECRET.`
  );
}
