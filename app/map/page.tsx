import { createClient } from "../../lib/supabase/server";
import { getBlockedUserIdsForViewer } from "../../lib/safety";
import HomePostsMap from "../components/HomePostsMap";
import {
  APP_BODY_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number | null;
  longitude: number | null;
  target_gender: string | null;
  target_age_group: string | null;
  status: string | null;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MatchRequestRow = {
  post_id: number;
  status: string;
};

type MatchRow = {
  post_id: number;
  status: string;
};

export type MapPost = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number;
  longitude: number;
  target_gender: string | null;
  target_age_group: string | null;
  host_name: string;
  my_match_status: string | null;
  is_my_post: boolean;
};

export default async function MapPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const blockedUserIds = await getBlockedUserIdsForViewer(supabase, user?.id);

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, latitude, longitude, target_gender, target_age_group, status"
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false });

  const posts = ((postsData as PostRow[]) || []).filter(
    (post) =>
      post.latitude !== null &&
      post.longitude !== null &&
      !blockedUserIds.has(post.user_id) &&
      String(post.status || "open").toLowerCase() !== "cancelled"
  );

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id)));

  const profileMap = new Map<string, string>();

  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap.set(profile.id, profile.display_name || "Unknown");
    });
  }

  const requestStatusMap = new Map<number, string>();

  if (user) {
    const [requestsRes, matchesRes] = await Promise.all([
      supabase
        .from("match_requests")
        .select("post_id, status")
        .eq("requester_user_id", user.id),

      supabase
        .from("matches")
        .select("post_id, status")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    ]);

    ((requestsRes.data as MatchRequestRow[]) || []).forEach((item) => {
      requestStatusMap.set(item.post_id, item.status);
    });

    ((matchesRes.data as MatchRow[]) || []).forEach((item) => {
      requestStatusMap.set(item.post_id, "matched");
    });
  }

  const mapPosts: MapPost[] = posts.map((post) => ({
    id: post.id,
    user_id: post.user_id,
    place_name: post.place_name,
    location: post.location,
    meeting_time: post.meeting_time,
    duration_minutes: post.duration_minutes,
    meeting_purpose: post.meeting_purpose,
    benefit_amount: post.benefit_amount,
    latitude: post.latitude as number,
    longitude: post.longitude as number,
    target_gender: post.target_gender,
    target_age_group: post.target_age_group,
    host_name: profileMap.get(post.user_id) || "Unknown",
    my_match_status:
      user && user.id !== post.user_id
        ? requestStatusMap.get(post.id) || "No request yet"
        : null,
    is_my_post: !!user && user.id === post.user_id,
  }));

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-6 py-6`}>
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#24323c]">Map View</h1>
          <p className={`mt-1 text-sm ${APP_BODY_TEXT_CLASS}`}>
            Tap a marker to see meetup details.
          </p>
        </div>

        <div className={`overflow-hidden rounded-[2rem] p-3 ${APP_SURFACE_CARD_CLASS}`}>
          <HomePostsMap posts={mapPosts} />
        </div>
      </div>
    </main>
  );
}
