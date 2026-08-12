"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReviewResult } from "@/lib/vocabSrs";
import { getTranslation, isRTL } from "@/lib/languages";
import type { MasteryLevel, VocabWordWithLine, Translations } from "@/types";

interface VocabularyReviewSessionProps {
  initialCards: VocabWordWithLine[];
  nativeLanguage?: string;
}

interface ReviewedWord {
  word: string;
  interval: number;
  leveledUp: boolean;
}

const RATINGS: { value: ReviewResult; label: string; className: string }[] = [
  { value: "forgot", label: "Forgot", className: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25" },
  { value: "hard", label: "Hard", className: "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25" },
  { value: "good", label: "Good", className: "bg-brand-500/15 text-brand-400 hover:bg-brand-500/25" },
  { value: "easy", label: "Easy", className: "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25" },
];

export function VocabularyReviewSession({ initialCards, nativeLanguage = "ar" }: VocabularyReviewSessionProps) {
  const [cards] = useState(initialCards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState<ReviewedWord[]>([]);

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

  async function handleRate(result: ReviewResult) {
    if (!card || submitting) return;
    setSubmitting(true);
    try {
      const priorMastery: MasteryLevel = card.masteryLevel;
      const res = await fetch("/api/vocabulary/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wordId: card.id, result }),
      });
      if (res.ok) {
        const data = (await res.json()) as { word: { masteryLevel: MasteryLevel; interval: number } };
        setReviewed((r) => [
          ...r,
          { word: card.word, interval: data.word.interval, leveledUp: priorMastery !== "MASTERED" && data.word.masteryLevel === "MASTERED" },
        ]);
      }
      setFlipped(false);
      setIndex((i) => i + 1);
    } finally {
      setSubmitting(false);
    }
  }

  const leveledUp = reviewed.filter((r) => r.leveledUp);

  return (
    <div className="grain fixed inset-0 z-50 bg-gradient-to-b from-ink via-ink to-ink-raised overflow-y-auto">
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

      <Link href="/vocabulary/mine" className="absolute top-5 left-5 text-cream/30 hover:text-cream/70 text-sm transition-colors">
        ✕
      </Link>
      {cards.length > 0 && index < cards.length && (
        <span className="absolute top-5 right-5 text-cream/30 text-sm font-medium tracking-wide">
          {index + 1} of {cards.length}
        </span>
      )}

      <div className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {cards.length === 0 ? (
          <div className="text-center animate-scale-in">
            <p className="text-lg text-cream mb-2">All caught up!</p>
            <p className="text-cream/40 mb-6">No words are due for review right now.</p>
            <Link href="/vocabulary/mine" className="text-brand-400 hover:underline text-sm">← Back to vocabulary</Link>
          </div>
        ) : index >= cards.length ? (
          <div className="text-center animate-scale-in">
            <div className="text-4xl mb-4 text-brand-500">✦</div>
            <p className="text-lg text-cream mb-2">Session complete</p>
            <p className="text-cream/40 mb-8">You reviewed {reviewed.length} word{reviewed.length === 1 ? "" : "s"}.</p>

            {leveledUp.length > 0 && (
              <p className="text-sm text-brand-400 font-medium mb-4">
                🎉 {leveledUp.length} word{leveledUp.length === 1 ? "" : "s"} leveled up to Mastered
              </p>
            )}

            {reviewed.length > 0 && (
              <div className="mb-8 max-w-sm w-full mx-auto space-y-1.5 max-h-[280px] overflow-y-auto">
                {reviewed.map((w, i) => (
                  <div key={`${w.word}-${i}`} className="flex items-center justify-between text-sm bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                    <span className="text-cream font-medium flex items-center gap-1.5">
                      {w.leveledUp && <span aria-hidden>🎉</span>}
                      {w.word}
                    </span>
                    <span className="text-cream/40 text-xs">next in {w.interval}d</span>
                  </div>
                ))}
              </div>
            )}

            <Link href="/vocabulary/mine" className="bg-brand-500 text-ink font-semibold px-6 py-3 rounded-full hover:bg-brand-300 transition-colors">
              Back to vocabulary
            </Link>
          </div>
        ) : (
          <div className="w-full max-w-lg">
            <button
              key={card.id}
              type="button"
              onClick={() => setFlipped((f) => !f)}
              className="animate-scale-in w-full min-h-[300px] bg-white/5 border border-white/[0.1] rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-brand-500/25 transition-colors"
            >
              {!flipped ? (
                <>
                  <p className="text-xs text-cream/30 mb-5">What does this mean?</p>
                  <p className="font-serif text-5xl font-bold text-cream mb-5">{card.word}</p>
                  <p className="text-xs text-cream/30">Tap or press Space to reveal</p>
                </>
              ) : (
                <>
                  <p
                    className={cn("text-3xl text-cream mb-4", (nativeLanguage === "ar") && "font-arabic")}
                    dir={isRTL(nativeLanguage) ? "rtl" : "ltr"}
                  >
                    {getTranslation(card.translations as Translations, nativeLanguage)}
                  </p>
                  <p className="text-cream/50 italic mb-4">{card.line.text}</p>
                  <p className="text-xs text-cream/30">from {card.story.title}</p>
                </>
              )}
            </button>

            {flipped ? (
              <div className="grid grid-cols-4 gap-2 mt-6">
                {RATINGS.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleRate(r.value)}
                    className={cn("py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50", r.className)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-cream/30 mt-6">Click the card to see the answer, then rate how well you knew it</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
