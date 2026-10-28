import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { buildPostPath } from "./postUrl";
import { buildProfilePath } from "./profileUrl";

export type ActivityItem = {
  id: string;
  kind: "Signup" | "Post" | "Request" | "Accepted";
  createdAt: string;
  actor: { name: string; href: string | null };
  other?: { name: string; href: string | null };
  post?: { name: string; href: string };
};

// Call only after the server has verified the current user's is_admin flag.
export async function getAdminActivity(admin: SupabaseClient): Promise<ActivityItem[]> {
  const limit = 50;
  const results = await Promise.all([
    admin.from("profiles").select("id, display_name, username, created_at").order("created_at", { ascending: false }).limit(limit),
    admin.from("posts").select("id, user_id, meeting_purpose, place_name, created_at").order("created_at", { ascending: false }).limit(limit),
    admin.from("match_requests").select("id, post_id, requester_user_id, post_owner_user_id, created_at").order("created_at", { ascending: false }).limit(limit),
    admin.from("matches").select("id, post_id, user_a, user_b, created_at").order("created_at", { ascending: false }).limit(limit),
  ]);
  for (const result of results) if (result.error) throw result.error;
  const signups = results[0].data || [];
  const posts = results[1].data || [];
  const requests = results[2].data || [];
  const matches = results[3].data || [];
  const postIds = Array.from(new Set([...requests, ...matches].map((row) => row.post_id)));
  const relatedPosts = postIds.length
    ? await admin.from("posts").select("id, user_id, meeting_purpose, place_name").in("id", postIds)
    : { data: [], error: null };
  if (relatedPosts.error) throw relatedPosts.error;
  const postMap = new Map([...posts, ...(relatedPosts.data || [])].map((row) => [row.id, row]));
  const userIds = Array.from(new Set([
    ...signups.map((row) => row.id),
    ...Array.from(postMap.values()).map((row) => row.user_id),
    ...requests.flatMap((row) => [row.requester_user_id, row.post_owner_user_id]),
    ...matches.flatMap((row) => [row.user_a, row.user_b]),
  ].filter(Boolean)));
  const profiles = userIds.length
    ? await admin.from("profiles").select("id, display_name, username").in("id", userIds)
    : { data: [], error: null };
  if (profiles.error) throw profiles.error;
  const people = new Map((profiles.data || []).map((row) => [row.id, row]));
  const person = (id: string | undefined) => {
    const row = id ? people.get(id) : null;
    return row ? { name: row.display_name || row.username || "Unnamed user", href: buildProfilePath(row) }
      : { name: "Unavailable user", href: null };
  };
  const post = (id: number) => {
    const row = postMap.get(id);
    return row ? {
      name: [row.meeting_purpose || "Meetup", row.place_name].filter(Boolean).join(" · "),
      href: buildPostPath(id, row.meeting_purpose, row.place_name),
    } : undefined;
  };
  const items: ActivityItem[] = [
    ...signups.map((row): ActivityItem => ({ id: "signup-" + row.id, kind: "Signup", createdAt: row.created_at, actor: person(row.id) })),
    ...posts.map((row): ActivityItem => ({ id: "post-" + row.id, kind: "Post", createdAt: row.created_at, actor: person(row.user_id), post: post(row.id) })),
    ...requests.map((row): ActivityItem => ({ id: "request-" + row.id, kind: "Request", createdAt: row.created_at, actor: person(row.requester_user_id), other: person(row.post_owner_user_id), post: post(row.post_id) })),
    ...matches.map((row): ActivityItem => {
      // Participants are UUID-sorted, not host-first. Resolve the host from the post.
      const hostId = postMap.get(row.post_id)?.user_id;
      const guestId = hostId === row.user_a ? row.user_b : hostId === row.user_b ? row.user_a : undefined;
      return { id: "accepted-" + row.id, kind: "Accepted", createdAt: row.created_at, actor: person(hostId), other: person(guestId), post: post(row.post_id) };
    }),
  ];
  return items.filter((item) => item.createdAt && Number.isFinite(Date.parse(item.createdAt)))
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt) || a.id.localeCompare(b.id)).slice(0, limit);
}
