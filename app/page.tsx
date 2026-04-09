import Link from "next/link";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  Coins,
  Star,
  Plus,
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
  gender: string | null;
  age_group: string | null;
};

type ProfileStatsRow = {
  average_rating?: number | null;
  review_count?: number | null;
};

type HostStatMap = Record<
  string,
  {
    averageRating: number;
    reviewCount: number;
  }
>;

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

const getPurposeIcon = (purpose: string | null) => {
  const className = "h-[20px] w-[20px] shrink-0 text-[#7e746b]";

  switch (purpose) {
    case "Coffee":
      return <Coffee className={className} />;
    case "Meal":
      return <UtensilsCrossed className={className} />;
    case "Dessert":
      return <CakeSlice className={className} />;
    case "Walk":
      return <Footprints className={className} />;
    case "Movie":
      return <Clapperboard className={className} />;
    case "Karaoke":
      return <Mic2 className={className} />;
    case "Study":
      return <BookOpen className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

const formatDuration = (m: number | null) => {
  if (!m) return "";
  if (m === 60) return "1h";
  if (m === 90) return "1.5h";
  if (m === 120) return "2h";
  return `${m}m`;
};

const formatTime = (t: string | null) => {
  if (!t) return "";
  const d = new Date(t);
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getStatus = (t: string | null) => {
  if (!t) return "Upcoming";
  return new Date(t).getTime() >= Date.now() ? "Upcoming" : "Expired";
};

const parseAmount = (v: string | null) => {
  if (!v) return null;
  const num = Number(v.replace(/[^0-9]/g, ""));
  return Number.isNaN(num) ? null : num;
};

function StarInline({ v, c }: { v: number; c: number }) {
  return (
    <div className="flex items-center gap-1 text-[12px] text-[#6b5f52]">
      ★ {v.toFixed(1)} ({c})
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data } = await supabase.from("posts").select("*");

  const posts = (data || []) as PostRow[];

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-4">
      <div className="mx-auto max-w-2xl space-y-3 pb-24">
        {posts.map((post) => {
          const amount = parseAmount(post.benefit_amount);
          const status = getStatus(post.meeting_time);

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block rounded-[24px] border border-[#e7ddd2] bg-white p-4 shadow-sm active:scale-[0.99]"
            >
              <div className="flex justify-between gap-3">
                <div className="flex-1">

                  {/* 🔥 첫째줄 (확대) */}
                  <div className="flex items-center gap-2 text-[28px] leading-[1.15] font-extrabold text-[#2f2a26]">
                    {getPurposeIcon(post.meeting_purpose)}
                    <span>{post.meeting_purpose}</span>
                    <span className="flex items-center gap-1 text-[24px] font-bold">
                      <Clock3 className="h-5 w-5" />
                      {formatDuration(post.duration_minutes)}
                    </span>
                  </div>

                  {/* 🔥 둘째줄 (확대) */}
                  <div className="mt-2 flex items-center gap-2 text-[24px] font-bold text-[#2f2a26]">
                    <MapPin className="h-5 w-5 text-[#8a7f74]" />
                    <span>{post.place_name}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {amount && (
                    <div className="rounded-full bg-yellow-300 px-3 py-1 font-bold">
                      ${amount}
                    </div>
                  )}
                  <div className="text-sm">{status}</div>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-500 space-y-1">
                <div>{formatTime(post.meeting_time)}</div>
                <div>{post.location}</div>
                <div>
                  {post.target_gender} / {post.target_age_group}
                </div>
              </div>

              <div className="mt-3 border rounded-lg p-3 flex justify-between">
                <div>{post.user_id}</div>
                <StarInline v={5} c={2} />
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-[#a48f7a] text-white flex items-center justify-center text-2xl"
      >
        <Plus />
      </Link>
    </main>
  );
}