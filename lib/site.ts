/**
 * Canonical public origin, used for metadataBase, robots and the sitemap.
 *
 * Falls back through NEXT_PUBLIC_APP_URL (set locally and in production) and Vercel's
 * own VERCEL_URL (available on preview deployments) before defaulting to localhost, so
 * OG images and canonical links resolve correctly in every environment rather than
 * silently pointing at localhost the way they did with metadataBase unset.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

/**
 * Public support address, shown on the contact page and in the legal pages. Kept here
 * rather than inlined so the three places that print it can never drift apart.
 */
export const SUPPORT_EMAIL = "louaibenaamira@gmail.com";
