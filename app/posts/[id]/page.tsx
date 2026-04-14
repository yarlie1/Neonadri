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
import DeletePostButton from "./DeletePostButton";

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

type ProfileCardData = {
  userId: string;
  displayName: string;
  aboutMe: string;
  gender: string;
  ageGroup: string;
  languages: string[];
  meetingStyle: string;
  interests: string[];
  responseNote: string;
  averageRating: number;
  reviewCount: number;
  completedMeetups: number;
  recentReviews: ReviewRow[];
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

const getPurposeIcon = (purpose: string | null, className?: string) => {
  const iconClassName =
    className || "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={iconClassName} />;
    case "Meal":
      return <UtensilsCrossed className={iconClassName} />;
    case "Dessert":
      return <CakeSlice className={iconClassName} />;
    case "Walk":
      return <Footprints className={iconClassName} />;
    case "Jogging":
    case "Yoga":
      return <PersonStanding className={iconClassName} />;
    case "Movie":
    case "Theater":
      return <Clapperboard className={iconClassName} />;
    case "Karaoke":
      return <Mic2 className={iconClassName} />;
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return <Gamepad2 className={iconClassName} />;
    case "Study":
      return <BookOpen className={iconClassName} />;
    case "Work Together":
    case "Work":
      return <BriefcaseBusiness className={iconClassName} />;
    case "Book Talk":
    case "Book":
      return <Book className={iconClassName} />;
    case "Photo Walk":
    case "Photo":
      return <Camera className={iconClassName} />;
    default:
      return <Sparkles className={iconClassName} />;
  }
};

const getPurposeTheme = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#8b5e4a_0%,#c98b67_100%)] text-white",
      };
    case "Meal":
    case "Dessert":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#9f7440_0%,#d5a15a_100%)] text-white",
      };
    case "Walk":
    case "Jogging":
    case "Yoga":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#5d8c5f_0%,#87b377_100%)] text-white",
      };
    case "Movie":
    case "Theater":
    case "Karaoke":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#5d4f7d_0%,#8c75b6_100%)] text-white",
      };
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#64508a_0%,#8f73c6_100%)] text-white",
      };
    case "Study":
    case "Book Talk":
    case "Book":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#4e5f84_0%,#6d8fb8_100%)] text-white",
      };
    case "Work Together":
    case "Work":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#4f4640_0%,#847467_100%)] text-white",
      };
    case "Photo Walk":
    case "Photo":
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#8e5f5b_0%,#c8827f_100%)] text-white",
      };
    default:
      return {
        bandClass:
          "bg-[linear-gradient(135deg,#2f2a26_0%,#5a4d45_100%)] text-white",
      };
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

function ProfileShowcaseCard({
  title,
  subtitle,
  profileHref,
  data,
  isCurrentUser = false,
}: {
  title: string;
  subtitle: string;
  profileHref?: string;
  data: ProfileCardData;
  isCurrentUser?: boolean;
}) {
  const hasAboutMe = !!data.aboutMe.trim();
  const hasLanguages = data.languages.length > 0;
  const hasMeetingStyle = !!data.meetingStyle.trim();
  const hasInterests = data.interests.length > 0;
  const hasResponseNote = !!data.responseNote.trim();
  const summary = hasAboutMe
    ? data.aboutMe.replace(/\s+/g, " ").trim().length <= 140
      ? data.aboutMe.replace(/\s+/g, " ").trim()
      : `${data.aboutMe.replace(/\s+/g, " ").trim().slice(0, 137).trimEnd()}...`
    : "No introduction yet.";
  const roundedAverage = Math.round(data.averageRating);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e5b29e_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
              {title}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f5d8bf,_#c18f73_78%)] text-lg font-bold text-white shadow-[0_12px_24px_rgba(160,111,82,0.18)]">
                {data.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="block truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#2b1f1a] underline-offset-4 transition hover:text-[#6b5f52] hover:underline"
                    >
                      {data.displayName}
                    </Link>
                  ) : (
                    <div className="truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#2b1f1a]">
                      {data.displayName}
                    </div>
                  )}
                  {isCurrentUser && (
                    <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d6458]">
                      You
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-[#5f453b]">{subtitle}</div>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-[#6b5f52] backdrop-blur">
            {data.averageRating.toFixed(1)} rating / {data.reviewCount} reviews
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(data.gender || data.ageGroup) && (
            <InfoItem
              icon={<UserRound className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label={title.includes("Guest") ? "Guest" : "Host"}
              value={`${data.gender || "Unknown"}${data.gender && data.ageGroup ? " / " : ""}${data.ageGroup || ""}`}
            />
          )}
          {hasLanguages && (
            <InfoItem
              icon={<Languages className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Languages"
              value={data.languages.join(", ")}
            />
          )}
          {hasMeetingStyle && (
            <InfoItem
              icon={<HeartHandshake className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Meeting Style"
              value={data.meetingStyle}
            />
          )}
          {hasResponseNote && (
            <InfoItem
              icon={<Clock3 className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Response Note"
              value={data.responseNote}
            />
          )}
        </div>

        <div className="mt-4 rounded-[1.4rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                About Me
              </div>
              <div className="mt-2 text-[15px] leading-7 text-[#5f5347]">{summary}</div>
            </div>
          </div>
        </div>

        {hasInterests && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
              <Sparkles className="h-3.5 w-3.5 text-[#8a7f74]" />
              Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((item) => (
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

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Rating</div>
            <div className="mt-1 text-xl font-bold text-[#2f2a26]">{data.averageRating.toFixed(1)}</div>
            <div className="mt-1 flex justify-center">
              <StarRating value={roundedAverage} size="sm" />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Reviews</div>
            <div className="mt-2 text-xl font-bold text-[#2f2a26]">{data.reviewCount}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Meetups</div>
            <div className="mt-2 text-xl font-bold text-[#2f2a26]">{data.completedMeetups}</div>
          </div>
        </div>

        <div className="mt-4 rounded-[1.25rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
          <div className="text-sm font-semibold text-[#2f2a26]">Recent Reviews</div>
          <div className="mt-3 space-y-3">
            {data.recentReviews.length === 0 ? (
              <div className="text-sm text-[#8b7f74]">No reviews yet.</div>
            ) : (
              data.recentReviews.map((review) => (
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
  let guestProfileData: ProfileCardData | null = null;
  let matchedGuestUserId: string | null = null;

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
  }

  let matchedRecord: MatchRow | null = null;
  if (isPostMatched) {
    const { data: matchRecordData } = await supabase
      .from("matches")
      .select("id, user_a, user_b, status")
      .eq("post_id", post.id)
      .maybeSingle();

    matchedRecord = (matchRecordData as MatchRow | null) || null;
  }

  const matchedGuestId =
    matchedRecord?.user_a && matchedRecord.user_a !== post.user_id
      ? matchedRecord.user_a
      : matchedRecord?.user_b && matchedRecord.user_b !== post.user_id
      ? matchedRecord.user_b
      : null;

  const isViewerParticipant = !!user && !!matchedRecord && (user.id === post.user_id || user.id === matchedGuestId);

  if (matchedGuestId) {
    matchedGuestUserId = matchedGuestId;
  }

  if (matchedGuestId) {
    const [guestProfileRes, guestStatsRes, guestReviewsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, display_name, bio, about_me, gender, age_group, preferred_area, languages, meeting_style, interests, response_time_note"
        )
        .eq("id", matchedGuestId)
        .maybeSingle(),
      supabase.rpc("get_profile_stats", {
        p_user_id: matchedGuestId,
      }),
      supabase
        .from("match_reviews")
        .select("id, rating, review_text, created_at")
        .eq("reviewee_user_id", matchedGuestId)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const guestProfile = guestProfileRes.data as ProfileRow | null;
    const guestStats = guestStatsRes.data as ProfileStats | null;
    const guestReviews = (guestReviewsRes.data || []) as ReviewRow[];

    if (guestProfile) {
      guestProfileData = {
        userId: guestProfile.id,
        displayName: guestProfile.display_name || "Unknown",
        aboutMe: guestProfile.about_me || "",
        gender: guestProfile.gender || "",
        ageGroup: guestProfile.age_group || "",
        languages: guestProfile.languages || [],
        meetingStyle: guestProfile.meeting_style || "",
        interests: guestProfile.interests || [],
        responseNote: guestProfile.response_time_note || "",
        averageRating: Number(guestStats?.average_rating ?? 0),
        reviewCount: Number(guestStats?.review_count ?? 0),
        completedMeetups: Number(guestStats?.completed_meetups ?? 0),
        recentReviews: guestReviews,
      };

      matchedPartner = {
        userId: guestProfile.id,
        displayName: guestProfile.display_name || "Unknown",
        gender: guestProfile.gender || "",
        ageGroup: guestProfile.age_group || "",
      };
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
  const targetLabel = `${post.target_gender || "Any"} / ${
    post.target_age_group || "Any"
  }`;
  const meetupTimeLabel = formatTime(post.meeting_time) || "Time not set";
  const meetupDurationLabel = formatDuration(post.duration_minutes) || "Flexible";
  const benefitExplanation = post.benefit_amount
    ? `During this ${meetupDurationLabel} ${post.meeting_purpose || "meetup"}, the host gives ${post.benefit_amount} to the guest.`
    : `During this ${meetupDurationLabel} ${post.meeting_purpose || "meetup"}, the host has not listed a guest benefit yet.`;
  const purposeTheme = getPurposeTheme(post.meeting_purpose);
  const ownerProfileData: ProfileCardData = {
    userId: post.user_id,
    displayName: ownerName,
    aboutMe: ownerAboutMe,
    gender: ownerGender,
    ageGroup: ownerAgeGroup,
    languages: ownerLanguages,
    meetingStyle: ownerMeetingStyle,
    interests: ownerInterests,
    responseNote: ownerResponseNote,
    averageRating: ownerAverageRating,
    reviewCount: ownerReviewCount,
    completedMeetups: ownerCompletedMeetups,
    recentReviews: ownerRecentReviews,
  };
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
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        {isPostMatched && isViewerParticipant && (
          <div className="rounded-[28px] border border-[#dccfc2] bg-[linear-gradient(135deg,#fff9f3_0%,#f2e4d7_100%)] p-4 shadow-[0_14px_32px_rgba(92,69,52,0.08)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                  Upcoming meetup
                </div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  {post.meeting_purpose || "Meetup"} is confirmed
                </div>
                <div className="mt-2 text-sm leading-6 text-[#6f655c]">
                  {meetupTimeLabel}
                </div>
                <div className="text-sm leading-6 text-[#6f655c]">
                  {post.place_name || post.location || "Selected place"}
                </div>
              </div>
              <div className="rounded-full bg-[#efe7dc] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b5f52]">
                Matched
              </div>
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e5b29e_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                  Meetup overview
                </div>
                <span className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d6458]">
                  {isPostMatched ? "Matched" : "Open"}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-stretch gap-3">
                <div
                  className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 text-white shadow-[0_16px_30px_rgba(47,42,38,0.18)] ${purposeTheme.bandClass}`}
                >
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/14">
                    {getPurposeIcon(
                      post.meeting_purpose,
                      "h-[18px] w-[18px] shrink-0 text-white"
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[1.35rem] font-black tracking-[-0.04em] text-white sm:text-[1.55rem]">
                      {post.meeting_purpose || "Meetup"}
                    </div>
                  </div>
                </div>
                <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-white/70 px-1.5 py-2 text-center text-[#4f443b] shadow-sm backdrop-blur">
                  <Clock3 className="h-4 w-4" />
                  <span className="mt-1 text-sm font-semibold tracking-[-0.03em]">
                    {meetupDurationLabel}
                  </span>
                </div>
                <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#ffe5b6_0%,#ffd18e_100%)] px-1.5 py-2 text-center text-[#6e4715] shadow-sm">
                  <Coins className="h-4 w-4" />
                  <span className="mt-1 text-sm font-semibold tracking-[-0.03em]">
                    {post.benefit_amount || "N/A"}
                  </span>
                </div>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                {benefitExplanation}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#5f453b]">
                <span>Looking for {targetLabel}</span>
                <span>Hosted by {ownerName}</span>
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                Quick snapshot
              </div>
              <div className="grid grid-cols-1 gap-3">
                <StatCard
                  label="Host"
                  value={[ownerGender || "Unknown", ownerAgeGroup || null].filter(Boolean).join(" / ")}
                />
                <StatCard label="Guest" value={targetLabel} />
                <StatCard label="When" value={meetupTimeLabel} />
                <StatCard label="Place" value={post.place_name || "Selected place"} />
              </div>
            </div>

            <div className="mt-5 rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                Location
              </div>
              <div className="mt-3 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-3 text-[15px] text-[#5f5347]">
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
                  {mapUrl && (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-[#f6eee6] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>

                {post.latitude !== null && post.longitude !== null ? (
                  <div className="overflow-hidden rounded-[22px] border border-[#efe6db] bg-[#fcfaf7]">
                    <ClientMap latitude={post.latitude} longitude={post.longitude} />
                  </div>
                ) : (
                  <div className="rounded-[22px] border border-[#efe6db] bg-[#fcfaf7] px-4 py-8 text-sm text-[#8b7f74]">
                    Map preview is not available for this meetup.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <ProfileShowcaseCard
              title="About the Host"
              subtitle="Warm, low-pressure meetup host"
              profileHref={post.user_id ? ownerProfileHref : undefined}
              data={ownerProfileData}
              isCurrentUser={user?.id === post.user_id}
            />

            {isPostMatched && isViewerParticipant && guestProfileData && (
              <ProfileShowcaseCard
                title="About the Guest"
                subtitle="Confirmed guest for this meetup"
                profileHref={matchedGuestUserId ? `/profile/${matchedGuestUserId}` : undefined}
                data={guestProfileData}
                isCurrentUser={user?.id === matchedGuestUserId}
              />
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-36">
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

            {user && user.id === post.user_id && !isPostMatched && (
              <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
                  Meetup actions
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/write/${post.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Meetup
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-1 text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}
