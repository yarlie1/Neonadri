import { cookies } from "next/headers";
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
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import {
  FALLBACK_TIME_ZONE,
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../lib/userTimeZone";
import { computeReviewTrustMetrics, type ReviewTrustRow } from "../../../lib/reviewTrust";

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
  showed_up: boolean | null;
  host_paid_benefit: boolean | null;
  reviewee_is_host: boolean | null;
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
    <div className="rounded-[22px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-2 text-sm leading-7 text-[#5f5347]">
        {value}
      </div>
    </div>
  );
}

export default async function ProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const userId = params.id;
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value || FALLBACK_TIME_ZONE
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isMyProfile = user?.id === userId;

  const [profileRes, statsRes, reviewsRes, trustRes] = await Promise.all([
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
      .select("id, rating, review_text, created_at, showed_up, host_paid_benefit, reviewee_is_host")
      .eq("reviewee_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("match_reviews")
      .select("showed_up, host_paid_benefit, reviewee_is_host")
      .eq("reviewee_user_id", userId),
  ]);

  if (profileRes.error) {
    console.error("Profile fetch error:", profileRes.error);
    notFound();
  }

  const profile = profileRes.data as ProfileRow | null;
  const stats = (statsRes.data || {}) as ProfileStats;
  const reviews = (reviewsRes.data || []) as ReviewRow[];
  const trustMetrics = computeReviewTrustMetrics(
    (trustRes.data || []) as ReviewTrustRow[]
  );

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

  return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-5">
        <section className="rounded-[34px] border border-[#ece0d4] bg-[radial-gradient(circle_at_top_left,#fffbf7_0%,#f6e8dd_44%,#edd8ca_100%)] p-5 shadow-[0_16px_36px_rgba(92,69,52,0.07)] sm:p-5">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.28rem] text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-[#74675d]">
                <UserCircle2 className="h-3.5 w-3.5" />
                <span>{isMyProfile ? "My profile" : "Guest profile"}</span>
              </div>
              {isMyProfile && (
                <Link
                  href={`/profile/${profile.id}/edit`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3.5 py-[0.42rem] text-[11px] font-medium leading-none text-[#5f5347] transition hover:bg-[#f7eee6]"
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <div className="min-w-0">
              <div className="rounded-[20px] border border-[#eadfd3] bg-[linear-gradient(180deg,rgba(255,253,250,0.78)_0%,rgba(247,239,231,0.72)_100%)] px-3.5 py-1 text-sm text-[#5f5347]">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2">
                  <h1 className="min-w-0 truncate text-3xl font-black tracking-[-0.05em] text-[#2b1f1a] sm:text-[2.6rem]">
                    {profile.display_name || "Unknown"}
                  </h1>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.3125rem] text-sm font-medium leading-none text-[#5f5347] shadow-[0_6px_14px_rgba(92,69,52,0.04)]">
                    <StarRating value={roundedAverage} size="sm" />
                    <span className="font-semibold text-[#4f4339]">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-[#eadfd3]/70" />

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 py-2 text-[#6a5e53]">
                  <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-[#8a7f74]" />
                  <span>{hasMeetingStyle ? profile.meeting_style : "No meetup style yet"}</span>
                  <span />
                </div>

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#eadfd3]/70 py-2 text-[#6a5e53]">
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#8a7f74]" />
                  <span>{hasResponseNote ? profile.response_time_note : "No response note yet"}</span>
                  <span />
                </div>

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#eadfd3]/70 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#8a7f74]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Attendance
                  </span>
                  <span className="justify-self-end font-semibold text-[#2f2a26]">
                    {trustMetrics.attendanceRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.attendanceRate * 100)}%`}
                  </span>
                </div>

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#eadfd3]/70 py-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 text-[#8a7f74]" />
                  <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Payout reliability
                  </span>
                  <span className="justify-self-end font-semibold text-[#2f2a26]">
                    {trustMetrics.hostReliabilityRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.hostReliabilityRate * 100)}%`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-[30px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] p-5 shadow-[0_14px_32px_rgba(92,69,52,0.07)] backdrop-blur">
            <div className="grid gap-3">
              {(profile.gender || profile.age_group) && (
                <InfoItem
                  icon={<UserRound className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Identity"
                  value={[profile.gender, profile.age_group].filter(Boolean).join(" / ")}
                />
              )}

              {hasInterests && (
                <div className="rounded-[22px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-4">
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

              <div className="rounded-[22px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                  <MessageSquareText className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                  <span>About me</span>
                </div>
                <div className="mt-2 text-sm leading-7 text-[#5f5347]">
                  {hasAboutMe ? profile.about_me : "No introduction yet."}
                </div>
              </div>

              {hasLanguages && (
                <InfoItem
                  icon={<Languages className="h-3.5 w-3.5 text-[#8a7f74]" />}
                  label="Languages"
                  value={profile.languages!.join(", ")}
                />
              )}

            </div>
          </section>

          <section className="rounded-[30px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] p-5 shadow-[0_14px_32px_rgba(92,69,52,0.07)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[1.7rem] font-black tracking-[-0.04em] text-[#2f2a26]">
                  Reviews
                </h2>
                <p className="mt-1 text-sm text-[#7a6d61]">
                  Signals from past meetups and how people felt afterward.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[24px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <StarRating value={roundedAverage} size="md" />
                  <div className="text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                    {averageRating.toFixed(1)}
                  </div>
                </div>
                <div className="rounded-full border border-[#ece0d4] bg-[#fbf5ee] px-3 py-1 text-xs font-medium text-[#6b5f52]">
                  {reviewCount > 0 ? "Reviewed by meetup partners" : "No written reviews yet"}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[18px] border border-[#ede2d7] bg-[#fcf8f3] px-3.5 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Reviews received
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#5f5347]">
                    {reviewCount} total
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#ede2d7] bg-[#fcf8f3] px-3.5 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Completed meetups
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#5f5347]">
                    {completedMeetups} meetups
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#ede2d7] bg-[#fcf8f3] px-3.5 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Attendance
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#5f5347]">
                    {trustMetrics.attendanceRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.attendanceRate * 100)}%`}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#8b7f74]">
                    {trustMetrics.attendanceCount > 0
                      ? `Based on ${trustMetrics.attendanceCount} meetup reviews`
                      : "Not enough meetup reviews yet"}
                  </div>
                </div>
                <div className="rounded-[18px] border border-[#ede2d7] bg-[#fcf8f3] px-3.5 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    Payout reliability
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#5f5347]">
                    {trustMetrics.hostReliabilityRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.hostReliabilityRate * 100)}%`}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#8b7f74]">
                    {trustMetrics.hostReliabilityCount > 0
                      ? `Based on ${trustMetrics.hostReliabilityCount} host payout reviews`
                      : "No host payout reviews yet"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {reviews.length === 0 ? (
                <div className="rounded-[20px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-3 text-sm text-[#8b7f74]">
                  No reviews yet.
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[22px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-3.5 py-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StarRating value={review.rating} size="md" />
                        <div className="text-sm font-semibold text-[#6b5f52]">
                          {review.rating}.0 / 5
                        </div>
                      </div>
                      <div className="text-xs text-[#9b8f84]">
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          timeZone: userTimeZone,
                        })}
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





