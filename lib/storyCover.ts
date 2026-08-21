import { topicMeta } from "@/lib/topics";

/**
 * Art for a story card that has no `coverImage` yet.
 *
 * Every story gets a cover from day one: covers are optional in the database, but a card
 * with an empty box where the image should be looks broken, and an admin backfilling a
 * hundred stories is not a prerequisite for shipping the design. The palette is keyed off
 * the topic so the fallbacks read as a deliberate set rather than random noise — every
 * "food" story looks like a food story — and the topic emoji carries the subject.
 */
export interface CoverArt {
  from: string;
  to: string;
  glow: string;
  emoji: string;
}

// Deep, low-chroma pairs chosen against the ink-surface card background: light enough to
// read as artwork, dark enough that white title text over the gradient scrim stays legible.
const TOPIC_PALETTE: Record<string, { from: string; to: string; glow: string }> = {
  "daily-life": { from: "#1B2B3C", to: "#0B0E15", glow: "rgba(56,132,178,0.38)" },
  family:       { from: "#2C2036", to: "#0B0E15", glow: "rgba(150,96,196,0.34)" },
  travel:       { from: "#12303F", to: "#0B0E15", glow: "rgba(14,207,183,0.30)" },
  work:         { from: "#2A2417", to: "#0B0E15", glow: "rgba(196,150,60,0.30)" },
  culture:      { from: "#331A2B", to: "#0B0E15", glow: "rgba(206,86,150,0.30)" },
  food:         { from: "#33231A", to: "#0B0E15", glow: "rgba(214,124,60,0.32)" },
  health:       { from: "#12302A", to: "#0B0E15", glow: "rgba(72,190,150,0.30)" },
  education:    { from: "#1C2440", to: "#0B0E15", glow: "rgba(94,120,220,0.32)" },
  general:      { from: "#1E2430", to: "#0B0E15", glow: "rgba(120,150,180,0.26)" },
};

export function coverArt(topic: string | null | undefined): CoverArt {
  const meta = topicMeta(topic);
  const palette = TOPIC_PALETTE[meta.key] ?? TOPIC_PALETTE.general;
  return { ...palette, emoji: meta.emoji };
}

/** CSS `background` for the fallback art: a topic glow over a diagonal gradient. */
export function coverBackground(art: CoverArt): string {
  return `radial-gradient(115% 105% at 28% 0%, ${art.glow} 0%, transparent 62%), linear-gradient(158deg, ${art.from} 0%, ${art.to} 100%)`;
}

// Only images we host ourselves are handed to next/image — the optimizer rejects any
// hostname missing from next.config's remotePatterns with a runtime error, and one stray
// URL would take the whole library page down rather than just its own card.
const OPTIMIZED_HOST = ".public.blob.vercel-storage.com";

export function isOptimizedHost(src: string): boolean {
  try {
    return new URL(src).hostname.endsWith(OPTIMIZED_HOST);
  } catch {
    return false;
  }
}
