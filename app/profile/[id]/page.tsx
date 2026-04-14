import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  UserCircle2,
  UserRound,
  Languages,
  MessageSquareText,
  HeartHandshake,
  Clock3,
  Sparkles,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";

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
  preferred_area: string | null;
  languages: string[] | null;
  meeting_style: string | null;
  interests: string[] | null;
  response_time_note: string | null;
  is_public: boolean | null;
};

type ReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
};

type ProfileStats = {
  average_rating?: number | null;
  review_count?: number | null;
  completed_meetups?: number | null;
};

function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;

        return (
          <Star
            key={n}
            className={`${iconClass} ${
              filled ? "fill-[#a48f7a] text-[#a48f7a]" : "text-[#d8cec3]"
            }`}
          />
        );
      })}
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium leading-6 text-[#4f443b]">
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#eadfd3] bg-[#fffdfa] p-4 text-center shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
        {label}
      </div>
      <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
        {value}
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const userId = params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isMyProfile = user?.id === userId;

  const [profileRes, statsRes, reviewsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
          id,
          display_name,
          bio,
          about_me,
          gender,
          age_group,
          preferred_area,
          languages,
          meeting_style,
          interests,
          response_time_note,
          is_public
        `
      )
      .eq("id", userId)
      .maybeSingle(),

    supabase.rpc("get_profile_stats", {
      p_user_id: userId,
    }),

    supabase
      .from("match_reviews")
      .select("id, rating, review_text, created_at")
      .eq("reviewee_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (profileRes.error) {
    console.error("Profile fetch error:", profileRes.error);
    notFound();
  }

  const profile = profileRes.data as ProfileRow | null;
  const stats = (statsRes.data || {}) as ProfileStats;
  const reviews = (reviewsRes.data || []) as ReviewRow[];

  if (!profile) {
    notFound();
  }

  if (!isMyProfile && profile.is_public === false) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <div className="text-2xl font-bold">Private Profile</div>
          <p className="mt-2 text-sm text-[#6f655c]">
            This profile is currently private.
          </p>
        </div>
      </main>
    );
  }

  const averageRating = Number(stats.average_rating ?? 0);
  const reviewCount = Number(stats.review_count ?? 0);
  const completedMeetups = Number(stats.completed_meetups ?? 0);
  const roundedAverage = Math.round(averageRating);

  const hasAboutMe = !!profile.about_me?.trim();
  const hasLanguages = !!profile.languages && profile.languages.length > 0;
  const hasMeetingStyle = !!profile.meeting_style?.trim();
  const hasInterests = !!profile.interests && profile.interests.length > 0;
  const hasResponseNote = !!profile.response_time_note?.trim();
  const hasPreferredArea = !!profile.preferred_area?.trim();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-[34px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff8f1_0%,#f5dac8_36%,#e0ad95_100%)] p-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)] sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                <UserCircle2 className="h-3.5 w-3.5" />
                <span>{isMyProfile ? "My profile" : "Guest profile"}</span>
              </div>

              <div className="mt-5 min-w-0">
                <h1 className="truncate text-3xl font-black tracking-[-0.05em] text-[#2b1f1a] sm:text-[2.6rem]">
                  {profile.display_name || "Unknown"}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#6b5f52]">
                  <div className="flex items-center gap-2">
                    <StarRating value={roundedAverage} size="md" />
                    <span className="font-semibold text-[#4f4339]">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="rounded-full border border-white/60 bg-white/65 px-3 py-1 text-xs font-medium text-[#5f5347] shadow-sm">
                    {reviewCount} reviews
                  </span>
                </div>
              </div>

            {isMyProfile && (
              <div className="flex justify-start sm:justify-end">
                <Link
                  href={`/profile/${profile.id}/edit`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/60 bg-white/75 px-5 py-2.5 text-sm font-medium text-[#5a5149] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[1.7rem] font-black tracking-[-0.04em] text-[#2f2a26]">
                Profile
              </h2>
              <div className="rounded-full bg-[#f6eee6] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
                Details
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {(profile.gender || profile.age_group) && (
                <InfoItem
                  icon={<UserRound className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Identity"
                  value={[profile.gender, profile.age_group].filter(Boolean).join(" / ")}
                />
              )}

              {hasLanguages && (
                <InfoItem
                  icon={<Languages className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Languages"
                  value={profile.languages!.join(", ")}
                />
              )}

              {hasMeetingStyle && (
                <InfoItem
                  icon={<HeartHandshake className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Meeting Style"
                  value={profile.meeting_style!}
                />
              )}

              {hasResponseNote && (
                <InfoItem
                  icon={<Clock3 className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Response Note"
                  value={profile.response_time_note!}
                />
              )}

              {hasPreferredArea && (
                <InfoItem
                  icon={<Sparkles className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Preferred Area"
                  value={profile.preferred_area!}
                />
              )}

              <div className="rounded-[24px] border border-[#efe6db] bg-[#fcfaf7] p-5">
                <div className="flex items-start gap-3">
                  <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                      About me
                    </div>
                    <div className="mt-2 text-sm leading-7 text-[#5f5347]">
                      {hasAboutMe ? profile.about_me : "No introduction yet."}
                    </div>
                  </div>
                </div>
              </div>

              {hasInterests && (
                <div className="rounded-[24px] border border-[#efe6db] bg-[#fcfaf7] p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                    <Sparkles className="h-3.5 w-3.5 text-[#8a7f74]" />
                    Interests
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests!.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-[#f4ece4] px-3 py-1.5 text-xs font-medium text-[#6b5f52]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[1.7rem] font-black tracking-[-0.04em] text-[#2f2a26]">
                  Reviews
                </h2>
                <p className="mt-1 text-sm text-[#7a6b61]">
                  Signals people notice before they decide to meet.
                </p>
              </div>

              {isMyProfile && (
                <Link
                  href="/dashboard?tab=matches"
                  className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-4 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                >
                  Go to Matches
                </Link>
              )}
            </div>

            <div className="mt-5 rounded-[24px] border border-[#efe6db] bg-[#fcfaf7] p-5">
              <div className="flex items-center gap-3">
                <StarRating value={roundedAverage} size="md" />
                <div className="text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  {averageRating.toFixed(1)}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm text-[#6b5f52]">
                <div>{reviewCount} reviews received</div>
                <div>{completedMeetups} meetups completed</div>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-4 text-sm text-[#8b7f74]">
                  No reviews yet.
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[24px] border border-[#e7ddd2] bg-[#fcfaf7] p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StarRating value={review.rating} size="md" />
                        <div className="text-sm font-semibold text-[#6b5f52]">
                          {review.rating}.0 / 5
                        </div>
                      </div>
                      <div className="text-xs text-[#9b8f84]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#5f5347]">
                      {review.review_text || "No comment."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

