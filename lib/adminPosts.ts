import { getMeetingStatus } from "./meetingTime";
import type { SupabaseClient } from "@supabase/supabase-js";

const ADMIN_TIME_ZONE = "America/Los_Angeles";
const ADMIN_POST_LIMIT = 500;

export type AdminPostVisibilityFilter = "all" | "visible" | "hidden";
export type AdminPostStatusFilter = "all" | "upcoming" | "expired" | "cancelled";

export type AdminPostFilters = {
  q?: string;
  visibility?: AdminPostVisibilityFilter;
  status?: AdminPostStatusFilter;
};

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  meeting_purpose: string | null;
  status: string | null;
  admin_hidden: boolean | null;
  admin_hidden_at: string | null;
  admin_hidden_reason: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

function getLifecycleStatus(post: Pick<PostRow, "status" | "meeting_time">) {
  if (String(post.status || "open").toLowerCase() === "cancelled") {
    return "Cancelled" as const;
  }

  return getMeetingStatus(post.meeting_time, ADMIN_TIME_ZONE);
}

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

function matchesSearch(post: PostRow, hostName: string, searchTerm: string) {
  if (!searchTerm) return true;

  const normalizedTerm = normalize(searchTerm);
  const searchable = [
    String(post.id),
    post.place_name,
    post.location,
    post.meeting_purpose,
    hostName,
    post.admin_hidden_reason,
  ]
    .map(normalize)
    .join(" ");

  return searchable.includes(normalizedTerm);
}

export async function getAdminPostsData(
  admin: SupabaseClient,
  filters: AdminPostFilters = {}
) {
  const visibility = filters.visibility || "all";
  const status = filters.status || "all";
  const q = String(filters.q || "").trim();

  let query = admin
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, meeting_purpose, status, admin_hidden, admin_hidden_at, admin_hidden_reason, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(ADMIN_POST_LIMIT);

  if (visibility === "visible") {
    query = query.eq("admin_hidden", false);
  } else if (visibility === "hidden") {
    query = query.eq("admin_hidden", true);
  }

  const numericId = Number(q);
  if (q && Number.isInteger(numericId) && numericId > 0) {
    query = query.eq("id", numericId);
  }

  const { data: postData, error: postsError } = await query;

  if (postsError) throw postsError;

  const posts = (postData || []) as PostRow[];
  const hostIds = Array.from(new Set(posts.map((post) => post.user_id)));

  const { data: profileData, error: profilesError } = hostIds.length
    ? await admin
        .from("profiles")
        .select("id, display_name")
        .in("id", hostIds)
    : { data: [], error: null };

  if (profilesError) throw profilesError;

  const profileMap = new Map(
    ((profileData || []) as ProfileRow[]).map((profile) => [
      profile.id,
      profile.display_name || "Unknown",
    ])
  );

  const items = posts
    .map((post) => {
      const hostDisplayName = profileMap.get(post.user_id) || "Unknown";
      const lifecycleStatus = getLifecycleStatus(post);

      return {
        id: post.id,
        hostDisplayName,
        placeName: post.place_name || post.location || "Selected place",
        meetingPurpose: post.meeting_purpose || "Meetup",
        meetingTime: post.meeting_time,
        createdAt: post.created_at,
        status: lifecycleStatus,
        rawStatus: post.status || "open",
        adminHidden: !!post.admin_hidden,
        adminHiddenAt: post.admin_hidden_at,
        adminHiddenReason: post.admin_hidden_reason,
      };
    })
    .filter((item) => {
      if (status !== "all" && item.status.toLowerCase() !== status) {
        return false;
      }

      if (!Number.isInteger(numericId)) {
        const original = posts.find((post) => post.id === item.id);
        return original ? matchesSearch(original, item.hostDisplayName, q) : true;
      }

      return true;
    });

  return {
    items,
    limit: ADMIN_POST_LIMIT,
    totalLoaded: posts.length,
    filters: { q, visibility, status },
  };
}
