import type { MetadataRoute } from "next";

const APP_URL = process.env.APP_BASE_URL?.trim() || "https://neonadri.net";
const SITE_URL = APP_URL.replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/posts/", "/privacy", "/terms"],
      disallow: [
        "/admin/",
        "/api/",
        "/dashboard/",
        "/login",
        "/profile/complete",
        "/signup",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}