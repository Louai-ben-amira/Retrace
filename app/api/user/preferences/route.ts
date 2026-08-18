import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { SUPPORTED_LANGUAGE_CODES } from "@/lib/languages";

const PreferencesSchema = z.object({
  uiLanguage: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]).optional(),
  nativeLanguage: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]).optional(),
  targetLanguage: z.literal("en").optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = PreferencesSchema.parse(await req.json());
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ error: "No preferences provided" }, { status: 400 });
    }

    // Only a call carrying all three language choices is the onboarding flow finishing.
    // Setting `onboarded: true` unconditionally meant the reading-language switcher in the
    // nav (which PATCHes nativeLanguage alone) silently completed onboarding, letting a
    // user skip the flow entirely.
    const completesOnboarding = Boolean(body.uiLanguage && body.nativeLanguage && body.targetLanguage);

    const user = await db.user.update({
      where: { clerkId: userId },
      data: { ...body, ...(completesOnboarding ? { onboarded: true } : {}) },
    });

    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[PATCH /api/user/preferences]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
