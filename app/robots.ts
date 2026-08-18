import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything below is either private to a signed-in user, admin-only, or an API
      // surface — none of it belongs in a search index.
      disallow: [
        "/api/",
        "/admin/",
        "/library",
        "/progress",
        "/settings",
        "/story/",
        "/wordbank",
        "/vocabulary",
        "/onboarding",
        "/offline",
      ],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
