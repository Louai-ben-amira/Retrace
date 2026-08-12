/**
 * Fuzzy match between user input and target line.
 * Returns score 0.0 – 1.0.
 *
 * Thresholds:
 *   >= 0.85  → pass
 *   0.60–0.84 → retry once
 *   < 0.60   → fail, show answer
 */

function normalise(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function wordScore(a: string, b: string): number {
  const wa = a.split(" ");
  const wb = b.split(" ");
  const matches = wa.filter((w) => wb.includes(w)).length;
  return matches / Math.max(wa.length, wb.length);
}

export function fuzzyMatch(input: string, target: string): number {
  const normInput = normalise(input);
  const normTarget = normalise(target);

  if (normInput === normTarget) return 1.0;

  const maxLen = Math.max(normInput.length, normTarget.length);
  if (maxLen === 0) return 1.0;

  const lev = levenshtein(normInput, normTarget);
  const charScore = 1 - lev / maxLen;
  const wScore = wordScore(normInput, normTarget);

  // Weighted combination: 60% char-level, 40% word-level
  return Math.min(1, charScore * 0.6 + wScore * 0.4);
}

export const PASS_THRESHOLD = 0.85;
export const RETRY_THRESHOLD = 0.60;

export function getMatchResult(score: number): "pass" | "retry" | "fail" {
  if (score >= PASS_THRESHOLD) return "pass";
  if (score >= RETRY_THRESHOLD) return "retry";
  return "fail";
}
