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
import { getBlockedUserIdsForViewer } from "../../../lib/safety";
import {
  FALLBACK_TIME_ZONE,
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../lib/userTimeZone";
import { computeReviewTrustMetrics, type ReviewTrustRow } from "../../../lib/reviewTrust";
import {
  APP_EYEBROW_CLASS,
  APP_MUTED_TEXT_CLASS,
  APP_PAGE_BG_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
import SafetyActions from "../../components/SafetyActions";

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
              filled ? "fill-[#71828c] text-[#71828c]" : "text-[#d3dce2]"
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
    <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-4`}>
      <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
        {icon}
        <span>{label}</span>
      </div>
      <div className={`mt-2 text-sm leading-7 ${APP_MUTED_TEXT_CLASS}`}>
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
  const blockedUserIds = await getBlockedUserIdsForViewer(supabase, user?.id);

  const isMyProfile = user?.id === userId;

  if (!isMyProfile && blockedUserIds.has(userId)) {
    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
        <div className={`mx-auto max-w-2xl ${APP_SURFACE_CARD_CLASS} p-6`}>
          <div className="text-2xl font-bold">Profile unavailable</div>
          <p className={`mt-2 text-sm ${APP_MUTED_TEXT_CLASS}`}>
            You cannot view this profile because one participant has blocked the other.
          </p>
        </div>
      </main>
    );
  }

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
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
        <div className={`mx-auto max-w-2xl ${APP_SURFACE_CARD_CLASS} p-6`}>
          <div className="text-2xl font-bold">Private Profile</div>
          <p className={`mt-2 text-sm ${APP_MUTED_TEXT_CLASS}`}>
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
  const hasRating = reviewCount > 0;
  const hasAboutMe = !!profile.about_me?.trim();
  const hasLanguages = !!profile.languages && profile.languages.length > 0;
  const hasMeetingStyle = !!profile.meeting_style?.trim();
  const hasInterests = !!profile.interests && profile.interests.length > 0;
  const hasResponseNote = !!profile.response_time_note?.trim();

  return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
      <div className="mx-auto max-w-4xl space-y-5">
        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-5`}>
          <div className="flex flex-col gap-3.5">
              <div className="flex items-center justify-between gap-3">
              <div className={`inline-flex items-center gap-2 rounded-full ${APP_ROW_SURFACE_CLASS} px-3 py-[0.28rem] text-[10px] font-medium uppercase leading-none tracking-[0.18em] text-[#6b7b84]`}>
                <UserCircle2 className="h-3.5 w-3.5" />
                <span>Profile</span>
              </div>
              {isMyProfile && (
                <Link
                  href={`/profile/${profile.id}/edit`}
                  className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full ${APP_ROW_SURFACE_CLASS} px-3.5 py-[0.42rem] text-[11px] font-medium leading-none text-[#52616a] transition`}
                >
                  Edit Profile
                </Link>
              )}
            </div>

            <div className="min-w-0">
              <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-1 text-sm ${APP_MUTED_TEXT_CLASS}`}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 py-2">
                  <h1 className="min-w-0 truncate text-3xl font-black tracking-[-0.05em] text-[#24323f] sm:text-[2.6rem]">
                    {profile.display_name || "Unknown"}
                  </h1>
                  {hasRating ? (
                    <div className={`inline-flex items-center gap-2 rounded-full ${APP_ROW_SURFACE_CLASS} px-3 py-[0.3125rem] text-sm font-medium leading-none text-[#52616a] shadow-[0_6px_14px_rgba(118,126,133,0.08)]`}>
                      <StarRating value={roundedAverage} size="sm" />
                      <span className="font-semibold text-[#3c4850]">
                        {averageRating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <div className={`inline-flex items-center rounded-full ${APP_ROW_SURFACE_CLASS} px-3 py-[0.3125rem] text-sm font-medium leading-none text-[#52616a] shadow-[0_6px_14px_rgba(118,126,133,0.08)]`}>
                      No reviews yet
                    </div>
                  )}
                </div>

                <div className="border-t border-[#dbe3e8]/80" />

                <div className={`grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 py-2 ${APP_MUTED_TEXT_CLASS}`}>
                  <HeartHandshake className="h-3.5 w-3.5 shrink-0 text-[#71828c]" />
                  <span>{hasMeetingStyle ? profile.meeting_style : "No meetup style yet"}</span>
                  <span />
                </div>

                <div className={`grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#dbe3e8]/80 py-2 ${APP_MUTED_TEXT_CLASS}`}>
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-[#71828c]" />
                  <span>{hasResponseNote ? profile.response_time_note : "No response note yet"}</span>
                  <span />
                </div>

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#dbe3e8]/80 py-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#71828c]" />
                  <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Attendance
                  </span>
                  <span className="justify-self-end font-semibold text-[#24323f]">
                    {trustMetrics.attendanceRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.attendanceRate * 100)}%`}
                  </span>
                </div>

                <div className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 border-t border-[#dbe3e8]/80 py-2">
                  <DollarSign className="h-3.5 w-3.5 shrink-0 text-[#71828c]" />
                  <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Payout reliability
                  </span>
                  <span className="justify-self-end font-semibold text-[#24323f]">
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
          <section className={`${APP_SURFACE_CARD_CLASS} p-5`}>
            <div className="grid gap-3">
              {(profile.gender || profile.age_group) && (
                <InfoItem
                  icon={<UserRound className="h-3.5 w-3.5 text-[#71828c]" />}
                  label="Identity"
                  value={[profile.gender, profile.age_group].filter(Boolean).join(" / ")}
                />
              )}

              {hasInterests && (
                <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-4`}>
                  <div className={`mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    <Sparkles className="h-3.5 w-3.5 text-[#71828c]" />
                    Interests
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests!.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-3 py-1.5 text-xs font-medium text-[#52616a]"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-4`}>
                <div className={`flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                  <MessageSquareText className="h-4 w-4 shrink-0 text-[#71828c]" />
                  <span>About me</span>
                </div>
                <div className={`mt-2 text-sm leading-7 ${APP_MUTED_TEXT_CLASS}`}>
                  {hasAboutMe ? profile.about_me : "No introduction yet."}
                </div>
              </div>

              {hasLanguages && (
                <InfoItem
                  icon={<Languages className="h-3.5 w-3.5 text-[#71828c]" />}
                  label="Languages"
                  value={profile.languages!.join(", ")}
                />
              )}

            </div>
          </section>

          <section className={`${APP_SURFACE_CARD_CLASS} p-5`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-[1.7rem] font-black tracking-[-0.04em] text-[#24323f]">
                  Reviews
                </h2>
                <p className={`mt-1 text-sm ${APP_MUTED_TEXT_CLASS}`}>
                  Signals from past meetups and how people felt afterward.
                </p>
              </div>
            </div>

            <div className={`mt-4 ${APP_SOFT_CARD_CLASS} px-3.5 py-4`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                {hasRating ? (
                  <div className="flex items-center gap-3">
                    <StarRating value={roundedAverage} size="md" />
                    <div className="text-2xl font-black tracking-[-0.04em] text-[#24323f]">
                      {averageRating.toFixed(1)}
                    </div>
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-[#52616a]">
                    No reviews yet
                  </div>
                )}
                <div className={`rounded-full ${APP_ROW_SURFACE_CLASS} px-3 py-1 text-xs font-medium text-[#52616a]`}>
                  {reviewCount > 0 ? "Reviewed by meetup partners" : "No written reviews yet"}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-2.5`}>
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Attendance
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#52616a]">
                    {trustMetrics.attendanceRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.attendanceRate * 100)}%`}
                  </div>
                  <div className={`mt-0.5 text-[11px] ${APP_SUBTLE_TEXT_CLASS}`}>
                    {trustMetrics.attendanceCount > 0
                      ? `Based on ${trustMetrics.attendanceCount} meetup reviews`
                      : "Not enough meetup reviews yet"}
                  </div>
                </div>
                <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-2.5`}>
                  <div className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Payout reliability
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#52616a]">
                    {trustMetrics.hostReliabilityRate === null
                      ? "No data yet"
                      : `${Math.round(trustMetrics.hostReliabilityRate * 100)}%`}
                  </div>
                  <div className={`mt-0.5 text-[11px] ${APP_SUBTLE_TEXT_CLASS}`}>
                    {trustMetrics.hostReliabilityCount > 0
                      ? `Based on ${trustMetrics.hostReliabilityCount} host payout reviews`
                      : "No host payout reviews yet"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {reviews.length === 0 ? (
                <div className={`${APP_SOFT_CARD_CLASS} px-3.5 py-3 text-sm ${APP_SUBTLE_TEXT_CLASS}`}>
                  No reviews yet.
                </div>
              ) : (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className={`${APP_SOFT_CARD_CLASS} px-3.5 py-4`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <StarRating value={review.rating} size="md" />
                        <div className="text-sm font-semibold text-[#52616a]">
                          {review.rating}.0 / 5
                        </div>
                      </div>
                      <div className={`text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                        {new Date(review.created_at).toLocaleDateString(undefined, {
                          timeZone: userTimeZone,
                        })}
                      </div>
                    </div>

                    <p className={`mt-3 text-sm leading-6 ${APP_MUTED_TEXT_CLASS}`}>
                      {review.review_text || "No comment."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {!isMyProfile && user ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5`}>
            <div className={APP_EYEBROW_CLASS}>Safety</div>
            <div className="mt-2 text-sm text-[#6c7880]">
              Block this user if you no longer want to see or interact with this profile.
            </div>
            <div className="mt-4">
              <SafetyActions
                currentUserId={user.id}
                targetUserId={profile.id}
                reportTargetType="user"
                reportTargetId={profile.id}
              />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}





