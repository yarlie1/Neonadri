import { cookies } from "next/headers";
import { createClient } from "../../lib/supabase/server";
import { getBlockedUserIdsForViewer } from "../../lib/safety";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../lib/userTimeZone";
import HomeTestClient from "./HomeTestClient";

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
  status: string | null;
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

export default async function HomeTestPage() {
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
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, latitude, longitude, status"
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#eceff1] px-4 py-5 text-[#2f3a42]">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#fbfcfd_20%,#edf1f4_56%,#dde4ea_100%)]" />
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.84),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_60%_100%,rgba(223,229,235,0.3),transparent_34%)]" />

        <div className="relative mx-auto max-w-2xl">
          <div className="rounded-[28px] border border-[#e3e8ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.997)_0%,rgba(247,249,250,0.988)_32%,rgba(233,237,240,0.988)_100%)] p-5 shadow-[0_18px_38px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1),inset_0_-1px_0_rgba(203,209,214,0.38)]">
            <div className="text-base font-semibold">Could not load home test</div>
            <div className="mt-2 text-sm text-[#6f7a81]">{postsError.message}</div>
          </div>
        </div>
      </main>
    );
  }

  const posts = ((postsData as PostRow[]) || [])
    .filter(
      (post) =>
        !blockedUserIds.has(post.user_id) &&
        String(post.status || "open").toLowerCase() !== "cancelled"
    )
    .slice();
  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id))).filter(Boolean);
  const postIds = posts.map((post) => post.id);

  const hostProfileMap: HostProfileMap = {};
  const matchSummaryMap: MatchSummaryMap = {};

  if (ownerIds.length > 0) {
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
    <main className="relative min-h-screen overflow-hidden bg-[#eceff1]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,#ffffff_0%,#fbfcfd_20%,#edf1f4_56%,#dde4ea_100%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.84),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(255,255,255,0.48),transparent_22%),radial-gradient(circle_at_60%_100%,rgba(223,229,235,0.3),transparent_34%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.18)_1px,transparent_1px)] bg-[size:22px_22px] opacity-26" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_44%,rgba(255,255,255,0.28)_49%,transparent_54%,transparent_100%)] opacity-85" />

      <div className="relative z-10">
        <HomeTestClient
          posts={posts}
          hostProfileMap={hostProfileMap}
          matchSummaryMap={matchSummaryMap}
          initialUserTimeZone={initialUserTimeZone}
        />
      </div>
    </main>
  );
}
