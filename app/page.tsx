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
  if (!meetingTime) return "No time set";

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

export default async function HomePage() {
  const supabase = await createClient();

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

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <div className="pb-32">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#2f2a26] sm:text-3xl">
              Recent Meetup
            </h1>
            <p className="mt-1 text-sm text-[#8a7f74]">
              Find nearby meetups that match your vibe
            </p>
          </div>

          <Link
            href="/map"
            className="shrink-0 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#927d69]"
          >
            Map View
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-[#2f2a26]">
              No meetups yet
            </div>
            <p className="mt-2 text-sm text-[#8a7f74]">
              Be the first to create one.
            </p>

            <Link
              href="/write"
              className="mt-5 inline-flex rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              + Create Meetup
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
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
                  className="block rounded-[28px] border border-[#e7ddd2] bg-white p-5 shadow-[0_6px_18px_rgba(80,60,40,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgba(80,60,40,0.10)] sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-[#5f5449]">
                        <span>{getPurposeIcon(post.meeting_purpose)}</span>
                        <span>{post.meeting_purpose || "Meetup"}</span>
                        {formatDuration(post.duration_minutes) && (
                          <span className="text-[#8b7f74]">
                            · {formatDuration(post.duration_minutes)}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 line-clamp-2 text-[28px] font-bold leading-[1.1] tracking-[-0.03em] text-[#2f2a26] sm:text-[34px]">
                        {post.place_name || post.location || "No place"}
                      </div>
                    </div>

                    {post.benefit_amount && (
                      <div className="shrink-0 rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-4 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                        🪙 ${Number(post.benefit_amount).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2.5 text-[15px] text-[#766c62]">
                    <div className="flex items-center gap-2">
                      <span>⏰</span>
                      <span>{formatTime(post.meeting_time)}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <span className="mt-[1px]">📍</span>
                      <span className="line-clamp-1">
                        {post.location || "No address"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span>👤</span>
                      <span>
                        {post.target_gender || "Any"} /{" "}
                        {post.target_age_group || "Any"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex min-w-0 items-center gap-2">
                        <span>🧑</span>
                        <span className="truncate">{hostName}</span>
                      </div>

                      {myStatus && (
                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
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
        )}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-5 z-40 rounded-full bg-[#6b5f52] px-6 py-4 text-base font-semibold text-white shadow-[0_10px_24px_rgba(80,60,40,0.22)] transition hover:bg-[#5f5449]"
      >
        + Create
      </Link>
    </main>
  );
}