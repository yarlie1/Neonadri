import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  MessageSquareText,
  Coins,
  Languages,
  Star,
  HeartHandshake,
  Sparkles,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import MatchRequestBox from "./MatchRequestBox";
import ClientMap from "./ClientMap";

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
};

type MatchRequestRow = {
  id: number;
  status: string;
};

type MatchRow = {
  id: number;
  status: string;
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

type PostRow = {
  id: number;
  user_id: string;
  created_at: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  target_gender: string | null;
  target_age_group: string | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number | null;
  longitude: number | null;
};

const getPurposeIcon = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return "\u2615";
    case "Meal":
      return "\ud83c\udf7d";
    case "Dessert":
      return "\ud83c\udf70";
    case "Walk":
      return "\ud83d\udeb6";
    case "Jogging":
      return "\ud83c\udfc3";
    case "Yoga":
      return "\ud83e\uddd8";
    case "Movie":
    case "Theater":
      return "\ud83c\udfac";
    case "Karaoke":
      return "\ud83c\udfa4";
    case "Board Games":
      return "\ud83c\udfb2";
    case "Gaming":
      return "\ud83c\udfae";
    case "Bowling":
      return "\ud83c\udfb3";
    case "Arcade":
      return "\ud83c\udfaf";
    case "Study":
      return "\ud83d\udcda";
    case "Work Together":
    case "Work":
      return "\ud83d\udcbb";
    case "Book Talk":
    case "Book":
      return "\ud83d\udcd6";
    case "Photo Walk":
    case "Photo":
      return "\ud83d\udcf7";
    default:
      return "\u2728";
  }
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return null;

  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
};

const getFriendlyStatusLabel = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "matched") return "Matched";
  if (normalized === "accepted") return "Accepted";
  if (normalized === "pending") return "Pending";
  if (normalized === "rejected") return "Declined";

  return "No request yet";
};

const getStatusBadge = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "matched" || normalized === "accepted") {
    return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
  }

  if (normalized === "pending") {
    return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
  }

  if (normalized === "rejected") {
    return "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]";
  }

  return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
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
    <div className="rounded-[18px] border border-[#e7ddd2] bg-white px-4 py-3">
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
    <div className="rounded-[22px] border border-[#eadfd3] bg-[#fffdfa] px-4 py-4 text-center shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
        {value}
      </div>
    </div>
  );
}

export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const id = params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, duration_minutes, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .eq("id", id)
    .maybeSingle();

  if (postError || !postData) {
    notFound();
  }

  const post = postData as PostRow;

  let ownerName = "Unknown";
  let ownerAboutMe = "";
  let ownerGender = "";
  let ownerAgeGroup = "";
  let ownerLanguages: string[] = [];
  let ownerMeetingStyle = "";
  let ownerInterests: string[] = [];
  let ownerResponseNote = "";

  let ownerAverageRating = 0;
  let ownerReviewCount = 0;
  let ownerCompletedMeetups = 0;
  let ownerRecentReviews: ReviewRow[] = [];

  if (post.user_id) {
    const [ownerProfileRes, ownerStatsRes, ownerReviewsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, bio, about_me, gender, age_group, preferred_area, languages, meeting_style, interests, response_time_note"
        )
        .eq("id", post.user_id)
        .maybeSingle(),

      supabase.rpc("get_profile_stats", {
        p_user_id: post.user_id,
      }),

      supabase
        .from("match_reviews")
        .select("id, rating, review_text, created_at")
        .eq("reviewee_user_id", post.user_id)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const profile = ownerProfileRes.data as ProfileRow | null;
    const stats = ownerStatsRes.data as ProfileStats | null;
    const reviews = (ownerReviewsRes.data || []) as ReviewRow[];

    if (profile) {
      ownerName = profile.display_name || "Unknown";
      ownerAboutMe = profile.about_me || "";
      ownerGender = profile.gender || "";
      ownerAgeGroup = profile.age_group || "";
      ownerLanguages = profile.languages || [];
      ownerMeetingStyle = profile.meeting_style || "";
      ownerInterests = profile.interests || [];
      ownerResponseNote = profile.response_time_note || "";
    }

    ownerAverageRating = Number(stats?.average_rating ?? 0);
    ownerReviewCount = Number(stats?.review_count ?? 0);
    ownerCompletedMeetups = Number(stats?.completed_meetups ?? 0);
    ownerRecentReviews = reviews;
  }

  let myRequestStatus = "No request yet";
  let isMatched = false;

  if (user && post.user_id && user.id !== post.user_id) {
    const [{ data: requestData }, { data: matchData }] = await Promise.all([
      supabase
        .from("match_requests")
        .select("id, status")
        .eq("post_id", post.id)
        .eq("requester_user_id", user.id)
        .eq("post_owner_user_id", post.user_id)
        .maybeSingle(),

      supabase
        .from("matches")
        .select("id, status")
        .eq("post_id", post.id)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .maybeSingle(),
    ]);

    const request = requestData as MatchRequestRow | null;
    const match = matchData as MatchRow | null;

    if (request?.status) {
      myRequestStatus = request.status;
    }

    if (match?.status) {
      isMatched = true;
      myRequestStatus = "matched";
    }
  }

  const mapUrl =
    post.latitude !== null && post.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
      : post.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          post.location
        )}`
      : "";

  const ownerProfileHref = post.user_id ? `/profile/${post.user_id}` : "#";
  const roundedAverage = Math.round(ownerAverageRating);

  const hasAboutMe = !!ownerAboutMe.trim();
  const hasLanguages = ownerLanguages.length > 0;
  const hasMeetingStyle = !!ownerMeetingStyle.trim();
  const hasInterests = ownerInterests.length > 0;
  const hasResponseNote = !!ownerResponseNote.trim();
  const ownerSummary = hasAboutMe
    ? ownerAboutMe.replace(/\s+/g, " ").trim().length <= 140
      ? ownerAboutMe.replace(/\s+/g, " ").trim()
      : `${ownerAboutMe.replace(/\s+/g, " ").trim().slice(0, 137).trimEnd()}...`
    : "No introduction yet.";

  const locationLabel = post.place_name || post.location || "No place";
  const targetLabel = `${post.target_gender || "Any"} / ${
    post.target_age_group || "Any"
  }`;
  const meetupTimeLabel = formatTime(post.meeting_time) || "Time not set";
  const meetupDurationLabel = formatDuration(post.duration_minutes) || "Flexible";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e5b29e_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                  <span>{getPurposeIcon(post.meeting_purpose)}</span>
                  <span>{post.meeting_purpose || "Meetup"}</span>
                </div>

                <div className="mt-4 truncate text-[2rem] font-black leading-tight tracking-[-0.04em] text-[#2b1f1a] sm:text-[2.35rem]">
                  {locationLabel}
                </div>

                <p className="mt-3 max-w-xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                  Clear timing, a real place, and enough host context to decide whether this meetup feels right before you commit.
                </p>
              </div>

              {post.benefit_amount && (
                <div className="shrink-0 rounded-[1.4rem] bg-gradient-to-br from-[#f6e7b2] to-[#e8c97a] px-4 py-3 text-base font-bold text-[#5a4a1f] shadow">
                  <span className="inline-flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    {post.benefit_amount}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatCard label="When" value={post.meeting_time ? "Scheduled" : "Flexible"} />
              <StatCard label="Duration" value={meetupDurationLabel} />
              <StatCard label="Target" value={post.target_gender || "Any"} />
              <StatCard label="Age" value={post.target_age_group || "Any"} />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Meetup snapshot
                </div>
                <div className="mt-3 space-y-2 text-[15px] text-[#5f5347]">
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span>{meetupTimeLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span>{meetupDurationLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span>{targetLabel}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Place details
                </div>
                <div className="mt-3 space-y-2 text-[15px] text-[#5f5347]">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <span>{post.place_name || "Selected place"}</span>
                  </div>
                  {post.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span className="line-clamp-3">{post.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/45 pt-4">
              {post.user_id ? (
                <Link
                  href={ownerProfileHref}
                  className="inline-flex items-center gap-2 rounded-full bg-white/55 px-3 py-2 text-[#5a5149] transition hover:bg-white hover:text-[#2f2a26]"
                >
                  <UserCircle2 className="h-5 w-5 text-[#8a7f74]" />
                  <span className="font-medium">{ownerName}</span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 text-[#5a5149]">
                  <UserCircle2 className="h-5 w-5 text-[#8a7f74]" />
                  <span className="font-medium">{ownerName}</span>
                </span>
              )}

              {user && user.id !== post.user_id && myRequestStatus !== "No request yet" && (
                <span
                  className={`rounded-full px-3 py-1 text-xs ${getStatusBadge(
                    myRequestStatus
                  )}`}
                >
                  {getFriendlyStatusLabel(myRequestStatus)}
                </span>
              )}

              {user && user.id === post.user_id && (
                <span className="rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-3 py-1 text-xs text-[#6b5f52]">
                  My meetup
                </span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#2f2a26] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#443730]"
                >
                  Open Map
                </a>
              )}

              <Link
                href="/"
                className="rounded-full border border-white/60 bg-white/65 px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-white"
              >
                Back
              </Link>
            </div>
          </div>
        </div>

        {post.latitude !== null && post.longitude !== null && (
          <div className="overflow-hidden rounded-[30px] border border-[#eadfd3] bg-white/90 p-4 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-2 pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                  Meetup location
                </div>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  See the meetup on the map
                </h2>
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                >
                  Full map
                </a>
              )}
            </div>
            <ClientMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        )}

        <div className="rounded-[30px] border border-[#eadfd3] bg-white/90 px-6 py-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.75rem] font-bold text-[#2f2a26]">
              About the Host
            </h2>

            {post.user_id && (
              <Link
                href={ownerProfileHref}
                className="rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
              >
                View Full Profile
              </Link>
            )}
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[15px] text-[#6f655c]">
              <div className="flex items-center gap-3">
                <UserCircle2 className="h-5 w-5 shrink-0 text-[#8a7f74]" />
                {post.user_id ? (
                  <Link
                    href={ownerProfileHref}
                    className="font-medium text-[#2f2a26] underline-offset-4 transition hover:text-[#6b5f52] hover:underline"
                  >
                    {ownerName}
                  </Link>
                ) : (
                  <span className="font-medium text-[#2f2a26]">{ownerName}</span>
                )}
              </div>

              {(ownerGender || ownerAgeGroup) && (
                <div className="flex items-center gap-2">
                  <UserRound className="h-5 w-5 shrink-0 text-[#8a7f74]" />
                  <span>
                    {ownerGender || "Unknown"}
                    {ownerGender && ownerAgeGroup ? " / " : ""}
                    {ownerAgeGroup || ""}
                  </span>
                </div>
              )}

              {hasLanguages && (
                <div className="flex items-center gap-2">
                  <Languages className="h-5 w-5 shrink-0 text-[#8a7f74]" />
                  <span>{ownerLanguages.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="rounded-[1.25rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                    About Me
                  </div>
                  <div className="mt-1 text-sm leading-7 text-[#5f5347]">
                    {ownerSummary}
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
                    value={ownerLanguages.join(", ")}
                  />
                )}

                {hasMeetingStyle && (
                  <InfoItem
                    icon={<HeartHandshake className="h-3.5 w-3.5 text-[#8a7f74]" />}
                    label="Meeting Style"
                    value={ownerMeetingStyle}
                  />
                )}

                {hasResponseNote && (
                  <InfoItem
                    icon={<Clock3 className="h-3.5 w-3.5 text-[#8a7f74]" />}
                    label="Response Note"
                    value={ownerResponseNote}
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
                  {ownerInterests.map((item) => (
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

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
                <div className="text-xs text-[#8b7f74]">Rating</div>
                <div className="mt-1 text-xl font-bold text-[#2f2a26]">
                  {ownerAverageRating.toFixed(1)}
                </div>
                <div className="mt-1 flex justify-center">
                  <StarRating value={roundedAverage} size="sm" />
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
                <div className="text-xs text-[#8b7f74]">Reviews</div>
                <div className="mt-2 text-xl font-bold text-[#2f2a26]">
                  {ownerReviewCount}
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
                <div className="text-xs text-[#8b7f74]">Meetups</div>
                <div className="mt-2 text-xl font-bold text-[#2f2a26]">
                  {ownerCompletedMeetups}
                </div>
              </div>
            </div>

            <div className="rounded-[1.25rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
              <div className="text-sm font-semibold text-[#2f2a26]">
                Recent Reviews
              </div>

              <div className="mt-3 space-y-3">
                {ownerRecentReviews.length === 0 ? (
                  <div className="text-sm text-[#8b7f74]">No reviews yet.</div>
                ) : (
                  ownerRecentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[1rem] border border-[#eee4d9] bg-white px-3 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <StarRating value={review.rating} size="md" />
                        <div className="text-[11px] text-[#9b8f84]">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f5347]">
                        {review.review_text || "No comment."}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {post.user_id && user && user.id !== post.user_id && !isMatched && (
          <MatchRequestBox postId={post.id} postOwnerUserId={post.user_id} />
        )}

        <div className="px-1 text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
