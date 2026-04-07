import Link from "next/link";
import { createClient } from "../lib/supabase/server";
import {
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
  Clock3,
  MapPin,
  UserRound,
  Coins,
} from "lucide-react";

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
  const className = "h-5 w-5 shrink-0 text-[#7b7067]";

  switch (purpose) {
    case "Coffee":
    case "Coffee Chat":
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
      return <MapPin className={className} />;
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

const parseBenefitAmount = (value: string | null) => {
  if (!value) return null;

  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);

  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
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
      <div className="mx-auto max-w-2xl px-4 pb-40 pt-4">
        <div className="mb-5 flex justify-end">
          <Link
            href="/map"
            className="inline-flex items-center whitespace-nowrap rounded-full border border-[#dccfc2] bg-white px-5 py-2.5 text-sm font-medium text-[#5a5149]"
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
          <div className="space-y-4">
            {posts.map((post) => {
              const hostName = profileMap.get(post.user_id) || "Unknown";
              const myStatus =
                user && user.id !== post.user_id
                  ? requestStatusMap.get(post.id) || "No request yet"
                  : null;

              const amount = parseBenefitAmount(post.benefit_amount);
              const durationText = formatDuration(post.duration_minutes);
              const placeText = post.place_name || post.location || "No place";

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate text-[24px] font-extrabold text-[#2f2a26] sm:text-[26px]">
                        {getPurposeIcon(post.meeting_purpose)}
                        <span className="truncate">
                          {post.meeting_purpose || "Meetup"}
                        </span>
                        {durationText ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[#2f2a26]">
                            <Clock3 className="h-5 w-5" />
                            {durationText}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-[2px] flex items-center gap-2 truncate text-[24px] font-extrabold text-[#8a7f74] sm:text-[26px]">
                        <MapPin className="h-5 w-5 shrink-0 text-[#8a7f74]" />
                        <span className="truncate">{placeText}</span>
                      </div>
                    </div>

                    {amount !== null && (
                      <div className="shrink-0 rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-4 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Coins className="h-4 w-4" />
                          ${amount.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#766c62]">
                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>{formatTime(post.meeting_time)}</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span className="line-clamp-1">
                        {post.location || "No address"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>
                        {post.target_gender || "Any"} /{" "}
                        {post.target_age_group || "Any"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <span className="truncate">🧑 {hostName}</span>

                      {myStatus && (
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${getStatusBadge(
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
        className="fixed bottom-8 right-5 rounded-full bg-[#6b5f52] px-6 py-4 text-white shadow-lg"
      >
        + Create
      </Link>
    </main>
  );
}