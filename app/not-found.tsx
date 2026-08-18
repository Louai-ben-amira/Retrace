import Link from "next/link";
import { cookies } from "next/headers";
import { getAppCopy } from "@/lib/i18n/app";
import { UI_LANG_COOKIE } from "@/lib/i18n/cookies";
import { isRTL } from "@/lib/languages";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Page not found" };

// Reads the language cookie directly rather than the DB user: not-found renders for
// signed-out visitors and bad URLs too, where there may be no session at all.
export default function NotFound() {
  const lang = cookies().get(UI_LANG_COOKIE)?.value ?? "ar";
  const t = getAppCopy(lang);

  return (
    <div
      dir={isRTL(lang) ? "rtl" : "ltr"}
      className="grain relative min-h-[100svh] bg-gradient-to-b from-ink via-ink to-ink-raised text-cream flex items-center justify-center px-5 py-10 overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-52 -left-52 bg-[radial-gradient(circle,rgba(14,207,183,0.10)_0%,transparent_70%)]"
      />
      <div className="relative text-center max-w-sm">
        <p className="font-serif text-6xl font-black text-brand-500/25 mb-4">404</p>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">{t.errors.notFoundTitle}</h1>
        <p className="text-cream/50 text-sm leading-relaxed mb-8">{t.errors.notFoundBody}</p>
        <Link
          href="/library"
          className="inline-block bg-brand-500 text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-brand-300 transition-colors"
        >
          {t.errors.backToLibrary}
        </Link>
      </div>
    </div>
  );
}
