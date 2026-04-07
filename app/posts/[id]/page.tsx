import { createClient } from "../../../lib/supabase/server";
import MatchRequestBox from "./MatchRequestBox";

type PageProps = {
  params: {
    id: string;
  };
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

export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, duration_minutes, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .eq("id", params.id)
    .single();

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] flex items-center justify-center">
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

  const mapUrl =
    post.latitude !== null && post.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
      : post.location
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          post.location
        )}`
      : "";

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="text-base font-semibold">
                {getPurposeIcon(post.meeting_purpose)}{" "}
                {post.meeting_purpose || "Meetup"} ·{" "}
                {formatDuration(post.duration_minutes)}
              </div>

              <div className="mt-1 truncate text-xl font-semibold">
                {post.place_name || post.location || "No place"}
              </div>
            </div>

            {post.benefit_amount && (
              <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#f6e7b2] to-[#e8c97a] px-4 py-2 text-sm font-semibold text-[#5a4a1f] shadow">
                🪙 {post.benefit_amount}
              </div>
            )}
          </div>

          <div className="mt-3">
            {post.meeting_time && (
              <div className="text-sm text-[#6f655c]">
                ⏰ {formatTime(post.meeting_time)}
              </div>
            )}

            {post.location && (
              <div className="mt-1 line-clamp-1 text-sm text-[#6f655c]">
                📍 {post.location}
              </div>
            )}

            <div className="mt-1 text-sm text-[#6f655c]">
              👤 {post.target_gender || "Any"} /{" "}
              {post.target_age_group || "Any"}
            </div>

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-[#6f655c]">
              <span>🧑 {ownerName}</span>

              {user && user.id !== post.user_id && (
                <span
                  className={`rounded-full px-3 py-1 text-xs ${getStatusBadge(
                    myRequestStatus
                  )}`}
                >
                  {myRequestStatus}
                </span>
              )}

              {user && user.id === post.user_id && (
                <span className="rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-3 py-1 text-xs text-[#6b5f52]">
                  My meetup
                </span>
              )}
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
              >
                Open Map
              </a>
            )}

            <a
              href="/"
              className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Back
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#2f2a26]">
            Host Information
          </h2>

          <div className="mt-4 space-y-3 text-sm text-[#6f655c]">
            <div className="flex items-center gap-2">
              <span className="text-base">🧑</span>
              <span className="font-medium text-[#2f2a26]">{ownerName}</span>
            </div>

            {(ownerGender || ownerAgeGroup) && (
              <div className="flex items-center gap-2">
                <span className="text-base">👤</span>
                <span>
                  {ownerGender || "Unknown"}{" "}
                  {ownerGender && ownerAgeGroup ? "/" : ""}
                  {ownerAgeGroup || ""}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <span className="mt-[1px] text-base">📝</span>
              <span>
                {ownerBio || "No profile introduction yet."}
              </span>
            </div>
          </div>
        </div>

        {post.user_id && !isMatched && (
          <MatchRequestBox
            postId={post.id}
            postOwnerUserId={post.user_id}
          />
        )}

        <div className="text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}