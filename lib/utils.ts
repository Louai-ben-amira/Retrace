import type { VocabTag } from "@/types";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length).trimEnd() + "…";
}

export function difficultyLabel(d: string, labels?: { BEGINNER: string; INTERMEDIATE: string; ADVANCED: string }): string {
  return (labels ?? { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" })[d as "BEGINNER" | "INTERMEDIATE" | "ADVANCED"] ?? d;
}

export function difficultyColor(d: string): string {
  return {
    BEGINNER: "bg-brand-100 text-brand-800",
    INTERMEDIATE: "bg-amber-100 text-amber-800",
    ADVANCED: "bg-rose-100 text-rose-800",
  }[d] ?? "bg-gray-100 text-gray-800";
}

/**
 * Whether an email address is listed in ADMIN_EMAILS.
 *
 * Called from both provisioning paths (the Clerk webhook and lib/auth.ts's self-healing
 * `provisionUser`) so the ADMIN role can be granted by configuration. Before that wiring
 * existed, nothing in the codebase ever wrote `role: "ADMIN"` and the admin panel was
 * unreachable on a fresh deploy without direct database access.
 *
 * Tolerant of the shapes a comma-separated env var actually arrives in: surrounding
 * spaces, mixed case, and trailing/empty entries.
 */
export function isAdmin(email: string): boolean {
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export function parseVocabTags(json: unknown): VocabTag[] {
  return Array.isArray(json) ? (json as VocabTag[]) : [];
}

export function frequencyLabel(band: string): string {
  return {
    TOP_500: "Top 500",
    TOP_1000: "Top 1,000",
    TOP_2000: "Top 2,000",
    TOP_5000: "Top 5,000",
    BEYOND_5000: "Less common",
  }[band] ?? band;
}
