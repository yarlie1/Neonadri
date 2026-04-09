import Link from "next/link";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  Coins,
  Star,
  Plus,
} from "lucide-react";
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

type ProfileStatsRow = {
  average_rating?: number | null;
  review_count?: number | null;
  completed_meetups?: number | null;
};

type HostStatMap = Record<
  string,
  {
    averageRating: number;
    reviewCount: number;
    completedMeetups: number;
  }
>;

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

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getPostStatus = (meetingTime: string | null) => {
  if (!meetingTime) return "Upcoming";
  return new Date(meetingTime).getTime() >= Date.now() ? "Upcoming" : "Expired";
};

const parseBenefitAmount = (value: string | null) => {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
};

function StarRatingInline({
  value,
  count,
}: {
  value: number;
  count: number;
}) {
  const rounded = Math.round(value);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-[#f4ece4] px-2.5 py-1 text-xs text-[#6b5f52]">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${
              n <= rounded
                ? "fill-[#a48f7a] text-[#a48f7a]"
                : "text-[#d8cec3]"
            }`}
          />
        ))}
      </div>
      <span className="font-medium">{value.toFixed(1)}</span>
      <span className="text-[#8b7f74]">({count})</span>
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
    )
    .order("meeting_time", { ascending: true });

  if (postsError) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <div className="text-lg font-semibold">Could not load home</div>
          <div className="mt-2 text-sm text-[#8b7f74]">{postsError.message}</div>
        </div>
      </main>
    );
  }

  const posts = ((postsData as PostRow[]) || []).sort((a, b) => {
    const aUpcoming = getPostStatus(a.meeting_time) === "Upcoming" ? 0 : 1;
    const bUpcoming = getPostStatus(b.meeting_time) === "Upcoming" ? 0 : 1;

    if (aUpcoming !== bUpcoming) return aUpcoming - bUpcoming;

    const aTime = a.meeting_time ? new Date(a.meeting_time).getTime() : 0;
    const bTime = b.meeting_time ? new Date(b.meeting_time).getTime() : 0;
    return aTime - bTime;
  });

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id))).filter(Boolean);

  let profileMap: Record<string, string> = {};
  let hostStatsMap: HostStatMap = {};

  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    profileMap = {};
    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap[profile.id] = profile.display_name || "Unknown";
    });

    const statsResults = await Promise.all(
      ownerIds.map(async (ownerId) => {
        const { data } = await supabase.rpc("get_profile_stats", {
          p_user_id: ownerId,
        });

        const stats = (data || {}) as ProfileStatsRow;

        return {
          ownerId,
          stats: {
            averageRating: Number(stats.average_rating ?? 0),
            reviewCount: Number(stats.review_count ?? 0),
            completedMeetups: Number(stats.completed_meetups ?? 0),
          },
        };
      })
    );

    hostStatsMap = {};
    statsResults.forEach(({ ownerId, stats }) => {
      hostStatsMap[ownerId] = stats;
    });
  }

  const upcomingCount = posts.filter(
    (post) => getPostStatus(post.meeting_time) === "Upcoming"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-[#fffaf5] px-6 py-5 shadow-sm">
          <div className="text-[11px] tracking-[0.28em] text-[#9b8f84]">
            NEONADRI
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2f2a26] sm:text-[34px]">
                Discover Meetups
              </h1>
              <p className="mt-1 text-sm text-[#6f655c]">
                Browse upcoming meetups and see host trust signals before you join.
              </p>
            </div>

            <Link
              href="/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[24px] border border-[#e7ddd2] bg-white p-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">All Meetups</div>
            <div className="mt-2 text-[34px] font-extrabold leading-none">
              {posts.length}
            </div>
          </div>

          <div className="rounded-[24px] border border-[#e7ddd2] bg-white p-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">Upcoming</div>
            <div className="mt-2 text-[34px] font-extrabold leading-none">
              {upcomingCount}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {posts.map((post) => {
            const amount = parseBenefitAmount(post.benefit_amount);
            const ownerName = profileMap[post.user_id] || "Unknown";
            const hostStats = hostStatsMap[post.user_id] || {
              averageRating: 0,
              reviewCount: 0,
              completedMeetups: 0,
            };
            const status = getPostStatus(post.meeting_time);

            return (
              <div
                key={post.id}
                className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 truncate text-[22px] font-extrabold text-[#2f2a26] sm:text-[24px]">
                      <span>{getPurposeIcon(post.meeting_purpose)}</span>
                      <span className="truncate">{post.meeting_purpose || "Meetup"}</span>
                      {formatDuration(post.duration_minutes) ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-[#2f2a26]">
                          <Clock3 className="h-4 w-4" />
                          {formatDuration(post.duration_minutes)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-[2px] flex items-center gap-2 truncate text-[22px] font-extrabold text-[#8a7f74] sm:text-[24px]">
                      <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span className="truncate">
                        {post.place_name || post.location || "No place"}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full border border-[#dccfc2] bg-[#efe7dc] px-3 py-1 text-xs font-medium text-[#6b5f52]">
                      {status}
                    </span>

                    {amount !== null && (
                      <div className="rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-4 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Coins className="h-4 w-4" />
                          ${amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#766c62]">
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

                <div className="mt-5 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                      href={`/profile/${post.user_id}`}
                      className="inline-flex items-center gap-2 rounded-full px-1 py-1 font-medium text-[#5a5149] transition hover:bg-[#f4ece4] hover:text-[#2f2a26]"
                    >
                      <UserCircle2 className="h-5 w-5 text-[#8a7f74]" />
                      <span>{ownerName}</span>
                    </Link>

                    {hostStats.reviewCount > 0 ? (
                      <StarRatingInline
                        value={hostStats.averageRating}
                        count={hostStats.reviewCount}
                      />
                    ) : (
                      <div className="rounded-full bg-[#f4ece4] px-2.5 py-1 text-xs text-[#8b7f74]">
                        No reviews yet
                      </div>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-[#8b7f74]">
                    {hostStats.completedMeetups} completed meetups
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#a48f7a] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#927d69]"
                  >
                    View Meetup
                  </Link>

                  <Link
                    href={`/profile/${post.user_id}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                  >
                    View Host
                  </Link>
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
              No meetups yet.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}