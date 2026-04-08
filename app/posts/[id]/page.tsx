import Link from "next/link";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  MessageSquareText,
  Coins,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import MatchRequestBox from "./MatchRequestBox";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  gender: string | null;
  age_group: string | null;
};

type MatchRequestRow = {
  id: number;
  status: string;
};

type MatchRow = {
  id: number;
  status: string;
};

const getPurposeIcon = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return "☕";
    case "Meal":
      return "🍽";
    case "Dessert":
      return "🍰";
    case "Walk":
      return "🚶";
    case "Jogging":
      return "🏃";
    case "Yoga":
      return "🧘";
    case "Movie":
    case "Theater":
      return "🎬";
    case "Karaoke":
      return "🎤";
    case "Board Games":
      return "🎲";
    case "Gaming":
      return "🎮";
    case "Bowling":
      return "🎳";
    case "Arcade":
      return "🎯";
    case "Study":
      return "📚";
    case "Work Together":
    case "Work":
      return "💻";
    case "Book Talk":
    case "Book":
      return "📖";
    case "Photo Walk":
    case "Photo":
      return "📷";
    default:
      return "✨";
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

export default async function MeetupDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, duration_minutes, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .eq("id", id)
    .single();

  if (postError || !post) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f1ea]">
        <div className="text-center text-[#6f655c]">Meetup not found</div>
      </main>
    );
  }

  let ownerName = "Unknown";
  let ownerBio = "";
  let ownerGender = "";
  let ownerAgeGroup = "";

  if (post.user_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("id, display_name, bio, gender, age_group")
      .eq("id", post.user_id)
      .maybeSingle();

    const profile = ownerProfile as ProfileRow | null;

    if (profile) {
      ownerName = profile.display_name || "Unknown";
      ownerBio = profile.bio || "";
      ownerGender = profile.gender || "";
      ownerAgeGroup = profile.age_group || "";
    }
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

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold text-[#5f5347]">
                {getPurposeIcon(post.meeting_purpose)}{" "}
                {post.meeting_purpose || "Meetup"}
                {formatDuration(post.duration_minutes)
                  ? ` · ${formatDuration(post.duration_minutes)}`
                  : ""}
              </div>

              <div className="mt-2 truncate text-[2rem] font-bold leading-tight text-[#2f2a26]">
                {post.place_name || post.location || "No place"}
              </div>
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

          <div className="mt-5 space-y-2 text-[15px] text-[#6f655c]">
            {post.meeting_time && (
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                <span>{formatTime(post.meeting_time)}</span>
              </div>
            )}

            {post.location && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                <span className="line-clamp-1">{post.location}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
              <span>
                {post.target_gender || "Any"} / {post.target_age_group || "Any"}
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e8de] pt-4">
            {post.user_id ? (
              <Link
                href={ownerProfileHref}
                className="inline-flex items-center gap-2 rounded-full px-2 py-1 text-[#5a5149] transition hover:bg-[#f4ece4] hover:text-[#2f2a26]"
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
                className="rounded-[1rem] bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Open Map
              </a>
            )}

            <a
              href="/"
              className="rounded-[1rem] border border-[#dccfc2] bg-white px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Back
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[1.9rem] font-bold text-[#2f2a26]">
              Host Information
            </h2>

            {post.user_id && (
              <Link
                href={ownerProfileHref}
                className="rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
              >
                View Profile
              </Link>
            )}
          </div>

          <div className="mt-5 space-y-4 text-[15px] text-[#6f655c]">
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
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 shrink-0 text-[#8a7f74]" />
                <span>
                  {ownerGender || "Unknown"}{" "}
                  {ownerGender && ownerAgeGroup ? "/" : ""}
                  {ownerAgeGroup || ""}
                </span>
              </div>
            )}

            <div className="rounded-[1.25rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
              <div className="flex items-start gap-3">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
                <span className="leading-6">
                  {ownerBio || "No profile introduction yet."}
                </span>
              </div>
            </div>
          </div>
        </div>

        {post.user_id && user && user.id !== post.user_id && !isMatched && (
          <MatchRequestBox
            postId={post.id}
            postOwnerUserId={post.user_id}
          />
        )}

        <div className="px-1 text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}