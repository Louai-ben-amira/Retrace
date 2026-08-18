"use client";

import { useEffect, useRef, useState } from "react";

interface ShareCardProps {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  score: number;
  lines: number;
  wpm: number;
}

const CANVAS_WIDTH = 1200;
const CANVAS_HEIGHT = 630;

// Lifted straight from the app's own design tokens (tailwind.config.ts /
// lib/clerk-appearance.ts) so the shared card actually looks like Retrace
// instead of a generic "achievement card" template.
const INK = "#07090F";
const INK_RAISED = "#0A0D14";
const TEAL = "#0ECFB7";
const TEAL_SOFT = "#35D6BE";
const AMBER = "#FCD34D";
const CREAM = "#EAE6DF";
const CREAM_DIM = "rgba(234,230,223,0.55)";
const CREAM_FAINT = "rgba(234,230,223,0.16)";

const SERIF = `"Playfair Display", Georgia, serif`;
const SANS = `"DM Sans", -apple-system, "Segoe UI", sans-serif`;

// ── one-time, cached resources ──────────────────────────────────────────────

let logoPromise: Promise<HTMLImageElement> | null = null;
function loadLogo(): Promise<HTMLImageElement> {
  if (!logoPromise) {
    logoPromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = "/logo-icon.png";
    });
  }
  return logoPromise;
}

// A small repeating noise tile, drawn once and reused — mirrors the app's own
// .grain::after texture (feTurbulence noise, low opacity, overlay blend).
let noiseTile: HTMLCanvasElement | null = null;
function getNoiseTile(): HTMLCanvasElement {
  if (noiseTile) return noiseTile;
  const size = 128;
  const tile = document.createElement("canvas");
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext("2d")!;
  const imageData = tctx.createImageData(size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const v = Math.floor(Math.random() * 255);
    imageData.data[i] = v;
    imageData.data[i + 1] = v;
    imageData.data[i + 2] = v;
    imageData.data[i + 3] = 255;
  }
  tctx.putImageData(imageData, 0, 0);
  noiseTile = tile;
  return tile;
}

// ── drawing helpers ──────────────────────────────────────────────────────────

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
}

interface StatSpec {
  value: string;
  label: string;
  color: string;
}

function drawStatsRow(ctx: CanvasRenderingContext2D, stats: StatSpec[], centerX: number, y: number) {
  const colWidth = 220;
  const totalWidth = colWidth * stats.length;
  const startX = centerX - totalWidth / 2;

  stats.forEach((stat, i) => {
    const colCenter = startX + colWidth * i + colWidth / 2;

    if (i > 0) {
      ctx.save();
      ctx.strokeStyle = CREAM_FAINT;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX + colWidth * i, y - 30);
      ctx.lineTo(startX + colWidth * i, y + 14);
      ctx.stroke();
      ctx.restore();
    }

    ctx.textAlign = "center";
    ctx.fillStyle = stat.color;
    ctx.font = `700 44px ${SANS}`;
    ctx.fillText(stat.value, colCenter, y);

    ctx.fillStyle = CREAM_DIM;
    ctx.font = `600 14px ${SANS}`;
    // Manual letter-spacing — canvas has no `letter-spacing` property, so the
    // uppercase label is drawn character by character with a fixed gap,
    // matching the app's `tracking-[0.12em]` eyebrow-label convention.
    const spacing = 2.2;
    const chars = stat.label.split("");
    const widths = chars.map((c) => ctx.measureText(c).width);
    const totalLabelWidth = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let cx = colCenter - totalLabelWidth / 2;
    ctx.textAlign = "left";
    chars.forEach((c, ci) => {
      ctx.fillText(c, cx, y + 30);
      cx += widths[ci] + spacing;
    });
  });
}

async function drawShareCard(
  canvas: HTMLCanvasElement,
  props: { storyTitle: string; score: number; lines: number; wpm: number }
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const { storyTitle, score, lines, wpm } = props;

  const [logo] = await Promise.all([
    loadLogo(),
    "fonts" in document ? document.fonts.ready : Promise.resolve(),
  ]);

  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.save();
  roundedRectPath(ctx, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, 28);
  ctx.clip();

  // Base gradient — the same ink → ink-raised wash used behind every full-screen
  // panel in the app (Reader, FlashcardSession, VocabularyReviewSession).
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bg.addColorStop(0, INK);
  bg.addColorStop(1, INK_RAISED);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Two ambient teal glows, positioned exactly like the app's own decorative
  // `-top-64 -right-64` / `-bottom-72 -left-56` blobs.
  const glowTopRight = ctx.createRadialGradient(CANVAS_WIDTH - 140, -60, 0, CANVAS_WIDTH - 140, -60, 460);
  glowTopRight.addColorStop(0, "rgba(14,207,183,0.16)");
  glowTopRight.addColorStop(1, "rgba(14,207,183,0)");
  ctx.fillStyle = glowTopRight;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const glowBottomLeft = ctx.createRadialGradient(-80, CANVAS_HEIGHT + 40, 0, -80, CANVAS_HEIGHT + 40, 420);
  glowBottomLeft.addColorStop(0, "rgba(14,207,183,0.08)");
  glowBottomLeft.addColorStop(1, "rgba(14,207,183,0)");
  ctx.fillStyle = glowBottomLeft;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Film-grain texture, composited exactly like `.grain::after` (overlay blend, 5% opacity).
  ctx.save();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.05;
  const pattern = ctx.createPattern(getNoiseTile(), "repeat");
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  ctx.restore();

  // Full progress bar across the top — the reader's own "line of N" progress
  // motif, shown complete, glowing faintly like the app's brand-500 accents.
  ctx.save();
  ctx.shadowColor = "rgba(14,207,183,0.7)";
  ctx.shadowBlur = 14;
  ctx.fillStyle = TEAL;
  ctx.fillRect(0, 0, CANVAS_WIDTH, 6);
  ctx.restore();

  // Logo mark + wordmark, matching the real "Re[trace]" header lockup used
  // across every page (AppNav, landing nav, auth screens).
  const logoSize = 42;
  const logoX = 56;
  const logoY = 46;
  ctx.save();
  roundedRectPath(ctx, logoX, logoY, logoSize, logoSize, 11);
  ctx.clip();
  ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);
  ctx.restore();

  const wordmarkY = logoY + logoSize / 2 + 9;
  ctx.textAlign = "left";
  ctx.font = `700 27px ${SERIF}`;
  ctx.fillStyle = CREAM;
  ctx.fillText("Re", logoX + logoSize + 14, wordmarkY);
  const reWidth = ctx.measureText("Re").width;
  ctx.fillStyle = TEAL;
  ctx.fillText("trace", logoX + logoSize + 14 + reWidth, wordmarkY);

  // Headline — the story title, Playfair Display to match every serif
  // headline in the product, wrapped to at most two balanced lines.
  ctx.textAlign = "center";
  ctx.fillStyle = CREAM;
  ctx.font = `700 54px ${SERIF}`;
  const titleLines = wrapLines(ctx, storyTitle, CANVAS_WIDTH - 260, 2);
  const titleLineHeight = 62;
  const titleBlockTop = 250;
  titleLines.forEach((line, i) => ctx.fillText(line, CANVAS_WIDTH / 2, titleBlockTop + i * titleLineHeight));
  const titleBottom = titleBlockTop + (titleLines.length - 1) * titleLineHeight;

  // A short accent underline — a restrained signature flourish, the same
  // brand-500 used for every progress fill and glow in the app.
  const underlineY = titleBottom + 34;
  ctx.save();
  ctx.fillStyle = TEAL_SOFT;
  roundedRectPath(ctx, CANVAS_WIDTH / 2 - 34, underlineY, 68, 4, 2);
  ctx.fill();
  ctx.restore();

  // Three stat columns, mirroring the completion screen's own Score / XP / WPM
  // stat cards, colored the same way (teal hero stat, cream neutral, amber warm accent).
  const statsY = underlineY + 78;
  drawStatsRow(
    ctx,
    [
      { value: `${score}%`, label: "ACCURACY", color: TEAL },
      { value: `${lines}`, label: "LINES", color: CREAM },
      { value: `${wpm}`, label: "WPM", color: AMBER },
    ],
    CANVAS_WIDTH / 2,
    statsY
  );

  // Tagline
  ctx.textAlign = "center";
  ctx.fillStyle = CREAM_DIM;
  ctx.font = `500 21px ${SANS}`;
  ctx.fillText("I just retraced this story on Retrace", CANVAS_WIDTH / 2, statsY + 64);

  // Footer wordmark
  ctx.textAlign = "right";
  ctx.fillStyle = TEAL;
  ctx.font = `700 20px ${SANS}`;
  ctx.fillText("retrace.app", CANVAS_WIDTH - 56, CANVAS_HEIGHT - 46);

  ctx.restore();
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
    </svg>
  );
}

function ShareXIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231ZM17.083 19.77h1.833L7.084 4.126H5.117Z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 10.5 21 3m0 0h-5.5M21 3v5.5M10 14 3 21m0 0h5.5M3 21v-5.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function ShareCard({ storyId, storySlug, storyTitle, score, lines, wpm }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    setReady(false);
    void drawShareCard(canvas, { storyTitle, score, lines, wpm }).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [storyTitle, score, lines, wpm]);

  useEffect(() => () => clearTimeout(copyTimer.current), []);

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `retrace-${storySlug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  function handleShareTwitter() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://retrace.app";
    const text = `I just retraced "${storyTitle}" on @RetraceApp — ${score}% accuracy 🔥 ${appUrl.replace(/^https?:\/\//, "")}/story/${storyId}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleCopyLink() {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://retrace.app";
    try {
      await navigator.clipboard.writeText(`${appUrl}/story/${storyId}`);
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("[ShareCard] copy link failed", err);
    }
  }

  return (
    <div className="w-full max-w-lg bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/[0.15] transition-colors duration-300">
      <p className="text-[11px] uppercase tracking-[0.12em] text-brand-500 font-semibold mb-3">Share your result</p>

      <div className="relative mb-4 rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          role="img"
          aria-label={`Retrace result card for ${storyTitle}: ${score}% accuracy, ${lines} lines, ${wpm} WPM`}
          className="w-full h-auto block"
        />
        {!ready && (
          <div className="absolute inset-0 bg-ink-surface animate-pulse-soft" aria-hidden />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={handleDownload}
          disabled={!ready}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 text-ink font-semibold text-sm px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(14,207,183,0.2)] hover:bg-brand-300 hover:-translate-y-px transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <DownloadIcon />
          Download card
        </button>
        <button
          type="button"
          onClick={handleShareTwitter}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-white/15 text-cream/80 font-medium text-sm px-4 py-2.5 rounded-full hover:bg-white/5 hover:text-cream hover:border-white/30 transition-colors"
        >
          <ShareXIcon />
          Share to X
        </button>
        <button
          type="button"
          onClick={() => void handleCopyLink()}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-white/15 text-cream/80 font-medium text-sm px-4 py-2.5 rounded-full hover:bg-white/5 hover:text-cream hover:border-white/30 transition-colors"
        >
          {copied ? <CheckIcon /> : <LinkIcon />}
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
