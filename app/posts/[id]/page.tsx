import { createClient } from "../../../lib/supabase/server";
import MatchRequestBox from "./MatchRequestBox";
import Link from "next/link";
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
  FileText,
  ArrowLeft,
  Map,
} from "lucide-react";

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
  const className = "h-5 w-5 shrink-0 text-[#7b7067]";

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
      return <MapPin className={className} />;
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

const parseBenefitAmount = (value: string | null) => {
  if (!value) return null;

  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);

  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
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
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-10 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center shadow-sm">
          <div className="text-lg font-semibold">Meetup not found</div>
        </div>
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

  const amount = parseBenefitAmount(post.benefit_amount);
  const durationText = formatDuration(post.duration_minutes);
  const placeText = post.place_name || post.location || "No place";

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-4 space-y-4">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
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

            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="truncate">🧑 {ownerName}</span>

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
                className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                <Map className="h-4 w-4" />
                Open Map
              </a>
            )}

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-5 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-[#2f2a26]">Host Information</h2>

          <div className="mt-4 space-y-3 text-sm text-[#6f655c]">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
              <span className="font-medium text-[#2f2a26]">{ownerName}</span>
            </div>

            {(ownerGender || ownerAgeGroup) && (
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                <span>
                  {ownerGender || "Unknown"}{" "}
                  {ownerGender && ownerAgeGroup ? "/" : ""}
                  {ownerAgeGroup || ""}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2">
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
              <span>{ownerBio || "No profile introduction yet."}</span>
            </div>
          </div>
        </div>

        {post.user_id && user && user.id !== post.user_id && !isMatched && (
          <MatchRequestBox postId={post.id} postOwnerUserId={post.user_id} />
        )}

        <div className="text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}