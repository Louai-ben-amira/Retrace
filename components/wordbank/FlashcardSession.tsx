"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { masteryLabel } from "@/lib/srs";
import { getTranslation, isRTL } from "@/lib/languages";
import { useTranslation } from "@/lib/i18n/TranslationProvider";
import type { WordBankEntry, Translations } from "@/types";

interface FlashcardData extends WordBankEntry {
  story: { title: string };
}

interface FlashcardSessionProps {
  initialCards: FlashcardData[];
  nativeLanguage?: string;
}

interface LeveledUpWord {
  word: string;
  interval: number;
}

export function FlashcardSession({ initialCards, nativeLanguage = "ar" }: FlashcardSessionProps) {
  const { t } = useTranslation();
  const RATINGS: { value: 0 | 1 | 2 | 3; label: string; className: string }[] = [
    { value: 0, label: t.common.rating.forgot, className: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25" },
    { value: 1, label: t.common.rating.hard, className: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25" },
    { value: 2, label: t.common.rating.good, className: "bg-brand-500/15 text-brand-400 hover:bg-brand-500/25" },
    { value: 3, label: t.common.rating.easy, className: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25" },
  ];
  const [cards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [leveledUp, setLeveledUp] = useState<LeveledUpWord[]>([]);

  const card = cards[index];

  // Space bar flips the card, mirroring the tap-to-reveal gesture.
  useEffect(() => {
    if (!card) return;
    function onKey(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card]);

  async function handleRate(rating: 0 | 1 | 2 | 3) {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      const priorMastery = masteryLabel(card.reviewCount, card.interval);
      const res = await fetch("/api/wordbank/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: card.id, rating }),
      });
      if (res.ok) {
        const data = (await res.json()) as { word: WordBankEntry };
        const newMastery = masteryLabel(data.word.reviewCount, data.word.interval);
        if (priorMastery !== "mastered" && newMastery === "mastered") {
          setLeveledUp((l) => [...l, { word: card.word, interval: data.word.interval }]);
        }
      }
      setReviewedCount((n) => n + 1);
      setFlipped(false);
      setIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grain fixed inset-0 z-50 bg-gradient-to-b from-ink via-ink to-ink-raised overflow-y-auto overflow-x-hidden">
      <div
        aria-hidden
        className="fixed w-[700px] h-[500px] rounded-full pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgba(14,207,183,0.07)_0%,transparent_70%)] animate-pulse-glow"
      />
      <div
        aria-hidden
        className="fixed w-[500px] h-[500px] rounded-full pointer-events-none -bottom-56 -right-40 bg-[radial-gradient(circle,rgba(14,207,183,0.05)_0%,transparent_70%)] animate-pulse-glow [animation-direction:reverse]"
      />

      {cards.length > 0 && index < cards.length && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${(index / cards.length) * 100}%` }} />
        </div>
      )}

      <Link
        href="/wordbank"
        aria-label={t.common.close}
        className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 inline-flex items-center justify-center w-11 h-11 rounded-full text-cream/30 hover:text-cream/70 hover:bg-white/5 text-sm transition-colors"
      >
        ✕
      </Link>
      {cards.length > 0 && index < cards.length && (
        <span className="absolute top-4 right-3 sm:top-5 sm:right-5 text-cream/30 text-xs sm:text-sm font-medium tracking-wide">
          {t.wordbank.cardOf(index + 1, cards.length)}
        </span>
      )}

      <div className="relative flex flex-col items-center justify-center min-h-[100dvh] px-4 sm:px-6 py-20">
        {cards.length === 0 ? (
          <div className="text-center animate-scale-in">
            <p className="text-lg text-cream mb-2">{t.wordbank.allCaughtUp}</p>
            <p className="text-cream/40 mb-6">{t.wordbank.noCardsDue}</p>
            <Link href="/wordbank" className="text-brand-400 hover:underline text-sm">{t.wordbank.backToWordBank}</Link>
          </div>
        ) : index >= cards.length ? (
          <div className="text-center animate-scale-in">
            <div className="text-4xl mb-4 text-brand-500">✦</div>
            <p className="text-lg text-cream mb-2">{t.wordbank.sessionComplete}</p>
            <p className="text-cream/40 mb-8">{t.wordbank.reviewedCount(reviewedCount)}</p>

            {leveledUp.length > 0 && (
              <div className="mb-8 max-w-sm w-full mx-auto">
                <p className="text-sm text-brand-400 font-medium mb-3">
                  {t.wordbank.leveledUp(leveledUp.length)}
                </p>
                <div className="space-y-1.5">
                  {leveledUp.map((w) => (
                    <div key={w.word} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                      <span className="text-cream font-medium">{w.word}</span>
                      <span className="text-cream/40 text-xs">{t.wordbank.nextIn(w.interval)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Link href="/wordbank" className="inline-block bg-brand-500 text-ink font-semibold px-6 py-3.5 rounded-full hover:bg-brand-300 transition-colors">
              {t.wordbank.backToWordBankBtn}
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <button
              key={card.id}
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="animate-scale-in w-full min-h-[260px] sm:min-h-[300px] bg-white/5 border border-white/[0.1] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center hover:border-brand-500/25 transition-colors"
            >
              {!flipped ? (
                <>
                  <p className="text-xs text-cream/30 mb-5">{t.wordbank.whatDoesThisMean}</p>
                  <p className="font-serif text-4xl sm:text-5xl font-bold text-cream mb-5 break-words max-w-full">{card.word}</p>
                  <p className="text-xs text-cream/30">{t.wordbank.tapToReveal}</p>
                </>
              ) : (
                <>
                  <p
                    className={cn("text-2xl sm:text-3xl text-cream mb-4 break-words max-w-full", (nativeLanguage === "ar") && "font-arabic")}
                    dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}
                  >
                    {getTranslation(card.translations as Translations, nativeLanguage)}
                  </p>
                  <p className="text-sm sm:text-base text-cream/50 italic mb-4">{card.example}</p>
                  <p className="text-xs text-cream/30">{t.wordbank.fromStory(card.story.title)}</p>
                </>
              )}
            </button>

            {flipped ? (
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 mt-6">
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleRate(r.value)}
                    className={cn("py-3.5 sm:py-3 min-h-[48px] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 active:scale-95", r.className)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-cream/30 mt-6">{t.wordbank.reviewHint}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
