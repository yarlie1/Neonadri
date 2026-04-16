import type { ReactNode } from "react";
import {
  Activity,
  Book,
  BookOpen,
  Cake,
  Camera,
  Coffee,
  Dice5,
  Film,
  Footprints,
  Gamepad2,
  Laptop,
  MapPin,
  Mic,
  Smile,
  Target,
  Utensils,
} from "lucide-react";
import type { DistanceValue, SortValue } from "./useHomeFeedFilters";
import type { DistanceUnit } from "./useDistanceUnit";

export const SURFACE_CARD_CLASS =
  "rounded-[32px] border border-[#eee2d6] bg-[linear-gradient(180deg,rgba(255,253,250,0.97)_0%,rgba(250,244,237,0.94)_100%)] shadow-[0_24px_70px_rgba(86,63,44,0.12)] backdrop-blur";
export const SOFT_CARD_CLASS =
  "rounded-[24px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fffdf9_0%,#f8efe6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]";

export function getPurposeIcon(purpose: string | null, className?: string) {
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

export function formatDuration(minutes: number | null) {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
}

export function getPurposeTheme(purpose: string | null) {
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

export function getMatchBadge(
  postStatus: "Upcoming" | "Expired",
  summary?: { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
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

export function parseBenefitAmount(value: string | null) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function getSortSummaryLabel(sort: SortValue) {
  switch (sort) {
    case "soonest":
      return "Soonest";
    case "benefit_desc":
      return "High $";
    case "benefit_asc":
      return "Low $";
    case "distance":
      return "Closest";
    default:
      return "";
  }
}

export function getDistanceSummaryLabel(
  distance: DistanceValue,
  unit: DistanceUnit
) {
  switch (distance) {
    case "nearby":
      return "Near me";
    case "within_5mi":
      return unit === "mi" ? "Under 5 mi" : "Under 8 km";
    case "within_10mi":
      return unit === "mi" ? "Under 10 mi" : "Under 16 km";
    case "within_20mi":
      return unit === "mi" ? "Under 20 mi" : "Under 32 km";
    default:
      return "";
  }
}

export function getDistanceOptionLabel(
  distance: DistanceValue,
  unit: DistanceUnit
) {
  if (distance === "all") return "All";
  return getDistanceSummaryLabel(distance, unit);
}

export function haversineKm(
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

export function formatDistanceKm(km: number | null, unit: DistanceUnit) {
  if (km === null || !Number.isFinite(km)) return "";

  if (unit === "mi") {
    const miles = km * 0.621371;
    if (miles < 0.2) return `About ${(miles * 5280).toFixed(0)} ft away`;
    return `About ${miles.toFixed(1)} mi away`;
  }

  if (km < 1) return `About ${(km * 1000).toFixed(0)} m away`;
  return `About ${km.toFixed(1)} km away`;
}

export function getPurposeLabel(purpose: string | null) {
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

export function FilterSummaryText({
  matchState,
  audience,
  purpose,
  gender,
  ageGroup,
  sort,
  distance,
  distanceUnit,
}: {
  matchState: string;
  audience: string;
  purpose: string;
  gender: string;
  ageGroup: string;
  sort: SortValue;
  distance: DistanceValue;
  distanceUnit: DistanceUnit;
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
  if (distance !== "all") {
    const label = getDistanceSummaryLabel(distance, distanceUnit);
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
