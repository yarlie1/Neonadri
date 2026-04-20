"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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
    stickyTop,
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
        (distanceKm !== null &&
          ((distance === "nearby" && distanceKm <= 3) ||
            (distance === "within_5mi" && distanceKm <= 8.04672) ||
            (distance === "within_10mi" && distanceKm <= 16.09344) ||
            (distance === "within_20mi" && distanceKm <= 32.18688)));

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
  const feedPosts = highlightedPost ? posts.slice(1) : posts;

  return (
    <main className="relative isolate min-h-screen bg-[#e6ebef] px-4 py-5 text-[#2f3a42]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,#ffffff_0%,#f7fafc_20%,#e8edf1_56%,#d7dfe5_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.62),transparent_22%),radial-gradient(circle_at_84%_16%,rgba(255,255,255,0.28),transparent_20%),radial-gradient(circle_at_60%_100%,rgba(223,229,235,0.16),transparent_32%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:22px_22px] opacity-10" />
      <div className="relative z-10 mx-auto max-w-2xl space-y-4 pb-24 sm:space-y-5">
        <section className="relative overflow-hidden rounded-[32px] border border-[#edf1f4] bg-[linear-gradient(145deg,rgba(255,255,255,0.995)_0%,rgba(247,249,250,0.985)_36%,rgba(232,236,239,0.99)_100%)] px-5 py-5 text-[#24323f] shadow-[0_26px_66px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,1)] sm:px-7 sm:py-7">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-[#ffffffeb] blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-[#f5f9fcc7] blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#eef2f4] bg-[#ffffffd9] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7e858b] shadow-[0_10px_22px_rgba(136,142,148,0.08)]">
              <Sparkles className="h-3.5 w-3.5" />
              Soft social layer
            </div>

            <h1 className="mt-3 max-w-lg text-[35px] font-black leading-[0.92] tracking-[-0.065em] text-[#1f2b34] sm:mt-4 sm:text-[44px]">
              Find someone new, without the noise.
            </h1>

            <p className="mt-3 max-w-xl text-[14px] leading-6 text-[#626e77] sm:mt-4 sm:text-[15px]">
              A quieter way to discover nearby meetups. Soft silver surfaces,
              calm pacing, and just enough AI guidance to keep browsing easy.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5 sm:mt-7 sm:gap-3">
              <div className="rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#888f94]">
                  Happening now
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {upcomingCount}
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Open right now</div>
              </div>

              <div className="rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="text-[11px] uppercase tracking-[0.12em] text-[#888f94]">
                  Hosts nearby
                </div>
                <div className="mt-1.5 text-[30px] font-black tracking-[-0.05em] text-[#24323f]">
                  {hostCount}
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Across the city</div>
              </div>

              <div className="rounded-[22px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(246,248,249,0.985)_40%,rgba(233,237,240,0.99)_100%)] px-3.5 py-3.5 shadow-[0_16px_30px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-[#81878d]">
                  Mood
                </div>
                <div className="mt-1.5 text-sm font-bold leading-5 text-[#24323f]">
                  Chill
                  <br />
                  Lab
                </div>
                <div className="mt-1 text-[11px] text-[#868d92]">Softly guided</div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
              <span className="rounded-[15px] border border-[#e6ebef] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f6_100%)] px-3 py-1.5 text-[11px] font-medium text-[#66727a] shadow-[0_8px_16px_rgba(118,126,133,0.06)]">
                Slow coffee
              </span>
              <span className="rounded-[15px] border border-[#e6ebef] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f6_100%)] px-3 py-1.5 text-[11px] font-medium text-[#66727a] shadow-[0_8px_16px_rgba(118,126,133,0.06)]">
                Afterglow walks
              </span>
              <span className="rounded-[15px] border border-[#e6ebef] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f6_100%)] px-3 py-1.5 text-[11px] font-medium text-[#66727a] shadow-[0_8px_16px_rgba(118,126,133,0.06)]">
                Quiet co-work
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

        <div
          ref={filterRef}
          className="sticky z-20"
          style={{ top: `${stickyTop}px` }}
        >
          <div>
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
        </div>

        <div className="flex items-center justify-between px-1 pt-1">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#848d93]">
              Discover
            </div>
            <div className="mt-1 text-xl font-black tracking-[-0.04em] text-[#24323f]">
              Nearby meetups
            </div>
          </div>

          <div className={`${SOFT_CARD_CLASS} px-3 py-1.5 text-xs font-medium text-[#6f7a81] shadow-[0_10px_18px_rgba(118,126,133,0.07)]`}>
            {posts.length} results
          </div>
        </div>

        {feedPosts.map((post) => {
          const amount = parseBenefitAmount(post.benefit_amount);
          const host = hostProfileMap[post.user_id] || {
            displayName: "Unknown",
            gender: "",
            ageGroup: "",
          };
          const status = getPostStatus(post.meeting_time);
          const isExpired = status === "Expired";
          const matchBadge = getMatchBadge(status as "Upcoming" | "Expired", matchSummaryMap[post.id]);
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
            <ViewportMeetupFeedCard
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

        {feedPosts.length === 0 && (
          <div
            className={`${SURFACE_CARD_CLASS} px-5 py-10 text-center text-[#6b7881] sm:px-6 sm:py-12`}
          >
            {highlightedPost
              ? "No more meetups match this view yet."
              : "No meetups match this view right now."}
          </div>
        )}
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-[24px] border border-[#d6e0e6] bg-[linear-gradient(135deg,#ffffff_0%,#e1eaef_100%)] text-[#5f7f8f] shadow-[0_24px_46px_rgba(118,126,133,0.18)] transition hover:scale-[1.02]"
        aria-label="Create meetup"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </main>
  );
}

function ViewportMeetupFeedCard(
  props: Parameters<typeof MeetupFeedCard>[0]
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visibilityRatio, setVisibilityRatio] = useState(1);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibilityRatio(entry.intersectionRatio);
      },
      {
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const opacity = Math.max(0.5, 0.5 + visibilityRatio * 0.5);
  const translateY = (1 - visibilityRatio) * 10;

  return (
    <div
      ref={ref}
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
      className="transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform]"
    >
      <MeetupFeedCard {...props} />
    </div>
  );
}



