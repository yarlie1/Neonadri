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
  const profileSummary = hasAboutMe
    ? profile.about_me!.replace(/\s+/g, " ").trim().length <= 140
      ? profile.about_me!.replace(/\s+/g, " ").trim()
      : `${profile.about_me!.replace(/\s+/g, " ").trim().slice(0, 137).trimEnd()}...`
    : "A profile that gives people enough context to understand the vibe before the first message.";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e4b49d_100%)] p-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  <span>{isMyProfile ? "My profile" : "Guest profile"}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <UserCircle2 className="h-8 w-8 shrink-0 text-[#8a7f74]" />
                  <h1 className="truncate text-3xl font-black tracking-[-0.04em] text-[#2b1f1a] sm:text-[2.2rem]">
                    {profile.display_name || "Unknown"}
                  </h1>
                </div>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                  {profileSummary}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {isMyProfile && (
                  <Link
                    href={`/profile/${profile.id}/edit`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-4 py-2 text-sm font-medium text-[#5a5149] shadow-sm backdrop-blur transition hover:bg-white"
                  >
                    Edit Profile
                  </Link>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <StatCard label="Rating" value={averageRating.toFixed(1)} />
              <StatCard label="Reviews" value={String(reviewCount)} />
              <StatCard label="Meetups" value={String(completedMeetups)} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Profile snapshot
                </div>
                <div className="mt-3 space-y-2 text-sm text-[#5f5347]">
                  {(profile.gender || profile.age_group) && (
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>
                        {profile.gender || "Unknown"}
                        {profile.gender && profile.age_group ? " / " : ""}
                        {profile.age_group || ""}
                      </span>
                    </div>
                  )}

                  {hasLanguages && (
                    <div className="flex items-center gap-2">
                      <Languages className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>{profile.languages!.join(", ")}</span>
                    </div>
                  )}

                  {hasMeetingStyle && (
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>{profile.meeting_style}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Reputation
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="flex items-center gap-2">
                    <StarRating value={roundedAverage} size="md" />
                    <span className="text-base font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-[#8b7f74]">
                    {reviewCount} reviews
                  </span>
                  <span className="text-sm text-[#8b7f74]">
                    {completedMeetups} meetups completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.75rem] font-black tracking-[-0.04em] text-[#2f2a26]">
              About
            </h2>
            <div className="rounded-full bg-[#f6eee6] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
              Personal context
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[22px] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                    About me
                  </div>
                  <div className="mt-1 leading-7 text-[#5f5347]">
                    {hasAboutMe ? profile.about_me : "No introduction yet."}
                  </div>
                </div>
              </div>
            </div>

            {(hasLanguages || hasMeetingStyle || hasResponseNote) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              </div>
            )}

            {hasInterests && (
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
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
        </div>

        <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.75rem] font-black tracking-[-0.04em] text-[#2f2a26]">
              Reviews
            </h2>

            {isMyProfile && (
              <Link
                href="/dashboard?tab=matches"
                className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-4 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
              >
                Go to Matches
              </Link>
            )}
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

