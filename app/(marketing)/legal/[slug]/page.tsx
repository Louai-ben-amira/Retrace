import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Paddle is the merchant of record for Retrace, and its seller agreement requires publicly
// reachable Terms and Privacy pages. These previously existed only as `href="#"` in the
// landing footer, which is a compliance gap rather than a cosmetic one.
const CONTENT: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About Retrace",
    body: [
      "Retrace is an English learning platform for Arabic, French, Turkish, Spanish, and Persian speakers. We help you learn English through real stories — read, listen, and type line by line.",
      "Every story is graded by difficulty and spoken aloud, so you build reading, listening, and spelling together rather than one at a time. Words you meet are collected automatically into a personal vocabulary bank and returned to you on a spaced-repetition schedule.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "Retrace collects your email address and learning progress to provide the service. We do not sell your data.",
      "Authentication is handled by Clerk. Audio is processed by ElevenLabs. Payments are handled by Paddle, who act as the merchant of record and process your billing details directly — Retrace never receives or stores your card information.",
      "You can request access to, export of, or deletion of your data at any time. Contact us at hello@retrace.academy for any privacy request.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "By using Retrace you agree to use the service for personal learning only.",
      "Pro subscriptions are billed through Paddle. You may cancel at any time from your settings page, and access continues until the end of the paid period. Refunds are handled per Paddle's refund policy.",
      "Story and vocabulary content is provided for learning use and remains the property of Retrace. Contact us at hello@retrace.academy with any question about these terms.",
    ],
  },
};

// Pre-renders the three known pages at build time; anything else falls through to
// notFound() rather than being generated on demand.
export function generateStaticParams() {
  return Object.keys(CONTENT).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = CONTENT[params.slug];
  return page ? { title: page.title } : {};
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const page = CONTENT[params.slug];
  if (!page) notFound();

  return (
    <main className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised text-cream">
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
          {page.title}
        </h1>

        <div className="space-y-5">
          {page.body.map((paragraph, i) => (
            <p key={i} className="text-[15px] sm:text-base text-cream/60 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-wrap gap-x-6 gap-y-3">
          <Link href="/legal/about" className="text-[13px] text-cream/50 hover:text-cream transition-colors">About</Link>
          <Link href="/legal/privacy" className="text-[13px] text-cream/50 hover:text-cream transition-colors">Privacy</Link>
          <Link href="/legal/terms" className="text-[13px] text-cream/50 hover:text-cream transition-colors">Terms</Link>
          <Link href="/" className="text-[13px] text-brand-400 hover:text-brand-300 transition-colors">Back to Retrace</Link>
        </div>
      </div>
    </main>
  );
}
