/**
 * Spaced repetition scheduling (simplified SM-2), Anki-style.
 * Ratings: 0=Again, 1=Hard, 2=Good, 3=Easy.
 */

export const MIN_EASE_FACTOR = 1.3;
export const DEFAULT_EASE_FACTOR = 2.5;

export type ReviewRating = 0 | 1 | 2 | 3;

export interface SrsCardState {
  interval: number;
  easeFactor: number;
  reviewCount: number;
}

export interface SrsSchedule extends SrsCardState {
  dueDate: Date;
}

export function scheduleReview(card: SrsCardState, rating: ReviewRating, now: Date = new Date()): SrsSchedule {
  let { interval, easeFactor, reviewCount } = card;

  if (rating === 0) {
    reviewCount = 0;
    interval = 1;
    easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
  } else {
    reviewCount += 1;
    if (reviewCount === 1) interval = 1;
    else if (reviewCount === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);

    if (rating === 1) easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
    else if (rating === 3) easeFactor = easeFactor + 0.15;
    // rating === 2 (Good) leaves easeFactor unchanged.
  }

  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() + interval);

  return { interval, easeFactor, reviewCount, dueDate };
}

export type MasteryLevel = "new" | "learning" | "good" | "mastered";

export function masteryLabel(reviewCount: number, interval: number): MasteryLevel {
  if (reviewCount === 0) return "new";
  if (interval < 3) return "learning";
  if (interval <= 14) return "good";
  return "mastered";
}

// New = never reviewed. Learning = actively studied but still shaky ("weak"). Good = solidifying.
// Mastered = long interval, well retained. Colors: gray / red / amber / teal.
export const MASTERY_META: Record<MasteryLevel, { label: string; badge: "stone" | "rose" | "amber" | "brand"; dot: string; bar: string; text: string }> = {
  new:      { label: "New",      badge: "stone", dot: "bg-white/25",  bar: "bg-white/20",  text: "text-cream/50" },
  learning: { label: "Learning", badge: "rose",  dot: "bg-rose-400",  bar: "bg-rose-400",  text: "text-rose-300" },
  good:     { label: "Good",     badge: "amber", dot: "bg-amber-400", bar: "bg-amber-400", text: "text-amber-300" },
  mastered: { label: "Mastered", badge: "brand", dot: "bg-brand-500", bar: "bg-brand-500", text: "text-brand-400" },
};
