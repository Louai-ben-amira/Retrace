/**
 * SM-2 spaced repetition for the /vocabulary system.
 *
 * Kept separate from lib/srs.ts (the pre-existing word-bank SRS module, which uses a
 * 0-3 Anki-style rating and a different card shape) so the two vocabulary systems stay
 * fully independent, as requested.
 */

export type ReviewResult = "easy" | "good" | "hard" | "forgot";
export type MasteryLevel = "NEW" | "LEARNING" | "GOOD" | "MASTERED";

const QUALITY: Record<ReviewResult, number> = { easy: 5, good: 4, hard: 2, forgot: 0 };

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

export interface VocabCardState {
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface VocabSchedule extends VocabCardState {
  masteryLevel: MasteryLevel;
  nextReviewAt: Date;
}

export function scheduleVocabReview(card: VocabCardState, result: ReviewResult, now: Date = new Date()): VocabSchedule {
  const q = QUALITY[result];
  let { interval, easeFactor, reviewCount } = card;

  easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR;

  let masteryLevel: MasteryLevel;

  if (result === "forgot") {
    interval = 1;
    masteryLevel = "LEARNING";
  } else {
    reviewCount += 1;
    if (result === "hard") interval = Math.max(1, Math.round(interval * 0.8));
    else if (result === "good") interval = Math.round(interval * easeFactor);
    else interval = Math.round(interval * easeFactor * 1.3); // easy

    masteryLevel = interval < 3 ? "LEARNING" : interval <= 14 ? "GOOD" : "MASTERED";
  }

  const nextReviewAt = new Date(now);
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);

  return { interval, easeFactor, reviewCount, masteryLevel, nextReviewAt };
}

export const VOCAB_MASTERY_META: Record<MasteryLevel, { label: string; badge: "stone" | "rose" | "amber" | "brand"; dot: string; bar: string; text: string }> = {
  NEW:      { label: "New",      badge: "stone", dot: "bg-white/25",  bar: "bg-white/20",  text: "text-cream/50" },
  LEARNING: { label: "Learning", badge: "rose",  dot: "bg-rose-400",  bar: "bg-rose-400",  text: "text-rose-300" },
  GOOD:     { label: "Good",     badge: "amber", dot: "bg-amber-400", bar: "bg-amber-400", text: "text-amber-300" },
  MASTERED: { label: "Mastered", badge: "brand", dot: "bg-brand-500", bar: "bg-brand-500", text: "text-brand-400" },
};
