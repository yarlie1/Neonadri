import { createClient } from "../lib/supabase/server";
import { getBlockedUserIdsForViewer } from "../lib/safety";
import { cookies } from "next/headers";
import { normalizeUserTimeZone, USER_TIME_ZONE_COOKIE } from "../lib/userTimeZone";
import HomeFeedClient from "./HomeFeedClient";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  created_at: string;
  latitude: number | null;
  longitude: number | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  gender: string | null;
  age_group: string | null;
};

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

type MatchSummaryRow = {
  post_id: number;
  is_matched: boolean;
  pending_request_count: number;
  total_request_count: number;
};

type MatchSummaryMap = Record<
  number,
  {
    isMatched: boolean;
    pendingRequestCount: number;
    totalRequestCount: number;
  }
>;

export default async function HomePage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const initialUserTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const blockedUserIds = await getBlockedUserIdsForViewer(supabase, user?.id);

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, latitude, longitude"
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-4 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[24px] border border-[#e7ddd2] bg-white p-5 shadow-sm">
          <div className="text-base font-semibold">Could not load home</div>
          <div className="mt-2 text-sm text-[#8b7f74]">
            {postsError.message}
          </div>
        </div>
      </main>
    );
  }

  const posts = ((postsData as PostRow[]) || [])
    .filter((post) => !blockedUserIds.has(post.user_id))
    .slice();
  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id))).filter(
    Boolean
  );
  const postIds = posts.map((post) => post.id);

  const hostProfileMap: HostProfileMap = {};
  const matchSummaryMap: MatchSummaryMap = {};
  let viewerPreference: { gender: string; ageGroup: string } | null = null;

  if (ownerIds.length > 0) {
    try {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name, gender, age_group")
        .in("id", ownerIds);

      ((profilesData as ProfileRow[]) || []).forEach((profile) => {
        hostProfileMap[profile.id] = {
          displayName: profile.display_name || "Unknown",
          gender: profile.gender || "",
          ageGroup: profile.age_group || "",
        };
      });
    } catch {}
  }

  if (user?.id) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("gender, age_group")
      .eq("id", user.id)
      .maybeSingle();

    if (viewerProfile) {
      viewerPreference = {
        gender: viewerProfile.gender || "",
        ageGroup: viewerProfile.age_group || "",
      };
    }
  }

  if (postIds.length > 0) {
    const { data: matchSummaries } = await supabase.rpc("get_post_match_summaries", {
      p_post_ids: postIds,
    });

    ((matchSummaries || []) as MatchSummaryRow[]).forEach((summary) => {
      matchSummaryMap[summary.post_id] = {
        isMatched: !!summary.is_matched,
        pendingRequestCount: Number(summary.pending_request_count || 0),
        totalRequestCount: Number(summary.total_request_count || 0),
      };
    });
  }

  return (
    <HomeFeedClient
      initialPosts={posts}
      hostProfileMap={hostProfileMap}
      matchSummaryMap={matchSummaryMap}
      viewerPreference={viewerPreference}
      initialUserTimeZone={initialUserTimeZone}
    />
  );
}

