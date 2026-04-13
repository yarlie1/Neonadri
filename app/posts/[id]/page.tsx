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
  Coffee,
  UtensilsCrossed,
  CakeSlice,
  Footprints,
  PersonStanding,
  Clapperboard,
  Mic2,
  Gamepad2,
  BookOpen,
  BriefcaseBusiness,
  Book,
  Camera,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import MatchRequestBox from "./MatchRequestBox";
import ClientMap from "./ClientMap";
import OwnerMatchPanel from "./OwnerMatchPanel";

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
  requester_user_id: string;
  post_owner_user_id: string;
  status: string;
  created_at: string;
};

type MatchRow = {
  id: number;
  user_a?: string;
  user_b?: string;
  status: string;
};

type MatchSummaryRow = {
  post_id: number;
  is_matched: boolean;
  pending_request_count: number;
  total_request_count: number;
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
  const className = "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={className} />;
    case "Meal":
      return <UtensilsCrossed className={className} />;
    case "Dessert":
      return <CakeSlice className={className} />;
    case "Walk":
      return <Footprints className={className} />;
    case "Jogging":
    case "Yoga":
      return <PersonStanding className={className} />;
    case "Movie":
    case "Theater":
      return <Clapperboard className={className} />;
    case "Karaoke":
      return <Mic2 className={className} />;
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return <Gamepad2 className={className} />;
    case "Study":
      return <BookOpen className={className} />;
    case "Work Together":
    case "Work":
      return <BriefcaseBusiness className={className} />;
    case "Book Talk":
    case "Book":
      return <Book className={className} />;
    case "Photo Walk":
    case "Photo":
      return <Camera className={className} />;
    default:
      return <Sparkles className={className} />;
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
  let myRequestId: number | null = null;
  let isPostMatched = false;
  let pendingRequestCount = 0;
  let totalRequestCount = 0;
  let ownerRequests: MatchRequestRow[] = [];
  let matchedPartner:
    | {
        userId: string;
        displayName: string;
        gender: string;
        ageGroup: string;
      }
    | null = null;

  const { data: summaryData } = await supabase.rpc("get_post_match_summaries", {
    p_post_ids: [post.id],
  });

  const summary = ((summaryData || []) as MatchSummaryRow[])[0];
  isPostMatched = !!summary?.is_matched;
  pendingRequestCount = Number(summary?.pending_request_count || 0);
  totalRequestCount = Number(summary?.total_request_count || 0);

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
      myRequestId = request.id;
    }

    if (match?.status) {
      myRequestStatus = "matched";
    }
  }

  if (user && user.id === post.user_id) {
    const { data: ownerRequestData } = await supabase
      .from("match_requests")
      .select("id, requester_user_id, post_owner_user_id, status, created_at")
      .eq("post_id", post.id)
      .eq("post_owner_user_id", user.id)
      .order("created_at", { ascending: false });

    ownerRequests = (ownerRequestData || []) as MatchRequestRow[];

    if (isPostMatched) {
      const { data: ownerMatchData } = await supabase
        .from("matches")
        .select("id, user_a, user_b, status")
        .eq("post_id", post.id)
        .maybeSingle();

      const match = ownerMatchData as MatchRow | null;
      const matchedPartnerId =
        match?.user_a === user.id ? match?.user_b : match?.user_b === user.id ? match?.user_a : null;

      if (matchedPartnerId) {
        const { data: partnerProfile } = await supabase
          .from("profiles")
          .select("id, display_name, gender, age_group")
          .eq("id", matchedPartnerId)
          .maybeSingle();

        if (partnerProfile) {
          matchedPartner = {
            userId: partnerProfile.id,
            displayName: partnerProfile.display_name || "Unknown",
            gender: partnerProfile.gender || "",
            ageGroup: partnerProfile.age_group || "",
          };
        }
      }
    }
  }

  const requesterIds = Array.from(
    new Set(ownerRequests.map((request) => request.requester_user_id).filter(Boolean))
  );
  const requesterProfileMap = new Map<
    string,
    { displayName: string; gender: string; ageGroup: string }
  >();

  if (requesterIds.length > 0) {
    const { data: requesterProfiles } = await supabase
      .from("profiles")
      .select("id, display_name, gender, age_group")
      .in("id", requesterIds);

    ((requesterProfiles || []) as Array<{
      id: string;
      display_name: string | null;
      gender: string | null;
      age_group: string | null;
    }>).forEach((profile) => {
      requesterProfileMap.set(profile.id, {
        displayName: profile.display_name || "Unknown",
        gender: profile.gender || "",
        ageGroup: profile.age_group || "",
      });
    });
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
  const ownerRequestItems = ownerRequests.map((request) => {
    const profile = requesterProfileMap.get(request.requester_user_id);

    return {
      id: request.id,
      requesterUserId: request.requester_user_id,
      requesterName: profile?.displayName || "Unknown",
      requesterGender: profile?.gender || "",
      requesterAgeGroup: profile?.ageGroup || "",
      createdAt: request.created_at,
      status: request.status,
    };
  });
  const heroStatusLabel = isPostMatched ? "Matched" : "Open";
  const heroStatusClass = isPostMatched
    ? "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]"
    : "bg-[#eef7ee] text-[#4f8a54] border border-[#dce8dc]";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e5b29e_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                  <span>{getPurposeIcon(post.meeting_purpose)}</span>
                  <span>{post.meeting_purpose || "Meetup"}</span>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${heroStatusClass}`}
                >
                  {heroStatusLabel}
                </span>
                {user && user.id !== post.user_id && myRequestStatus !== "No request yet" && (
                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusBadge(
                      myRequestStatus
                    )}`}
                  >
                    {getFriendlyStatusLabel(myRequestStatus)}
                  </span>
                )}
                {user && user.id === post.user_id && (
                  <span className="rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b5f52]">
                    My meetup
                  </span>
                )}
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

            <div className="mt-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                Meetup overview
              </div>
              <div className="mt-3 text-[2rem] font-black leading-[1.02] tracking-[-0.05em] text-[#2b1f1a] sm:text-[2.5rem]">
                {locationLabel}
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                A clear meetup plan with time, place, benefit, and just enough host context to decide quickly.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <StatCard label="When" value={meetupTimeLabel} />
                  <StatCard label="Duration" value={meetupDurationLabel} />
                  <StatCard label="Guest" value={targetLabel} />
                  <StatCard label="Benefit" value={post.benefit_amount || "None"} />
                  <StatCard
                    label={isPostMatched ? "Status" : "Requests"}
                    value={isPostMatched ? "Matched" : `${totalRequestCount}`}
                  />
                </div>
              </div>

              <div className="rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Hosted by
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f5d8bf,_#c18f73_78%)] text-base font-bold text-white shadow-[0_12px_24px_rgba(160,111,82,0.18)]">
                    {ownerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    {post.user_id ? (
                      <Link
                        href={ownerProfileHref}
                        className="block truncate text-base font-bold text-[#2f2a26] underline-offset-4 transition hover:text-[#6b5f52] hover:underline"
                      >
                        {ownerName}
                      </Link>
                    ) : (
                      <div className="truncate text-base font-bold text-[#2f2a26]">{ownerName}</div>
                    )}
                    <div className="mt-1 text-sm text-[#6f655c]">
                      {[ownerGender || "Unknown", ownerAgeGroup || null].filter(Boolean).join(" / ")}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {user && user.id === post.user_id && !isPostMatched && (
                    <Link
                      href={`/write/${post.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                    >
                      <Sparkles className="h-4 w-4" />
                      Edit Meetup
                    </Link>
                  )}

                  {isPostMatched && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-[#efe7dc] px-4 py-2 text-sm font-medium text-[#5f5347]">
                      <HeartHandshake className="h-4 w-4" />
                      Match completed
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Meetup details
                </div>
                <div className="mt-3 space-y-3 text-[15px] text-[#5f5347]">
                  <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8f84]">
                        Time
                      </div>
                      <div className="mt-1">{meetupTimeLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8f84]">
                        Duration
                      </div>
                      <div className="mt-1">{meetupDurationLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8f84]">
                        Looking for
                      </div>
                      <div className="mt-1">{targetLabel}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/50 bg-white/55 px-4 py-4 backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                  Location
                </div>
                <div className="mt-3 space-y-3 text-[15px] text-[#5f5347]">
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8f84]">
                        Place
                      </div>
                      <div className="mt-1">{post.place_name || "Selected place"}</div>
                    </div>
                  </div>
                  {post.location && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9b8f84]">
                          Address
                        </div>
                        <div className="mt-1 line-clamp-3">{post.location}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {post.latitude !== null && post.longitude !== null && (
          <div className="overflow-hidden rounded-[30px] border border-[#eadfd3] bg-white/90 p-4 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 px-2 pb-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                  Where you'll meet
                </div>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  Map and address
                </h2>
                <p className="mt-2 text-sm text-[#6f655c]">
                  Confirm the meeting area before you send a request.
                </p>
              </div>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                >
                  Open in Maps
                </a>
              )}
            </div>
            <div className="mb-4 rounded-[22px] border border-[#efe6db] bg-[#fcfaf7] px-4 py-3 text-sm leading-6 text-[#5f5347]">
              <div className="font-medium text-[#2f2a26]">{post.place_name || "Selected place"}</div>
              {post.location && <div className="mt-1 text-[#6f655c]">{post.location}</div>}
            </div>
            <ClientMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        )}

        <div className="rounded-[30px] border border-[#eadfd3] bg-white/90 px-6 py-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
          <div>
            <h2 className="text-[1.75rem] font-bold text-[#2f2a26]">
              About the Host
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <div className="rounded-[1.6rem] border border-[#efe3d8] bg-[linear-gradient(135deg,#fffaf5_0%,#f8eee3_100%)] p-4 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                    Host snapshot
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f5d8bf,_#c18f73_78%)] text-lg font-bold text-white shadow-[0_12px_24px_rgba(160,111,82,0.18)]">
                      {ownerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      {post.user_id ? (
                        <Link
                          href={ownerProfileHref}
                          className="block truncate text-lg font-bold tracking-[-0.03em] text-[#2f2a26] underline-offset-4 transition hover:text-[#6b5f52] hover:underline"
                        >
                          {ownerName}
                        </Link>
                      ) : (
                        <div className="truncate text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
                          {ownerName}
                        </div>
                      )}
                      <div className="mt-1 text-sm text-[#6f655c]">
                        Warm, low-pressure meetup host
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:min-w-[250px]">
                  {(ownerGender || ownerAgeGroup) && (
                    <div className="flex items-start gap-2 rounded-[1rem] bg-white/75 px-3 py-2">
                      <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                          Host
                        </div>
                        <div className="text-sm font-medium text-[#4f443b]">
                          {ownerGender || "Unknown"}
                          {ownerGender && ownerAgeGroup ? " / " : ""}
                          {ownerAgeGroup || ""}
                        </div>
                      </div>
                    </div>
                  )}

                  {hasLanguages && (
                    <div className="flex items-start gap-2 rounded-[1rem] bg-white/75 px-3 py-2">
                      <Languages className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                          Languages
                        </div>
                        <div className="truncate text-sm font-medium text-[#4f443b]">
                          {ownerLanguages.join(", ")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                    About Me
                  </div>
                  <div className="mt-2 text-[15px] leading-7 text-[#5f5347]">
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

        {user && user.id === post.user_id ? (
          <OwnerMatchPanel
            postId={post.id}
            isMatched={isPostMatched}
            pendingRequestCount={pendingRequestCount}
            requests={ownerRequestItems}
            matchedPartner={matchedPartner}
          />
        ) : post.user_id ? (
          <MatchRequestBox
            postId={post.id}
            postOwnerUserId={post.user_id}
            requestCount={totalRequestCount}
            isPostMatched={isPostMatched}
            myRequestId={myRequestId}
            myRequestStatus={myRequestStatus}
          />
        ) : null}

        <div className="px-1 text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
