"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { getPublicLocationLabel } from "../lib/locationPrivacy";
import {
  formatMeetingTime,
  getMeetingStatus,
  parseMeetingTime,
} from "../lib/meetingTime";
import { HomeFilterRail, MeetupFeedCard } from "./homeComponents";
import {
  haversineKm,
  parseBenefitAmount,
  SURFACE_CARD_CLASS,
} from "./homeFeedHelpers";
import { APP_PAGE_BG_CLASS } from "./designSystem";

import {
  AGE_GROUP_OPTIONS,
  AUDIENCE_OPTIONS,
  DISTANCE_OPTIONS,
  GENDER_OPTIONS,
  MATCH_STATE_OPTIONS,
  SORT_OPTIONS,
  type SortValue,
  useHomeFeedFilters,
} from "./useHomeFeedFilters";
import { useDistanceUnit } from "./useDistanceUnit";
import { useCreateMeetupHref } from "./useCreateMeetupHref";


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
  isLoggedIn,
  initialCreateHref,
}: {
  initialPosts: PostRow[];
  hostProfileMap: HostProfileMap;
  matchSummaryMap: MatchSummaryMap;
  viewerPreference: { gender: string; ageGroup: string } | null;
  initialUserTimeZone: string;
  isLoggedIn: boolean;
  postingBetaRequired: boolean;
  initialCreateHref: string;
}) {
  const userTimeZone = useMemo(() => initialUserTimeZone, [initialUserTimeZone]);
  const createHref = useCreateMeetupHref(isLoggedIn, initialCreateHref);

  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, userTimeZone) || "";
  const { distanceUnit, setDistanceUnit } = useDistanceUnit();

  useEffect(() => {
    if (distanceUnit !== "mi") {
      setDistanceUnit("mi");
    }
  }, [distanceUnit, setDistanceUnit]);

  const getPostStatus = (meetingTime: string | null) =>
    getMeetingStatus(meetingTime, userTimeZone);

  const {
    matchState,
    setMatchState,
    audience,
    setAudience,
    purpose,
    setPurpose,
    hostGender,
    setHostGender,
    hostAgeGroup,
    setHostAgeGroup,
    gender,
    setGender,
    ageGroup,
    setAgeGroup,
    distance,
    setDistance,
    sort,
    setSort,
    userLocation,
    locationStatus,
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
      const host = hostProfileMap[post.user_id] || {
        displayName: "Unknown",
        gender: "",
        ageGroup: "",
      };
      const hostGenderMatch =
        hostGender === "All" || host.gender === hostGender;
      const hostAgeGroupMatch =
        hostAgeGroup === "All" || host.ageGroup === hostAgeGroup;
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
        hostGenderMatch &&
        hostAgeGroupMatch &&
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
    hostAgeGroup,
    hostGender,
    hostProfileMap,
    initialPosts,
    matchState,
    matchSummaryMap,
    purpose,
    sort,
    userLocation,
    userTimeZone,
  ]);

  const feedPosts = posts;

  return (
    <>
      <main className={`relative isolate min-h-[100dvh] overflow-x-hidden px-4 py-5 ${APP_PAGE_BG_CLASS}`}>
        <div className="relative z-10 mx-auto max-w-2xl min-w-0 space-y-4 pb-14">
          <div className="flex items-end justify-between gap-4 px-1 pt-2">
            <div>
              <h1 className="text-[30px] font-black leading-none text-[#111111] sm:text-[36px]">
                Meetups
              </h1>
              <div className="mt-1 text-sm font-medium text-[#555555]">
                {posts.length} results
              </div>
            </div>
          </div>

          <Link
            href="/reward"
            className="group block overflow-hidden rounded-[8px] border border-[#111111] bg-[#111111] px-4 py-4 text-white transition hover:bg-[#262626]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d6d6d6]">
                  LA Launch Reward
                </div>
                <div className="mt-2 text-xl font-black leading-[1.05] tracking-[-0.03em] text-[#ffffff] sm:text-2xl">
                  Post a meetup. Claim $10.
                </div>
                <div className="mt-2 text-sm font-semibold leading-5 text-[#d6d6d6]">
                  First 100 eligible participants. Terms apply.
                </div>
              </div>
              <div className="shrink-0 rounded-full border border-white px-3 py-1 text-xs font-black text-[#ffffff] transition group-hover:bg-white group-hover:text-[#111111]">
                View
              </div>
            </div>
          </Link>

          <div className="relative px-1">
            <HomeFilterRail
              matchState={matchState}
              audience={audience}
              hostGender={hostGender}
              hostAgeGroup={hostAgeGroup}
              gender={gender}
              ageGroup={ageGroup}
              distance={distance}
              distanceUnit={distanceUnit}
              sort={sort}
              matchStateOptions={MATCH_STATE_OPTIONS}
              audienceOptions={AUDIENCE_OPTIONS}
              genderOptions={GENDER_OPTIONS}
              ageGroupOptions={AGE_GROUP_OPTIONS}
              distanceOptions={DISTANCE_OPTIONS}
              sortOptions={SORT_OPTIONS}
              onMatchState={setMatchState}
              onAudience={(option) => applyAudience(option as (typeof AUDIENCE_OPTIONS)[number])}
              onHostGender={setHostGender}
              onHostAgeGroup={setHostAgeGroup}
              onGender={(option) => {
                setAudience("All");
                setGender(option);
              }}
              onAgeGroup={(option) => {
                setAudience("All");
                setAgeGroup(option);
              }}
              onDistance={(option) => setDistance(option as (typeof DISTANCE_OPTIONS)[number]["value"])}
              onSort={(option) => setSort(option as SortValue)}
              onReset={resetAll}
              locationStatus={locationStatus}
            />
            <Link
              href={createHref}
              className="absolute right-1 top-2 max-w-[calc(100%-10rem)] text-right text-sm font-medium leading-5 text-[#555555]"
            >
              Want to host?{" "}
              <span className="font-bold text-[#111111] underline underline-offset-4">
                Create meetup
              </span>
            </Link>
          </div>

        <div className="grid min-w-0 gap-3">
        {feedPosts.map((post) => {
          const amount = parseBenefitAmount(post.benefit_amount);
          const status = getPostStatus(post.meeting_time);
          const isExpired = status === "Expired";

          return (
            <ViewportMeetupFeedCard
              key={post.id}
              postId={post.id}
              isExpired={isExpired}
              purposeName={post.meeting_purpose || "Social meetup"}
              amountText={amount !== null ? `$${amount.toLocaleString()}` : ""}
              whenText={post.meeting_time ? formatTime(post.meeting_time) : ""}
              placeText={
                post.place_name ||
                getPublicLocationLabel(post.place_name, post.location) ||
                "No place"
              }
            />
          );
        })}
        </div>

        {feedPosts.length === 0 && (
          <div
            className={`${SURFACE_CARD_CLASS} px-5 py-10 text-center text-[#6b7881] sm:px-6 sm:py-12`}
          >
            {"No meetups match this view right now."}
          </div>
        )}

        </div>

      </main>
    </>
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
      className="min-w-0 max-w-full transition-[opacity,transform] duration-300 ease-out will-change-[opacity,transform]"
    >
      <MeetupFeedCard {...props} />
    </div>
  );
}
