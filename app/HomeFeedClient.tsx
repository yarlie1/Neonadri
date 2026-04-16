"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  formatMeetingTime,
  getMeetingStatus,
  parseMeetingTime,
} from "../lib/meetingTime";
import { Plus, Sparkles } from "lucide-react";
import {
  FeaturedMeetupCard,
  HomeFilterCard,
  MeetupFeedCard,
} from "./homeComponents";
import {
  FilterSummaryText,
  formatDistanceKm,
  formatDuration,
  getMatchBadge,
  getPurposeIcon,
  getPurposeLabel,
  getPurposeTheme,
  haversineKm,
  parseBenefitAmount,
  SOFT_CARD_CLASS,
  SURFACE_CARD_CLASS,
} from "./homeFeedHelpers";
import {
  AGE_GROUP_OPTIONS,
  AUDIENCE_OPTIONS,
  DISTANCE_OPTIONS,
  GENDER_OPTIONS,
  MATCH_STATE_OPTIONS,
  PURPOSE_OPTIONS,
  SORT_OPTIONS,
  type SortValue,
  useHomeFeedFilters,
} from "./useHomeFeedFilters";
import { useDistanceUnit } from "./useDistanceUnit";

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

export default function HomeFeedClient({
  initialPosts,
  hostProfileMap,
  matchSummaryMap,
  viewerPreference,
  initialUserTimeZone,
}: {
  initialPosts: PostRow[];
  hostProfileMap: HostProfileMap;
  matchSummaryMap: MatchSummaryMap;
  viewerPreference: { gender: string; ageGroup: string } | null;
  initialUserTimeZone: string;
}) {
  const userTimeZone = useMemo(() => initialUserTimeZone, [initialUserTimeZone]);

  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, userTimeZone) || "";
  const { distanceUnit, setDistanceUnit } = useDistanceUnit();

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
    distance,
    setDistance,
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
      const distanceKm =
        userLocation &&
        post.latitude !== null &&
        post.longitude !== null
          ? haversineKm(
              userLocation.lat,
              userLocation.lng,
              post.latitude,
              post.longitude
            )
          : null;
      const distanceMatch =
        distance === "all" ||
        distanceKm === null ||
        (distance === "nearby" && distanceKm <= 3) ||
        (distance === "within_5km" && distanceKm <= 5) ||
        (distance === "within_10km" && distanceKm <= 10);

      return (
        matchStateMatch &&
        purposeMatch &&
        genderMatch &&
        ageGroupMatch &&
        distanceMatch
      );
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
  }, [
    ageGroup,
    distance,
    gender,
    initialPosts,
    matchState,
    matchSummaryMap,
    purpose,
    sort,
    userLocation,
    userTimeZone,
  ]);

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

        <div ref={filterRef} className="sticky top-[68px] z-20 sm:top-[76px]">
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
                distance={distance}
                distanceUnit={distanceUnit}
                sort={sort}
              />
            }
            matchState={matchState}
            audience={audience}
            purpose={purpose}
            gender={gender}
            ageGroup={ageGroup}
            distance={distance}
            distanceUnit={distanceUnit}
            sort={sort}
            matchStateOptions={MATCH_STATE_OPTIONS}
            audienceOptions={AUDIENCE_OPTIONS}
            purposeOptions={PURPOSE_OPTIONS}
            genderOptions={GENDER_OPTIONS}
            ageGroupOptions={AGE_GROUP_OPTIONS}
            distanceOptions={DISTANCE_OPTIONS}
            distanceUnitOptions={["mi", "km"]}
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
            onDistance={(option) =>
              applyAndClose(() => setDistance(option as (typeof DISTANCE_OPTIONS)[number]["value"]))
            }
            onDistanceUnit={setDistanceUnit}
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
            locationStatus === "granted" &&
            userLocation &&
            post.latitude !== null &&
            post.longitude !== null
              ? formatDistanceKm(
                  haversineKm(
                    userLocation.lat,
                    userLocation.lng,
                    post.latitude,
                    post.longitude
                  ),
                  distanceUnit
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



