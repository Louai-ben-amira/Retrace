import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { isSupportedLanguage } from "@/lib/languages";
import { UI_LANG_COOKIE, NATIVE_LANG_COOKIE } from "@/lib/i18n/cookies";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.onboarded) redirect("/library");

  // If they already picked languages on the landing page before signing up, carry
  // that choice through instead of asking again.
  const cookieStore = await cookies();
  const uiLangCookie = cookieStore.get(UI_LANG_COOKIE)?.value;
  const nativeLangCookie = cookieStore.get(NATIVE_LANG_COOKIE)?.value;

  return (
    <OnboardingFlow
      defaultNativeLanguage={nativeLangCookie && isSupportedLanguage(nativeLangCookie) ? nativeLangCookie : user.nativeLanguage}
      defaultUiLanguage={uiLangCookie && isSupportedLanguage(uiLangCookie) ? uiLangCookie : user.uiLanguage}
    />
  );
}
