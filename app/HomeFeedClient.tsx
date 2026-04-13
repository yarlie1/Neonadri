"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  MapPin,
  UserRound,
  UserCircle2,
  Plus,
  ArrowUpRight,
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
  SlidersHorizontal,
  RotateCcw,
  ChevronDown,
  LocateFixed,
  Coins,
  Sparkles,
  HeartHandshake,
  Search,
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
  latitude: number | null;
  longitude: number | null;
};

type HostProfileMap = Record<
  string,
  {
    displayName: string;
    gender: string;
    ageGroup: string;
  }
>;

type MatchSummaryMap = Record<
  number,
  {
    isMatched: boolean;
    pendingRequestCount: number;
    totalRequestCount: number;
  }
>;

const PURPOSE_OPTIONS = [
  "All",
  "Coffee",
  "Meal",
  "Dessert",
  "Walk",
  "Jogging",
  "Yoga",
  "Movie",
  "Theater",
  "Karaoke",
  "Board Games",
  "Gaming",
  "Bowling",
  "Arcade",
  "Study",
  "Work Together",
  "Work",
  "Book Talk",
  "Book",
  "Photo Walk",
  "Photo",
];

const GENDER_OPTIONS = ["All", "Male", "Female", "Other", "Prefer not to say"];
const AGE_GROUP_OPTIONS = ["All", "20s", "30s", "40s", "50s+"];
const MATCH_STATE_OPTIONS = ["All", "Open", "Matched"];
const AUDIENCE_OPTIONS = ["All", "Fits me"] as const;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "soonest", label: "Soonest" },
  { value: "benefit_desc", label: "Highest Benefit" },
  { value: "benefit_asc", label: "Lowest Benefit" },
  { value: "distance", label: "Nearest" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function getPurposeIcon(purpose: string | null, className?: string) {
  const iconClassName = className || "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

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
      return <MapPin className={iconClassName} />;
  }
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
}

function formatTime(meetingTime: string | null) {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getPostStatus(meetingTime: string | null) {
  if (!meetingTime) return "Upcoming";
  return new Date(meetingTime).getTime() >= Date.now() ? "Upcoming" : "Expired";
}

function getPurposeTheme(purpose: string | null) {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return {
        pillClass: "bg-[#f7eadf] text-[#9a6248]",
        bandClass:
          "bg-[linear-gradient(135deg,#8b5e4a_0%,#c98b67_100%)] text-white",
      };
    case "Meal":
    case "Dessert":
      return {
        pillClass: "bg-[#f6ebdf] text-[#8f6a3a]",
        bandClass:
          "bg-[linear-gradient(135deg,#9f7440_0%,#d5a15a_100%)] text-white",
      };
    case "Walk":
    case "Jogging":
    case "Yoga":
      return {
        pillClass: "bg-[#eaf4ea] text-[#4f8a54]",
        bandClass:
          "bg-[linear-gradient(135deg,#5d8c5f_0%,#87b377_100%)] text-white",
      };
    case "Movie":
    case "Theater":
    case "Karaoke":
      return {
        pillClass: "bg-[#eee7f6] text-[#6f5a92]",
        bandClass:
          "bg-[linear-gradient(135deg,#5d4f7d_0%,#8c75b6_100%)] text-white",
      };
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return {
        pillClass: "bg-[#efe8ff] text-[#6a5ea5]",
        bandClass:
          "bg-[linear-gradient(135deg,#64508a_0%,#8f73c6_100%)] text-white",
      };
    case "Study":
    case "Book Talk":
    case "Book":
      return {
        pillClass: "bg-[#e8f0fb] text-[#5e79a6]",
        bandClass:
          "bg-[linear-gradient(135deg,#4e5f84_0%,#6d8fb8_100%)] text-white",
      };
    case "Work Together":
    case "Work":
      return {
        pillClass: "bg-[#ece8e3] text-[#6d6258]",
        bandClass:
          "bg-[linear-gradient(135deg,#4f4640_0%,#847467_100%)] text-white",
      };
    case "Photo Walk":
    case "Photo":
      return {
        pillClass: "bg-[#f9e8e5] text-[#9a5f57]",
        bandClass:
          "bg-[linear-gradient(135deg,#8e5f5b_0%,#c8827f_100%)] text-white",
      };
    default:
      return {
        pillClass: "bg-[#f8efe8] text-[#9a6f5f]",
        bandClass:
          "bg-[linear-gradient(135deg,#2f2a26_0%,#5a4d45_100%)] text-white",
      };
  }
}

function getMatchBadge(post: PostRow, summary?: MatchSummaryMap[number]) {
  const isExpired = getPostStatus(post.meeting_time) === "Expired";
  const requestCount = summary?.pendingRequestCount ?? summary?.totalRequestCount ?? 0;

  if (summary?.isMatched) {
    return {
      label: "Matched / confirmed",
      className: "bg-[#efe7dc] text-[#6b5f52]",
    };
  }

  if (isExpired) {
    return {
      label: "Expired / closed",
      className: "bg-[#e6ddd4] text-[#8b7f74]",
    };
  }

  return {
    label:
      requestCount > 0
        ? `Open / ${requestCount} request${requestCount === 1 ? "" : "s"}`
        : "Open / no requests yet",
    className: "bg-[#eef7ee] text-[#4f8a54]",
  };
}

function parseBenefitAmount(value: string | null) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

function getSortSummaryLabel(sort: SortValue) {
  switch (sort) {
    case "soonest":
      return "Soonest";
    case "benefit_desc":
      return "High $";
    case "benefit_asc":
      return "Low $";
    case "distance":
      return "Nearest";
    default:
      return "";
  }
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistanceKm(km: number | null) {
  if (km === null || !Number.isFinite(km)) return "";
  if (km < 1) return `${(km * 1000).toFixed(0)} m away`;
  return `${km.toFixed(1)} km away`;
}

function getPurposeLabel(purpose: string | null) {
  if (!purpose) return "Open meetup";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return "Easy conversation";
    case "Meal":
      return "Sit down and connect";
    case "Dessert":
      return "Sweet and casual";
    case "Walk":
    case "Jogging":
    case "Yoga":
      return "Move together";
    case "Movie":
    case "Theater":
    case "Karaoke":
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return "Shared fun";
    case "Study":
    case "Work Together":
    case "Work":
    case "Book Talk":
    case "Book":
      return "Focus session";
    case "Photo Walk":
    case "Photo":
      return "Creative hangout";
    default:
      return "Meet someone new";
  }
}

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
      }`}
    >
      {label}
    </button>
  );
}

function FilterSummaryText({
  matchState,
  audience,
  purpose,
  gender,
  ageGroup,
  sort,
}: {
  matchState: string;
  audience: string;
  purpose: string;
  gender: string;
  ageGroup: string;
  sort: SortValue;
}) {
  const parts: string[] = [];

  if (matchState !== "All") parts.push(matchState);
  if (audience !== "All") parts.push(audience);
  if (purpose !== "All") parts.push(purpose);
  if (gender !== "All") parts.push(gender);
  if (ageGroup !== "All") parts.push(ageGroup);
  if (sort !== "newest") {
    const label = getSortSummaryLabel(sort);
    if (label) parts.push(label);
  }

  if (parts.length === 0) {
    return <span className="text-sm text-[#8b7f74]">All filters</span>;
  }

  return (
    <span className="text-sm font-medium text-[#5a5149]">
      {parts.join(" / ")}
    </span>
  );
}

export default function HomeFeedClient({
  initialPosts,
  hostProfileMap,
  matchSummaryMap,
  viewerPreference,
}: {
  initialPosts: PostRow[];
  hostProfileMap: HostProfileMap;
  matchSummaryMap: MatchSummaryMap;
  viewerPreference: { gender: string; ageGroup: string } | null;
}) {
  const [matchState, setMatchState] = useState("All");
  const [audience, setAudience] = useState<(typeof AUDIENCE_OPTIONS)[number]>("All");
  const [purpose, setPurpose] = useState("All");
  const [gender, setGender] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All");
  const [sort, setSort] = useState<SortValue>("newest");
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterPinned, setIsFilterPinned] = useState(false);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "unavailable"
  >("idle");

  useEffect(() => {
    if (sort !== "distance") return;
    if (userLocation || locationStatus === "loading") return;
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }

    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationStatus("granted");
      },
      () => {
        setLocationStatus("denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }, [sort, userLocation, locationStatus]);

  useEffect(() => {
    const handleScroll = () => {
      if (!filterRef.current) return;
      setIsFilterPinned(filterRef.current.getBoundingClientRect().top <= 64);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const posts = useMemo(() => {
    let next = initialPosts.filter((post) => {
      const isMatched = !!matchSummaryMap[post.id]?.isMatched;
      const matchStateMatch =
        matchState === "All" ||
        (matchState === "Matched" && isMatched) ||
        (matchState === "Open" && !isMatched);
      const purposeMatch = purpose === "All" || post.meeting_purpose === purpose;
      const genderMatch = gender === "All" || post.target_gender === gender;
      const ageGroupMatch =
        ageGroup === "All" || post.target_age_group === ageGroup;

      return matchStateMatch && purposeMatch && genderMatch && ageGroupMatch;
    });

    next = [...next].sort((a, b) => {
      const aExpired = getPostStatus(a.meeting_time) === "Expired" ? 1 : 0;
      const bExpired = getPostStatus(b.meeting_time) === "Expired" ? 1 : 0;

      if (aExpired !== bExpired) return aExpired - bExpired;

      if (sort === "newest") {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }

      if (sort === "benefit_desc") {
        return (
          (parseBenefitAmount(b.benefit_amount) ?? -1) -
          (parseBenefitAmount(a.benefit_amount) ?? -1)
        );
      }

      if (sort === "benefit_asc") {
        return (
          (parseBenefitAmount(a.benefit_amount) ?? Number.MAX_SAFE_INTEGER) -
          (parseBenefitAmount(b.benefit_amount) ?? Number.MAX_SAFE_INTEGER)
        );
      }

      if (sort === "distance") {
        const aHasCoords = a.latitude !== null && a.longitude !== null;
        const bHasCoords = b.latitude !== null && b.longitude !== null;

        const aDistance =
          userLocation && aHasCoords
            ? haversineKm(
                userLocation.lat,
                userLocation.lng,
                a.latitude!,
                a.longitude!
              )
            : Number.MAX_SAFE_INTEGER;

        const bDistance =
          userLocation && bHasCoords
            ? haversineKm(
                userLocation.lat,
                userLocation.lng,
                b.latitude!,
                b.longitude!
              )
            : Number.MAX_SAFE_INTEGER;

        if (aDistance !== bDistance) return aDistance - bDistance;

        const aTime = a.meeting_time ? new Date(a.meeting_time).getTime() : 0;
        const bTime = b.meeting_time ? new Date(b.meeting_time).getTime() : 0;
        return aTime - bTime;
      }

      const aTime = a.meeting_time ? new Date(a.meeting_time).getTime() : 0;
      const bTime = b.meeting_time ? new Date(b.meeting_time).getTime() : 0;
      return aTime - bTime;
    });

    return next;
  }, [initialPosts, matchState, purpose, gender, ageGroup, sort, userLocation, matchSummaryMap]);

  const upcomingCount = useMemo(
    () =>
      initialPosts.filter(
        (post) => getPostStatus(post.meeting_time) === "Upcoming"
      ).length,
    [initialPosts]
  );

  const hostCount = useMemo(
    () => Object.keys(hostProfileMap).length,
    [hostProfileMap]
  );

  const highlightedPost = posts[0] || null;

  const applyAndClose = (fn: () => void) => {
    fn();
    setIsOpen(false);
  };

  const applyAudience = (option: (typeof AUDIENCE_OPTIONS)[number]) => {
    setAudience(option);

    if (option === "All") {
      setGender("All");
      setAgeGroup("All");
      return;
    }

    setGender(viewerPreference?.gender || "All");
    setAgeGroup(viewerPreference?.ageGroup || "All");
  };

  const resetAll = () => {
    setMatchState("All");
    setAudience("All");
    setPurpose("All");
    setGender("All");
    setAgeGroup("All");
    setSort("newest");
    setIsOpen(false);
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f9efe4_38%,#f7f1ea_100%)] px-4 py-4 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-4 pb-24">
        <section className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f6d8cb_38%,#e9b7a6_100%)] px-5 py-6 text-[#2a211d] shadow-[0_24px_60px_rgba(120,76,52,0.16)] sm:px-6 sm:py-7">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#7b3f31]/10 blur-2xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
              <Sparkles className="h-3.5 w-3.5" />
              Social meetups near you
            </div>

            <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#2b1f1a] sm:text-[40px]">
              Meet someone new without the awkward start.
            </h1>

            <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f453b] sm:text-[15px]">
              Browse warm, low-pressure meetups around you. Coffee, walks,
              study sessions, game nights. Pick a mood and step in.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5">
              <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                  Live now
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2b1f1a]">
                  {upcomingCount}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                  Hosts
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2b1f1a]">
                  {hostCount}
                </div>
              </div>

              <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                  Mood
                </div>
                <div className="mt-1 text-sm font-bold leading-5 text-[#2b1f1a]">
                  Cozy
                  <br />
                  Local
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                Coffee chats
              </span>
              <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                Walk dates
              </span>
              <span className="rounded-full border border-white/70 bg-white/65 px-3 py-2 text-xs font-medium text-[#6a4b40]">
                Game nights
              </span>
            </div>
          </div>
        </section>

        {highlightedPost && (
          <section className="overflow-hidden rounded-[28px] border border-[#eadfd2] bg-[#fffaf6] shadow-[0_16px_40px_rgba(92,69,52,0.08)]">
            <div className="border-b border-[#f0e5db] px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                    <HeartHandshake className="h-3.5 w-3.5" />
                    Featured vibe
                  </div>
                  <div className="mt-1 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
                    {highlightedPost.place_name || highlightedPost.location || "Meetup"}
                  </div>
                </div>

                <Link
                  href={`/posts/${highlightedPost.id}`}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d9c9bc] bg-[#fff6ee] text-[#6f5649] shadow-sm transition hover:bg-[#f7eadf]"
                  aria-label="Open featured meetup"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1.4fr_1fr]">
              <div className="rounded-[24px] bg-[linear-gradient(135deg,#382a25_0%,#805448_100%)] px-4 py-4 text-white">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/90">
                  {getPurposeIcon(highlightedPost.meeting_purpose)}
                  {highlightedPost.meeting_purpose || "Meetup"}
                </div>

                <div className="mt-4 text-2xl font-black leading-[1.02] tracking-[-0.04em]">
                  {getPurposeLabel(highlightedPost.meeting_purpose)}
                </div>

                <div className="mt-2 text-sm leading-6 text-white/75">
                  Low-pressure social energy with a clear plan, time, and place.
                </div>
              </div>

              <div className="space-y-2.5 rounded-[24px] border border-[#efe2d7] bg-white px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-[#5a5149]">
                  <Clock3 className="h-4 w-4 text-[#a27767]" />
                  <span>{formatTime(highlightedPost.meeting_time) || "Time TBD"}</span>
                </div>

                <div className="flex min-w-0 items-start gap-2 text-sm text-[#5a5149]">
                  <MapPin className="mt-0.5 h-4 w-4 text-[#a27767]" />
                  <span className="block min-w-0 flex-1 break-words line-clamp-2">
                    {highlightedPost.location || highlightedPost.place_name || "Location TBD"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#5a5149]">
                  <Search className="h-4 w-4 text-[#a27767]" />
                  <span>
                    {highlightedPost.target_gender || "Any"} /{" "}
                    {highlightedPost.target_age_group || "Any"}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        <div
          ref={filterRef}
          className={`sticky top-16 z-20 rounded-[24px] transition ${
            isFilterPinned
              ? "border border-[#eadfd3] bg-[#fffdf9] shadow-[0_10px_24px_rgba(92,69,52,0.1)]"
              : "border border-[#eadfd3] bg-[#fffaf5] shadow-none"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2f2a26]">
                <SlidersHorizontal className="h-4 w-4" />
                Shape your mood
              </div>

              <div className="mt-2">
                <FilterSummaryText
                  matchState={matchState}
                  audience={audience}
                  purpose={purpose}
                  gender={gender}
                  ageGroup={ageGroup}
                  sort={sort}
                />
              </div>
            </div>

              <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7ddd2] bg-[#fff7ef] text-[#6b5f52] transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
              <ChevronDown className="h-4 w-4" />
            </span>
          </button>

          {isOpen && (
            <div className="max-h-[calc(100vh-14rem)] overflow-y-auto border-t border-[#efe6db] px-4 py-4 pb-28">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {MATCH_STATE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      active={matchState === option}
                      label={option}
                      onClick={() => applyAndClose(() => setMatchState(option))}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Audience
                </div>
                <div className="flex flex-wrap gap-2">
                  {AUDIENCE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      active={audience === option}
                      label={option}
                      onClick={() => applyAndClose(() => applyAudience(option))}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Purpose
                </div>
                <div className="flex flex-wrap gap-2">
                  {PURPOSE_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      active={purpose === option}
                      label={option}
                      onClick={() => applyAndClose(() => setPurpose(option))}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Gender
                </div>
                <div className="flex flex-wrap gap-2">
                  {GENDER_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      active={gender === option}
                      label={option}
                      onClick={() =>
                        applyAndClose(() => {
                          setAudience("All");
                          setGender(option);
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Age Group
                </div>
                <div className="flex flex-wrap gap-2">
                  {AGE_GROUP_OPTIONS.map((option) => (
                    <FilterPill
                      key={option}
                      active={ageGroup === option}
                      label={option}
                      onClick={() =>
                        applyAndClose(() => {
                          setAudience("All");
                          setAgeGroup(option);
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
                  Sort
                </div>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <FilterPill
                      key={option.value}
                      active={sort === option.value}
                      label={option.label}
                      onClick={() => applyAndClose(() => setSort(option.value))}
                    />
                  ))}
                </div>

                {sort === "distance" && (
                  <div className="mt-3 text-xs text-[#8b7f74]">
                    {locationStatus === "loading" && "Getting your location..."}
                    {locationStatus === "denied" &&
                      "Location permission denied. Nearest sort may not be accurate."}
                    {locationStatus === "unavailable" &&
                      "Location is unavailable on this device/browser."}
                    {locationStatus === "granted" &&
                      "Using your current location."}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9b8f84]">
              Discover
            </div>
            <div className="mt-1 text-xl font-black tracking-[-0.04em] text-[#2f2a26]">
              Nearby social moments
            </div>
          </div>

          <div className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-[#7a6b61] shadow-sm">
            {posts.length} results
          </div>
        </div>

        {posts.map((post) => {
          const amount = parseBenefitAmount(post.benefit_amount);
          const host = hostProfileMap[post.user_id] || {
            displayName: "Unknown",
            gender: "",
            ageGroup: "",
          };
          const status = getPostStatus(post.meeting_time);
          const isExpired = status === "Expired";
          const matchBadge = getMatchBadge(post, matchSummaryMap[post.id]);
          const purposeTheme = getPurposeTheme(post.meeting_purpose);

          const distanceText =
            sort === "distance" &&
            userLocation &&
            post.latitude !== null &&
            post.longitude !== null
              ? formatDistanceKm(
                  haversineKm(
                    userLocation.lat,
                    userLocation.lng,
                    post.latitude,
                    post.longitude
                  )
                )
              : "";

          return (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className={`block overflow-hidden rounded-[28px] border p-4 shadow-[0_14px_32px_rgba(92,69,52,0.08)] transition active:scale-[0.995] ${
                isExpired
                  ? "border-[#ddd2c5] bg-[#f3eee8] opacity-80"
                  : "border-[#e7ddd2] bg-white hover:-translate-y-0.5 hover:bg-[#fffdf9]"
              }`}
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.02em] ${matchBadge.className}`}
                >
                  {matchBadge.label}
                </div>

                <div className="min-w-0 rounded-full border border-[#e7ddd2] bg-[#faf3ec] px-3 py-1.5 text-right">
                  <div className="hidden text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71] sm:block">
                    Hosted by
                  </div>
                  <div className="truncate text-[12px] font-medium text-[#6a5e54]">
                    {host.displayName}
                  </div>
                </div>
              </div>

              <div className="rounded-[22px] border border-[#f1e4d8] bg-[linear-gradient(180deg,#fffdfa_0%,#fcfaf7_100%)] p-3">
                <div className="flex items-stretch gap-2">
                  <div
                    className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 ${purposeTheme.bandClass}`}
                  >
                    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/18">
                      {getPurposeIcon(
                        post.meeting_purpose,
                        "h-[19px] w-[19px] shrink-0 text-white"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-white/95">
                        {post.meeting_purpose || "Social meetup"}
                      </div>
                    </div>
                  </div>

                  {formatDuration(post.duration_minutes) ? (
                    <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[#f4ece4] px-1.5 py-2 text-[#4f443b]">
                      <Clock3 className="h-4 w-4" />
                      <span className="mt-1 text-sm font-semibold">
                        {formatDuration(post.duration_minutes)}
                      </span>
                    </div>
                  ) : null}

                  {amount !== null && (
                    <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[16px] bg-[linear-gradient(135deg,#ffe5b6_0%,#ffd18e_100%)] px-1.5 py-2 text-[#6e4715] shadow-sm">
                      <Coins className="h-4 w-4 shrink-0" />
                      <span className="mt-1 text-sm font-semibold">
                        +${amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 grid gap-2 text-[#7d7268] sm:grid-cols-2">
                  {post.meeting_time && (
                    <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                      <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                      <div className="min-w-0 leading-[1.2]">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">When</div>
                        <div className="truncate text-[12px] font-medium text-[#554a42]">{formatTime(post.meeting_time)}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex min-w-0 items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                    <div className="min-w-0 leading-[1.2]">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Place</div>
                      <div className="block truncate text-[12px] font-medium text-[#554a42]">{post.place_name || post.location || "No place"}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                    <UserCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                    <div className="min-w-0 leading-[1.2]">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Hosted by</div>
                      <div className="truncate text-[12px] font-medium text-[#554a42]">
                        {host.displayName}
                        {(host.gender || host.ageGroup)
                          ? ` - ${host.gender || "Unknown"}${host.ageGroup ? ` / ${host.ageGroup}` : ""}`
                          : ""}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                    <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                    <div className="min-w-0 leading-[1.2]">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Looking for</div>
                      <div className="truncate text-[12px] font-medium text-[#554a42]">{post.target_gender || "Any"} / {post.target_age_group || "Any"}</div>
                    </div>
                  </div>

                  {distanceText && (
                    <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2 sm:col-span-2">
                      <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                      <div className="leading-[1.2]">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Distance</div>
                        <div className="text-[12px] font-medium text-[#554a42]">{distanceText}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {posts.length === 0 && (
          <div className="rounded-[28px] border border-[#eadfd3] bg-white px-6 py-12 text-center text-[#8b7f74] shadow-sm">
            No meetups found.
          </div>
        )}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#2e2420_0%,#a36c5a_100%)] text-white shadow-[0_18px_34px_rgba(80,60,40,0.28)] transition hover:scale-[1.02]"
        aria-label="Create meetup"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}

