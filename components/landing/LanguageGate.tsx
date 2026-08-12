"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUPPORTED_LANGUAGES, type LanguageCode } from "@/lib/languages";
import { LanguageCard } from "@/components/ui/LanguageCard";
import { cn } from "@/lib/cn";

const STEP_COPY = [
  { title: "What's your native language?", subtitle: "We'll show translations in this language while you read." },
  { title: "What language should the app be in?", subtitle: "Menus, buttons, and messages will appear in this language." },
] as const;

export function LanguageGate() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [nativeLanguage, setNativeLanguage] = useState<LanguageCode | null>(null);
  const [uiLanguage, setUiLanguage] = useState<LanguageCode | null>(null);
  const [uiTouched, setUiTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function selectNative(code: LanguageCode) {
    setNativeLanguage(code);
    if (!uiTouched) setUiLanguage(code);
  }

  function selectUi(code: LanguageCode) {
    setUiLanguage(code);
    setUiTouched(true);
  }

  async function finish() {
    if (!nativeLanguage || !uiLanguage) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/preferences/anon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uiLanguage, nativeLanguage }),
      });
      if (!res.ok) throw new Error("Failed to save preferences");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  }

  const copy = STEP_COPY[step];
  const selected = step === 0 ? nativeLanguage : uiLanguage;

  return (
    <div className="grain relative min-h-screen bg-gradient-to-b from-ink via-ink to-ink-raised flex items-center justify-center px-4 py-16 overflow-hidden">
      <div
        aria-hidden
        className="absolute w-[700px] h-[700px] rounded-full pointer-events-none -top-52 -left-52 bg-[radial-gradient(circle,rgba(14,207,183,0.12)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none -bottom-56 -right-40 bg-[radial-gradient(circle,rgba(14,207,183,0.06)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />

      <div className="relative w-full max-w-2xl animate-fade-up">
        <div className="text-center mb-8">
          <span className="font-serif font-bold text-xl text-cream tracking-tight">
            Re<span className="text-brand-500">trace</span>
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {STEP_COPY.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === step ? "w-8 bg-brand-500" : i < step ? "w-1.5 bg-brand-500/60" : "w-1.5 bg-white/15"
              )}
            />
          ))}
        </div>

        <div key={step} className="rounded-2xl border border-white/[0.08] bg-ink-surface p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(14,207,183,0.06)] animate-scale-in">
          <div className="text-center mb-8">
            <h1 className="font-serif text-2xl sm:text-[28px] font-bold text-cream tracking-tight">{copy.title}</h1>
            <p className="text-cream/50 mt-2 text-sm">{copy.subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <LanguageCard
                key={lang.code}
                flag={lang.flag}
                name={lang.nameNative}
                selected={selected === lang.code}
                onClick={() => (step === 0 ? selectNative(lang.code) : selectUi(lang.code))}
              />
            ))}
          </div>

          {error && <p className="text-sm text-rose-400 text-center mt-6">{error}</p>}

          <div className="flex items-center justify-between mt-10">
            <button
              type="button"
              onClick={() => setStep(0)}
              disabled={step === 0 || saving}
              className="text-sm text-cream/40 hover:text-cream/70 transition-colors disabled:opacity-0 disabled:pointer-events-none"
            >
              ← Back
            </button>

            {step === 0 ? (
              <button
                type="button"
                onClick={() => setStep(1)}
                disabled={!nativeLanguage}
                className="bg-brand-500 text-ink text-sm font-semibold px-6 py-2.5 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void finish()}
                disabled={!uiLanguage || saving}
                className="bg-brand-500 text-ink text-sm font-semibold px-6 py-2.5 rounded-lg shadow-[0_0_24px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none inline-flex items-center gap-2"
              >
                {saving && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                )}
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
