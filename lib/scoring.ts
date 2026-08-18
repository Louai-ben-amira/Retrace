/**
 * XP and score calculation
 */

export const XP_PER_LINE = 10;
export const XP_STORY_BONUS = 50;

export function speedBonus(timeMs: number): number {
  const seconds = timeMs / 1000;
  if (seconds < 5) return 1.2;
  if (seconds <= 15) return 1.0;
  return 0.8;
}

export function lineScore(fuzzyScore: number, timeMs: number): number {
  return Math.round(fuzzyScore * 100 * speedBonus(timeMs));
}

/**
 * XP for a single passed line. `fuzzyScore` (0–1) scales the base award, so a line typed
 * at the 0.85 pass threshold earns meaningfully less than a clean one — the parameter was
 * previously accepted and then ignored, making every pass worth exactly the same.
 *
 * Called from both the client (useReader, for the in-session running total) and the server
 * (/api/progress/sync, which persists User.totalXp). Both must stay on this one function or
 * the number shown during a session stops matching the number that gets banked.
 */
export function lineXP(fuzzyScore: number, timeMs: number, streakDays: number): number {
  const base = XP_PER_LINE * speedBonus(timeMs) * fuzzyScore;
  const streakBonus = streakDays * 2;
  return Math.round(base + streakBonus);
}

export function streakXPBonus(streakDays: number): number {
  return streakDays * 2;
}
