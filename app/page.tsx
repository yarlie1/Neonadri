import Link from "next/link";
import { createClient } from "../lib/supabase/server";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MatchRequestRow = {
  post_id: number;
  status: string;
};

type MatchRow = {
  post_id: number;
  status: string;
};

const getPurposeIcon = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
      return "☕";
    case "Casual Chat":
      return "💬";
    case "Meal":
      return "🍽";
    case "Walk":
      return "🚶";
    case "Study":
      return "📚";
    case "Make Friends":
      return "🤝";
    case "Networking":
      return "💼";
    default:
      return "✨";
  }
};

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const posts = (postsData as PostRow[]) || [];

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id)));

  const profileMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap.set(profile.id, profile.display_name || "Unknown");
    });
  }

  const requestStatusMap = new Map<number, string>();

  if (user) {
    const [requestsRes, matchesRes] = await Promise.all([
      supabase
        .from("match_requests")
        .select("post_id, status")
        .eq("requester_user_id", user.id),

      supabase
        .from("matches")
        .select("post_id, status")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    ]);

    ((requestsRes.data as MatchRequestRow[]) || []).forEach((item) => {
      requestStatusMap.set(item.post_id, item.status);
    });

    ((matchesRes.data as MatchRow[]) || []).forEach((item) => {
      requestStatusMap.set(item.post_id, "matched");
    });
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

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">
        <h2 className="text-lg font-semibold">Recent Meetup</h2>

        <div className="space-y-4">
          {posts.map((post) => {
            const hostName = profileMap.get(post.user_id) || "Unknown";

            const myStatus =
              user && user.id !== post.user_id
                ? requestStatusMap.get(post.id) || "No request yet"
                : null;

            return (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-2xl border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm hover:shadow-md"
              >
                {/* 상단 */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-semibold">
                      {getPurposeIcon(post.meeting_purpose)}{" "}
                      {post.meeting_purpose} ·{" "}
                      {formatDuration(post.duration_minutes)}
                    </div>

                    <div className="mt-1 text-xl font-semibold">
                      {post.place_name || post.location}
                    </div>
                  </div>

                  {/* 💰 둥근 직사각형 */}
                  {post.benefit_amount && (
                    <div className="shrink-0 rounded-2xl bg-gradient-to-br from-[#f6e7b2] to-[#e8c97a] px-4 py-2 shadow text-sm font-semibold text-[#5a4a1f]">
                      🪙 {post.benefit_amount}
                    </div>
                  )}
                </div>

                {/* 하단 */}
                <div className="mt-3">
                  {/* ✅ 시간 (여기로 이동) */}
                  {post.meeting_time && (
                    <div className="text-sm text-[#6f655c]">
                      ⏰ {formatTime(post.meeting_time)}
                    </div>
                  )}

                  {post.location && (
                    <div className="mt-1 text-sm text-[#6f655c]">
                      📍 {post.location}
                    </div>
                  )}

                  <div className="mt-1 text-sm text-[#6f655c]">
                    👤 {post.target_gender || "Any"} /{" "}
                    {post.target_age_group || "Any"}
                  </div>

                  <div className="mt-2 flex justify-between text-sm text-[#6f655c]">
                    <span>🧑 {hostName}</span>

                    {myStatus && (
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${getStatusBadge(
                          myStatus
                        )}`}
                      >
                        {myStatus}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-6 rounded-full bg-[#6b5f52] px-5 py-3 text-white"
      >
        + Create
      </Link>
    </main>
  );
}