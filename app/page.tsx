import { createClient } from "../lib/supabase/server";
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

type ProfileStatsRow = {
  average_rating?: number | null;
  review_count?: number | null;
};

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

type HostStatMap = Record<
  string,
  {
    averageRating: number;
    reviewCount: number;
  }
>;

export default async function HomePage() {
  const supabase = await createClient();

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

  const posts = ((postsData as PostRow[]) || []).slice();
  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id))).filter(
    Boolean
  );

  const hostProfileMap: HostProfileMap = {};
  const hostStatsMap: HostStatMap = {};

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

    try {
      const statsResults = await Promise.all(
        ownerIds.map(async (ownerId) => {
          const { data, error } = await supabase.rpc("get_profile_stats", {
            p_user_id: ownerId,
          });

          if (error) {
            return {
              ownerId,
              stats: {
                averageRating: 0,
                reviewCount: 0,
              },
            };
          }

          const stats = (data || {}) as ProfileStatsRow;

          return {
            ownerId,
            stats: {
              averageRating: Number(stats.average_rating ?? 0),
              reviewCount: Number(stats.review_count ?? 0),
            },
          };
        })
      );

      statsResults.forEach(({ ownerId, stats }) => {
        hostStatsMap[ownerId] = stats;
      });
    } catch {}
  }

  return (
    <HomeFeedClient
      initialPosts={posts}
      hostProfileMap={hostProfileMap}
      hostStatsMap={hostStatsMap}
    />
  );
}

