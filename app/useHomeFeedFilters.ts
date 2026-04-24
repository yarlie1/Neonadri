"use client";

import { useEffect, useRef, useState } from "react";

const HOME_FILTER_STICKY_TOP_MOBILE = 68;
const HOME_FILTER_STICKY_TOP_DESKTOP = 76;

export const PURPOSE_OPTIONS = [
  "All",
  "Coffee Chat",
  "Meal",
  "Dessert",
  "Walk",
  "Jogging",
  "Yoga",
  "Movie",
  "Karaoke",
  "Board Games",
  "Gaming",
  "Arcade",
  "Study",
  "Work Together",
  "Photo Walk",
];

export const GENDER_OPTIONS = [
  "All",
  "Male",
  "Female",
  "Other",
  "Prefer not to say",
];
export const AGE_GROUP_OPTIONS = ["All", "20s", "30s", "40s", "50s+"];
export const MATCH_STATE_OPTIONS = ["All", "Open", "Matched"];
export const AUDIENCE_OPTIONS = ["All", "Fits me"] as const;
export const DISTANCE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "nearby", label: "Near me" },
  { value: "within_5mi", label: "Under 5 mi" },
  { value: "within_10mi", label: "Under 10 mi" },
  { value: "within_20mi", label: "Under 20 mi" },
] as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "soonest", label: "Soonest" },
  { value: "distance", label: "Closest" },
  { value: "benefit_desc", label: "Highest Cost Support" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export type DistanceValue = (typeof DISTANCE_OPTIONS)[number]["value"];

export function useHomeFeedFilters(viewerPreference: {
  gender: string;
  ageGroup: string;
} | null) {
  const [matchState, setMatchState] = useState("All");
  const [audience, setAudience] = useState<(typeof AUDIENCE_OPTIONS)[number]>(
    "All"
  );
  const [purpose, setPurpose] = useState("All");
  const [gender, setGender] = useState("All");
  const [ageGroup, setAgeGroup] = useState("All");
  const [distance, setDistance] = useState<DistanceValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterPinned, setIsFilterPinned] = useState(false);
  const [stickyTop, setStickyTop] = useState(HOME_FILTER_STICKY_TOP_MOBILE);
  const filterRef = useRef<HTMLDivElement | null>(null);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "granted" | "denied" | "unavailable"
  >("idle");

  useEffect(() => {
    const needsLocation = sort === "distance" || distance !== "all";
    if (!needsLocation) return;
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
  }, [distance, sort, userLocation, locationStatus]);

  useEffect(() => {
    const updateStickyTop = () => {
      setStickyTop(
        window.innerWidth >= 640
          ? HOME_FILTER_STICKY_TOP_DESKTOP
          : HOME_FILTER_STICKY_TOP_MOBILE
      );
    };

    updateStickyTop();
    window.addEventListener("resize", updateStickyTop);

    return () => {
      window.removeEventListener("resize", updateStickyTop);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!filterRef.current) return;
      setIsFilterPinned(
        filterRef.current.getBoundingClientRect().top <= stickyTop
      );
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [stickyTop]);

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
    setDistance("all");
    setSort("newest");
    setIsOpen(false);
  };

  return {
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
  };
}
