import type { MetadataRoute } from "next";
import { createClient } from "../lib/supabase/server";
import { buildPostPath } from "../lib/postUrl";

const APP_URL = process.env.APP_BASE_URL?.trim() || "https://neonadri.net";
const SITE_URL = APP_URL.replace(/\/+$/, "");

type SitemapPost = {
  id: number;
  meeting_purpose: string | null;
  place_name: string | null;
  location: string | null;
  created_at: string | null;
  status: string | null;
  admin_hidden: boolean | null;
};

function absoluteUrl(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/privacy"), changeFrequency: "monthly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "monthly", priority: 0.2 },
  ];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select(
      "id, meeting_purpose, place_name, location, created_at, status, admin_hidden"
    )
    .eq("admin_hidden", false)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Sitemap posts lookup failed", error);
    return staticRoutes;
  }

  const postRoutes = ((data || []) as SitemapPost[])
    .filter((post) => !post.admin_hidden)
    .map((post) => ({
      url: absoluteUrl(
        buildPostPath(
          post.id,
          post.meeting_purpose,
          post.place_name || post.location
        )
      ),
      lastModified: post.created_at || undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...postRoutes];
}