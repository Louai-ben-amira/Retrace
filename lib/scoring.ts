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

export function lineXP(fuzzyScore: number, timeMs: number, streakDays: number): number {
  const base = XP_PER_LINE * speedBonus(timeMs);
  const streakBonus = streakDays * 2;
  return Math.round(base + streakBonus);
}

export function streakXPBonus(streakDays: number): number {
  return streakDays * 2;
}
