"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  formatMeetingTime,
  getMeetingStatus,
  parseMeetingTime,
} from "../lib/meetingTime";
import {
  Activity,
  MapPin,
  Plus,
  Coffee,
  Utensils,
  Cake,
  Footprints,
  Smile,
  Film,
  Mic,
  Dice5,
  Gamepad2,
  BookOpen,
  Target,
  Laptop,
  Book,
  Camera,
  Sparkles,
} from "lucide-react";
import {
  FeaturedMeetupCard,
  HomeFilterCard,
  MeetupFeedCard,
} from "./homeComponents";
import {
  AGE_GROUP_OPTIONS,
  AUDIENCE_OPTIONS,
  GENDER_OPTIONS,
  MATCH_STATE_OPTIONS,
  PURPOSE_OPTIONS,
  SORT_OPTIONS,
  type SortValue,
  useHomeFeedFilters,
} from "./useHomeFeedFilters";

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

const SURFACE_CARD_CLASS =
  "rounded-[32px] border border-[#eee2d6] bg-[linear-gradient(180deg,rgba(255,253,250,0.97)_0%,rgba(250,244,237,0.94)_100%)] shadow-[0_24px_70px_rgba(86,63,44,0.12)] backdrop-blur";
const SOFT_CARD_CLASS =
  "rounded-[24px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";

function getPurposeIcon(purpose: string | null, className?: string) {
  const iconClassName = className || "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={iconClassName} />;
    case "Meal":
      return <Utensils className={iconClassName} />;
    case "Dessert":
      return <Cake className={iconClassName} />;
    case "Walk":
      return <Footprints className={iconClassName} />;
    case "Jogging":
      return <Activity className={iconClassName} />;
    case "Yoga":
      return <Smile className={iconClassName} />;
    case "Movie":
    case "Theater":
      return <Film className={iconClassName} />;
    case "Karaoke":
      return <Mic className={iconClassName} />;
    case "Board Games":
      return <Dice5 className={iconClassName} />;
    case "Gaming":
    case "Bowling":
      return <Gamepad2 className={iconClassName} />;
    case "Arcade":
      return <Target className={iconClassName} />;
    case "Study":
      return <BookOpen className={iconClassName} />;
    case "Work Together":
    case "Work":
      return <Laptop className={iconClassName} />;
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

function getPurposeTheme(purpose: string | null) {
  const baseBandClass =
    "border border-[#eadfd2] bg-[linear-gradient(180deg,#fbf5ef_0%,#f3e8dc_100%)] text-[#2f261f]";
  const baseIconWrapClass =
    "bg-[linear-gradient(180deg,#f7efe6_0%,#efe3d7_100%)] text-[#7e746b]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return {
        pillClass: "bg-[#f4ede6] text-[#7f6555]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Meal":
    case "Dessert":
      return {
        pillClass: "bg-[#f4eee5] text-[#82674b]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Walk":
    case "Jogging":
    case "Yoga":
      return {
        pillClass: "bg-[#eef0ea] text-[#64705f]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Movie":
    case "Theater":
    case "Karaoke":
      return {
        pillClass: "bg-[#efedf2] text-[#6c6278]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return {
        pillClass: "bg-[#efedf2] text-[#675f77]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Study":
    case "Book Talk":
    case "Book":
      return {
        pillClass: "bg-[#edf0f2] text-[#61707f]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Work Together":
    case "Work":
      return {
        pillClass: "bg-[#f1ece6] text-[#6f645a]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Photo Walk":
    case "Photo":
      return {
        pillClass: "bg-[#f4ece8] text-[#80625d]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    default:
      return {
        pillClass: "bg-[#f3ede7] text-[#7b665a]",
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
  }
}

function getMatchBadge(
  postStatus: "Upcoming" | "Expired",
  summary?: MatchSummaryMap[number]
) {
  const isExpired = postStatus === "Expired";
  const requestCount = summary?.pendingRequestCount ?? summary?.totalRequestCount ?? 0;

  if (summary?.isMatched) {
    return {
      label: "Matched",
      className: "bg-[#eee4d8] text-[#6f6256]",
    };
  }

  if (isExpired) {
    return {
      label: "Expired",
      className: "bg-[#ebe2d9] text-[#85786d]",
    };
  }

  return {
    label: requestCount > 0 ? `Open / ${requestCount}` : "Open",
    className: "bg-[#edf1ea] text-[#5e6f5f]",
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
  const userTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, userTimeZone) || "";

  const getPostStatus = (meetingTime: string | null) =>
    getMeetingStatus(meetingTime, userTimeZone);

  const {
    matchState,
    setMatchState,
    audience,
    setAudience,
    purpose,
    setPurpose,
    gender,
    setGender,
    ageGroup,
    setAgeGroup,
    sort,
    setSort,
    isOpen,
    setIsOpen,
    isFilterPinned,
    filterRef,
    userLocation,
    locationStatus,
    applyAndClose,
    applyAudience,
    resetAll,
  } = useHomeFeedFilters(viewerPreference);

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

        const aTime =
          parseMeetingTime(a.meeting_time, userTimeZone)?.getTime() ?? 0;
        const bTime =
          parseMeetingTime(b.meeting_time, userTimeZone)?.getTime() ?? 0;
        return aTime - bTime;
      }

      const aTime =
        parseMeetingTime(a.meeting_time, userTimeZone)?.getTime() ?? 0;
      const bTime =
        parseMeetingTime(b.meeting_time, userTimeZone)?.getTime() ?? 0;
      return aTime - bTime;
    });

    return next;
  }, [ageGroup, gender, initialPosts, matchState, matchSummaryMap, purpose, sort, userLocation, userTimeZone]);

  const upcomingCount = useMemo(
    () =>
      initialPosts.filter(
        (post) => getPostStatus(post.meeting_time) === "Upcoming"
      ).length,
    [initialPosts, userTimeZone]
  );

  const hostCount = useMemo(
    () => Object.keys(hostProfileMap).length,
    [hostProfileMap]
  );

  const highlightedPost = posts[0] || null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fffefb_0%,#fbf3eb_34%,#f2e5d8_100%)] px-4 py-5 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[36px] border border-[#ebddd0] bg-[linear-gradient(145deg,#fffdf9_0%,#f7eee6_52%,#eddaca_100%)] px-5 py-6 text-[#2a211d] shadow-[0_24px_72px_rgba(103,71,49,0.12)] sm:px-7 sm:py-8">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/45 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[#8b5f4f]/10 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8a5647] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Social meetups near you
            </div>

            <h1 className="mt-4 max-w-md text-[35px] font-black leading-[0.94] tracking-[-0.06em] text-[#241915] sm:text-[42px]">
              Meet someone new without the awkward start.
            </h1>

            <p className="mt-4 max-w-lg text-[14px] leading-6 text-[#5f453b] sm:text-[15px]">
              Browse warm, low-pressure meetups around you. Coffee, walks,
              study sessions, game nights. Pick a mood and step in.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-[24px] border border-white/70 bg-white/74 px-3 py-3.5 shadow-[0_8px_20px_rgba(115,82,61,0.06)] backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                  Live now
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2b1f1a]">
                  {upcomingCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/74 px-3 py-3.5 shadow-[0_8px_20px_rgba(115,82,61,0.06)] backdrop-blur">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                  Hosts
                </div>
                <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2b1f1a]">
                  {hostCount}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/70 bg-white/74 px-3 py-3.5 shadow-[0_8px_20px_rgba(115,82,61,0.06)] backdrop-blur">
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

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/70 bg-white/68 px-3 py-2 text-xs font-medium text-[#6a4b40] shadow-[0_4px_10px_rgba(115,82,61,0.04)]">
                Coffee chats
              </span>
              <span className="rounded-full border border-white/70 bg-white/68 px-3 py-2 text-xs font-medium text-[#6a4b40] shadow-[0_4px_10px_rgba(115,82,61,0.04)]">
                Walk dates
              </span>
              <span className="rounded-full border border-white/70 bg-white/68 px-3 py-2 text-xs font-medium text-[#6a4b40] shadow-[0_4px_10px_rgba(115,82,61,0.04)]">
                Game nights
              </span>
            </div>
          </div>
        </section>

        {highlightedPost && (
          <FeaturedMeetupCard
            postId={highlightedPost.id}
            placeLabel={highlightedPost.place_name || highlightedPost.location || "Meetup"}
            purposeIcon={getPurposeIcon(highlightedPost.meeting_purpose)}
            purposeLabel={highlightedPost.meeting_purpose || "Meetup"}
            purposeCopy={getPurposeLabel(highlightedPost.meeting_purpose)}
            timeLabel={formatTime(highlightedPost.meeting_time) || "Time TBD"}
            placeText={highlightedPost.location || highlightedPost.place_name || "Location TBD"}
            targetText={`${highlightedPost.target_gender || "Any"} / ${highlightedPost.target_age_group || "Any"}`}
          />
        )}

        <div ref={filterRef}>
          <HomeFilterCard
            isPinned={isFilterPinned}
            isOpen={isOpen}
            onToggle={() => setIsOpen((v) => !v)}
            summaryText={
              <FilterSummaryText
                matchState={matchState}
                audience={audience}
                purpose={purpose}
                gender={gender}
                ageGroup={ageGroup}
                sort={sort}
              />
            }
            matchState={matchState}
            audience={audience}
            purpose={purpose}
            gender={gender}
            ageGroup={ageGroup}
            sort={sort}
            matchStateOptions={MATCH_STATE_OPTIONS}
            audienceOptions={AUDIENCE_OPTIONS}
            purposeOptions={PURPOSE_OPTIONS}
            genderOptions={GENDER_OPTIONS}
            ageGroupOptions={AGE_GROUP_OPTIONS}
            sortOptions={SORT_OPTIONS}
            onMatchState={(option) => applyAndClose(() => setMatchState(option))}
            onAudience={(option) => applyAndClose(() => applyAudience(option as (typeof AUDIENCE_OPTIONS)[number]))}
            onPurpose={(option) => applyAndClose(() => setPurpose(option))}
            onGender={(option) =>
              applyAndClose(() => {
                setAudience("All");
                setGender(option);
              })
            }
            onAgeGroup={(option) =>
              applyAndClose(() => {
                setAudience("All");
                setAgeGroup(option);
              })
            }
            onSort={(option) => applyAndClose(() => setSort(option as SortValue))}
            onReset={resetAll}
            locationStatus={locationStatus}
          />
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

          <div className={`${SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-medium text-[#7a6b61] shadow-none`}>
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
          const matchBadge = getMatchBadge(status as "Upcoming" | "Expired", matchSummaryMap[post.id]);
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
            <MeetupFeedCard
              key={post.id}
              postId={post.id}
              isExpired={isExpired}
              hostName={host.displayName}
              hostMeta={
                host.gender || host.ageGroup
                  ? `${host.gender || "Unknown"}${host.ageGroup ? ` / ${host.ageGroup}` : ""}`
                  : ""
              }
              matchBadgeLabel={matchBadge.label}
              matchBadgeClassName={matchBadge.className}
              purposeBandClass={purposeTheme.bandClass}
              purposeIconWrapClass={purposeTheme.iconWrapClass}
              purposeIcon={getPurposeIcon(post.meeting_purpose, "h-5 w-5 shrink-0")}
              purposeName={post.meeting_purpose || "Social meetup"}
              durationLabel={formatDuration(post.duration_minutes)}
              amountText={amount !== null ? `+${amount.toLocaleString()}` : ""}
              whenText={post.meeting_time ? formatTime(post.meeting_time) : ""}
              placeText={post.place_name || post.location || "No place"}
              lookingForText={`${post.target_gender || "Any"} / ${post.target_age_group || "Any"}`}
              distanceText={distanceText}
            />
          );
        })}

        {posts.length === 0 && (
          <div className={`${SURFACE_CARD_CLASS} px-5 py-10 text-center text-[#8b7f74] sm:px-6 sm:py-12`}>
            No meetups found.
          </div>
        )}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#d6b8a3] bg-[linear-gradient(135deg,#342621_0%,#9b6a58_100%)] text-white shadow-[0_22px_46px_rgba(80,60,40,0.30)] transition hover:scale-[1.02]"
        aria-label="Create meetup"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}



