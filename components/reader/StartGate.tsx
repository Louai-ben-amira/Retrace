"use client";

import { useTranslation } from "@/lib/i18n/TranslationProvider";

interface StartGateProps {
  storyTitle: string;
  onStart: () => void;
}

export function StartGate({ storyTitle, onStart }: StartGateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center gap-6 sm:gap-8 px-5 sm:px-6 py-16 animate-scale-in">
      <div>
        <p className="text-sm text-brand-500 mb-3 tracking-wide animate-fade-up">{t.reader.readyToRetrace}</p>
        <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-bold text-cream text-balance animate-fade-up" style={{ animationDelay: "80ms" }}>{storyTitle}</h1>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="animate-fade-up inline-flex items-center gap-2 bg-brand-500 text-ink font-semibold text-base sm:text-lg px-8 py-4 sm:py-3.5 rounded-full shadow-[0_0_32px_rgba(14,207,183,0.25)] hover:bg-brand-300 hover:shadow-[0_0_48px_rgba(14,207,183,0.4)] sm:hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
        style={{ animationDelay: "160ms" }}
      >
        {t.reader.start} <span aria-hidden>→</span>
      </button>
      {/* The desktop hint names the "T" hotkey, which doesn't exist on a soft keyboard. */}
      <p className="hidden sm:block text-xs text-cream/30 animate-fade-up" style={{ animationDelay: "220ms" }}>{t.reader.startHint}</p>
      <p className="sm:hidden text-xs text-cream/30 animate-fade-up" style={{ animationDelay: "220ms" }}>{t.reader.tapToType}</p>
    </div>
  );
}
