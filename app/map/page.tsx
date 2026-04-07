import { createClient } from "../../lib/supabase/server";
import HomePostsMap from "../components/HomePostsMap";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number | null;
  longitude: number | null;
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
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number;
  longitude: number;
  host_name: string;
  my_match_status: string | null;
  is_my_post: boolean;
};

export default async function MapPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("created_at", { ascending: false });

  const posts = ((postsData as PostRow[]) || []).filter(
    (post) => post.latitude !== null && post.longitude !== null
  );

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id)));

  let profileMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap.set(profile.id, profile.display_name || "Unknown user");
    });
  }

  let requestStatusMap = new Map<number, string>();

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
    meeting_purpose: post.meeting_purpose,
    benefit_amount: post.benefit_amount,
    latitude: post.latitude as number,
    longitude: post.longitude as number,
    host_name: profileMap.get(post.user_id) || "Unknown user",
    my_match_status:
      user && user.id !== post.user_id
        ? requestStatusMap.get(post.id) || "No request yet"
        : null,
    is_my_post: !!user && user.id === post.user_id,
  }));

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Map View</h1>
          <p className="mt-1 text-sm text-[#6f655c]">
            Tap a marker to see meetup details.
          </p>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-3 shadow-sm">
          <HomePostsMap posts={mapPosts} />
        </div>
      </div>
    </main>
  );
}