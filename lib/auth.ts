import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

/**
 * Looks up the signed-in user's DB row (with subscription + streak).
 * Wrapped in React's cache() so the layout and the page it wraps share
 * one query per request instead of each re-fetching the same row.
 */
export const getCurrentUser = cache(async () => {
  const { userId } = await auth();
  if (!userId) return null;
  return db.user.findUnique({
    where: { clerkId: userId },
    include: { subscription: true, streak: true },
  });
});
