import { createClient } from "../../../lib/supabase/server";
import {
  Star,
  MapPin,
  UserRound,
  Languages,
  MessageSquare,
} from "lucide-react";

type PageProps = {
  params: {
    id: string;
  };
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  about_me: string | null;
  gender: string | null;
  age_group: string | null;
  interests: string[] | null;
  languages: string[] | null;
  meeting_style: string | null;
  preferred_area: string | null;
  response_time_note: string | null;
};

type ReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
};

function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const iconClass =
    size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;

        return (
          <Star
            key={n}
            className={`${iconClass} ${
              filled
                ? "fill-[#a48f7a] text-[#a48f7a]"
                : "text-[#d8cec3]"
            }`}
          />
        );
      })}
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const userId = params.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, display_name, bio, about_me, gender, age_group, interests, languages, meeting_style, preferred_area, response_time_note"
    )
    .eq("id", userId)
    .maybeSingle();

  const { data: stats } = await supabase.rpc("get_profile_stats", {
    p_user_id: userId,
  });

  const { data: reviews } = await supabase
    .from("match_reviews")
    .select("id, rating, review_text, created_at")
    .eq("reviewee_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const typedProfile = profile as ProfileRow | null;
  const typedReviews = (reviews as ReviewRow[]) || [];

  if (!typedProfile) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          Profile not found.
        </div>
      </main>
    );
  }

  const averageRating = Number(stats?.average_rating ?? 0);
  const reviewCount = Number(stats?.review_count ?? 0);
  const completedMeetups = Number(stats?.completed_meetups ?? 0);
  const roundedAverage = Math.round(averageRating);

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold">
            {typedProfile.display_name || "Unknown"}
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#6f655c]">
            {typedProfile.about_me || typedProfile.bio || "No introduction yet."}
          </p>

          <div className="mt-4 space-y-2 text-sm text-[#6f655c]">
            {(typedProfile.gender || typedProfile.age_group) && (
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-[#8a7f74]" />
                <span>
                  {typedProfile.gender || "Unknown"}
                  {typedProfile.gender && typedProfile.age_group ? " / " : ""}
                  {typedProfile.age_group || ""}
                </span>
              </div>
            )}

            {typedProfile.preferred_area && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#8a7f74]" />
                <span>{typedProfile.preferred_area}</span>
              </div>
            )}

            {typedProfile.meeting_style && (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-[#8a7f74]" />
                <span>{typedProfile.meeting_style}</span>
              </div>
            )}

            {typedProfile.languages && typedProfile.languages.length > 0 && (
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4 text-[#8a7f74]" />
                <span>{typedProfile.languages.join(", ")}</span>
              </div>
            )}

            {typedProfile.response_time_note && (
              <div className="text-sm text-[#8b7f74]">
                {typedProfile.response_time_note}
              </div>
            )}
          </div>

          {typedProfile.interests && typedProfile.interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {typedProfile.interests.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#f4ece4] px-3 py-1 text-xs text-[#6b5f52]"
                >
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[22px] border border-[#e7ddd2] bg-white p-4 text-center shadow-sm">
            <div className="text-xs text-[#8b7f74]">Rating</div>
            <div className="mt-2 text-2xl font-bold">
              {averageRating.toFixed(1)}
            </div>
            <div className="mt-2 flex justify-center">
              <StarRating value={roundedAverage} size="sm" />
            </div>
          </div>

          <div className="rounded-[22px] border border-[#e7ddd2] bg-white p-4 text-center shadow-sm">
            <div className="text-xs text-[#8b7f74]">Reviews</div>
            <div className="mt-2 text-2xl font-bold">{reviewCount}</div>
          </div>

          <div className="rounded-[22px] border border-[#e7ddd2] bg-white p-4 text-center shadow-sm">
            <div className="text-xs text-[#8b7f74]">Meetups</div>
            <div className="mt-2 text-2xl font-bold">{completedMeetups}</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">Reviews</h2>
            {reviewCount > 0 && (
              <div className="text-sm text-[#8b7f74]">
                {averageRating.toFixed(1)} average
              </div>
            )}
          </div>

          <div className="mt-4 space-y-4">
            {typedReviews.length === 0 ? (
              <div className="rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-4 text-sm text-[#8b7f74]">
                No reviews yet.
              </div>
            ) : (
              typedReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <StarRating value={review.rating} size="md" />
                    <div className="text-xs text-[#9b8f84]">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-2 text-sm font-medium text-[#6b5f52]">
                    {review.rating}.0 / 5
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#5f5347]">
                    {review.review_text || "No comment."}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}