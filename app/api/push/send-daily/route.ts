import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";
import { getTranslation } from "@/lib/languages";
import { getAppCopy } from "@/lib/i18n/app";
import type { Translations } from "@/types";

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidEmail = process.env.VAPID_EMAIL;

if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
  webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
}

interface StoredSubscription {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  [key: string]: unknown;
}

// Authorised either by Vercel Cron (Authorization: Bearer $CRON_SECRET) or by a
// signed-in admin firing it manually. The session check alone used to be the only path,
// which meant no scheduler could ever call this — cron requests carry no Clerk session,
// so the "daily" notification never actually fired on a schedule.
async function isAuthorised(req: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = req.headers.get("authorization");
    if (header === `Bearer ${cronSecret}`) return true;
  }

  const { userId } = await auth();
  if (!userId) return false;
  const admin = await db.user.findUnique({ where: { clerkId: userId } });
  return admin?.role === "ADMIN";
}

// Vercel Cron issues GET, not POST. Both are supported: GET for the schedule, POST for
// the manual admin trigger.
export async function GET(req: NextRequest) {
  return sendDaily(req);
}

// Finds every user who has at least one saved push subscription and at least one word
// due for review, and sends them a "word of the day" notification for their single most
// overdue word, in their own language.
export async function POST(req: NextRequest) {
  return sendDaily(req);
}

async function sendDaily(req: NextRequest) {
  try {
    if (!(await isAuthorised(req))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!vapidPublicKey || !vapidPrivateKey || !vapidEmail) {
      return NextResponse.json({ error: "VAPID keys are not configured" }, { status: 500 });
    }

    const now = new Date();
    const users = await db.user.findMany({
      where: {
        pushSubscriptions: { some: {} },
        vocabWords: { some: { nextReviewAt: { lte: now } } },
      },
      include: {
        pushSubscriptions: true,
        vocabWords: {
          where: { nextReviewAt: { lte: now } },
          orderBy: { nextReviewAt: "asc" },
          take: 1,
        },
      },
    });

    let sent = 0;
    let removed = 0;

    for (const user of users) {
      const word = user.vocabWords[0];
      if (!word) continue;
      const translation = getTranslation(word.translations as Translations, user.nativeLanguage, word.word);

      // Title follows the user's UI language; only the word's gloss used to be localised.
      const payload = JSON.stringify({
        title: getAppCopy(user.uiLanguage).push.wordOfTheDay,
        body: `${word.word} · ${translation}`,
        url: "/vocabulary/mine/review",
      });

      for (const sub of user.pushSubscriptions) {
        const subscription = sub.subscription as unknown as StoredSubscription;
        try {
          await webpush.sendNotification(subscription, payload);
          sent++;
        } catch (err) {
          const statusCode = (err as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await db.pushSubscription.delete({ where: { id: sub.id } });
            removed++;
          } else {
            console.error("[POST /api/push/send-daily] send failed", err);
          }
        }
      }
    }

    return NextResponse.json({ ok: true, usersNotified: users.length, sent, removedStale: removed });
  } catch (err) {
    console.error("[POST /api/push/send-daily]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
