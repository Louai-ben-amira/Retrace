import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Offline" };

// Precached by public/sw.js at install time and served when a navigation fails with no
// cached copy of the requested page. Must be a static, dependency-free route — it has to
// render with no network and no database.
export default function OfflinePage() {
  return (
    <div className="grain relative min-h-[100svh] bg-gradient-to-b from-ink via-ink to-ink-raised text-cream flex items-center justify-center px-5 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-52 -left-52 bg-[radial-gradient(circle,rgba(14,207,183,0.10)_0%,transparent_70%)]"
      />
      <div className="relative text-center max-w-sm">
        <div className="text-4xl mb-5" aria-hidden>
          ⚡
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">You&rsquo;re offline</h1>
        <p className="text-cream/50 text-sm leading-relaxed mb-8">
          Stories you have already opened stay available without a connection. Anything new needs
          you back online.
        </p>
        <Link
          href="/library"
          className="inline-block bg-brand-500 text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-brand-300 transition-colors"
        >
          Back to library
        </Link>
      </div>
    </div>
  );
}
