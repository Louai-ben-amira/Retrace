// A static segment, so it wins over the sibling [slug] route rather than falling into
// its English-only CONTENT map — support copy is the one legal page a learner is most
// likely to reach before they can read English comfortably.
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { getLandingCopy } from "@/lib/i18n/landing";
import { UI_LANG_COOKIE } from "@/lib/i18n/cookies";
import { isRTL, isSupportedLanguage } from "@/lib/languages";
import { SUPPORT_EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Retrace" };

export default async function ContactPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(UI_LANG_COOKIE)?.value ?? "";
  // Unlike the landing page there is no LanguageGate here: someone arriving from a
  // support link, a receipt or a search result must still get a readable page, so an
  // unset or unknown cookie falls back to English instead of blocking on a chooser.
  const lang = isSupportedLanguage(raw) ? raw : "en";
  const copy = getLandingCopy(lang);
  const t = copy.contactPage;
  const dir = isRTL(lang) ? "rtl" : "ltr";

  return (
    <main
      dir={dir}
      className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised text-cream"
    >
      <div
        aria-hidden
        className="fixed w-[600px] h-[600px] rounded-full pointer-events-none -top-64 -right-56 bg-[radial-gradient(circle,rgba(14,207,183,0.07)_0%,transparent_70%)]"
      />

      <div className="relative max-w-2xl mx-auto px-5 sm:px-6 py-14 sm:py-20">
        <Link
          href="/"
          dir="ltr"
          className="inline-flex items-center gap-2 font-serif font-bold text-lg text-cream tracking-tight mb-12"
        >
          <Image src="/logo-icon.png" alt="" width={26} height={26} className="rounded-md" priority />
          <span>Re<span className="text-brand-500">trace</span></span>
        </Link>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-cream mb-8">
          {t.title}
        </h1>

        <p className="text-[15px] sm:text-base text-cream/60 leading-relaxed">{t.intro}</p>

        <div className="mt-8 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-5 sm:px-6 sm:py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-cream/40 mb-2">
            {t.emailHeading}
          </p>
          {/* Forced LTR: an email address reads left-to-right even inside an RTL page,
              and without this the dot-separated domain reorders in Arabic. */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Retrace`}
            dir="ltr"
            className="inline-block text-lg sm:text-xl font-medium text-brand-400 hover:text-brand-300 transition-colors break-all"
          >
            {SUPPORT_EMAIL}
          </a>
          <p className="text-sm text-cream/40 mt-3">{t.responseNote}</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=Retrace`}
            className="mt-5 inline-block bg-brand-500 text-ink text-sm font-semibold px-5 py-3 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 sm:hover:-translate-y-px transition-all duration-200"
          >
            {t.emailCta}
          </a>
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-wrap gap-x-6 gap-y-3">
          <Link href="/legal/about" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{copy.footer.about}</Link>
          <Link href="/legal/privacy" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{copy.footer.privacy}</Link>
          <Link href="/legal/terms" className="text-[13px] text-cream/50 hover:text-cream transition-colors">{copy.footer.terms}</Link>
          <Link href="/" className="text-[13px] text-brand-400 hover:text-brand-300 transition-colors">{t.backHome}</Link>
        </div>
      </div>
    </main>
  );
}
