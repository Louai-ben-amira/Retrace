"use client";

import { useEffect } from "react";

// Route-level error boundary. Client component by contract, so it cannot read cookies or
// the DB — copy is intentionally kept to the neutral English default rather than faking
// a locale lookup that could itself throw inside an error boundary.
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="grain relative min-h-[100svh] bg-gradient-to-b from-ink via-ink to-ink-raised text-cream flex items-center justify-center px-5 py-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none -top-52 -left-52 bg-[radial-gradient(circle,rgba(14,207,183,0.10)_0%,transparent_70%)]"
      />
      <div className="relative text-center max-w-sm">
        <div className="text-4xl mb-5" aria-hidden>
          ⚠️
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-3">Something went wrong</h1>
        <p className="text-cream/50 text-sm leading-relaxed mb-8">
          We hit an unexpected problem. Please try again.
        </p>
        {error.digest && <p className="text-cream/25 text-xs font-mono mb-6">Ref: {error.digest}</p>}
        <div className="flex flex-col xs:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="bg-brand-500 text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-brand-300 transition-colors"
          >
            Try again
          </button>
          <a
            href="/library"
            className="text-cream/70 border border-white/15 font-medium px-6 py-3.5 rounded-full hover:bg-white/5 hover:text-cream transition-colors text-center"
          >
            Back to library
          </a>
        </div>
      </div>
    </div>
  );
}
