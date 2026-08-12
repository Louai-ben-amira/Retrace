import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { SUPPORTED_LANGUAGE_CODES } from "@/lib/languages";
import { UI_LANG_COOKIE, NATIVE_LANG_COOKIE, LANG_COOKIE_MAX_AGE } from "@/lib/i18n/cookies";

const AnonPreferencesSchema = z.object({
  uiLanguage: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]),
  nativeLanguage: z.enum(SUPPORTED_LANGUAGE_CODES as [string, ...string[]]),
});

export async function POST(req: NextRequest) {
  try {
    const { uiLanguage, nativeLanguage } = AnonPreferencesSchema.parse(await req.json());

    const res = NextResponse.json({ ok: true });
    const cookieOptions = {
      maxAge: LANG_COOKIE_MAX_AGE,
      path: "/",
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
    };
    res.cookies.set(UI_LANG_COOKIE, uiLanguage, cookieOptions);
    res.cookies.set(NATIVE_LANG_COOKIE, nativeLanguage, cookieOptions);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 });
    console.error("[POST /api/preferences/anon]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
