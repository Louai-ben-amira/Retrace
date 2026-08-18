import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Only the publicly reachable marketing/auth surface. Story pages are behind auth and
// most are Pro-gated, so they are deliberately excluded rather than advertised to
// crawlers that can never fetch them.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/register`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.5 },
  ];
}
