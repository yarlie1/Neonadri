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
import {
  APP_BODY_TEXT_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "./designSystem";

export const SURFACE_CARD_CLASS = APP_SURFACE_CARD_CLASS;
export const SOFT_CARD_CLASS = APP_SOFT_CARD_CLASS;

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
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}H`;
  return `${hours.toFixed(1).replace(/\.0$/, "")}H`;
}

export function getPurposeTheme(purpose: string | null) {
  const baseBandClass = `${APP_ROW_SURFACE_CLASS} text-[#24323f]`;
  const baseIconWrapClass =
    "border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#71828c] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#596c76]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Meal":
    case "Dessert":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#5f6f78]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Walk":
    case "Jogging":
    case "Yoga":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#5d6f78]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Movie":
    case "Theater":
    case "Karaoke":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#60707a]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return {
        pillClass: `${APP_PILL_ACTIVE_CLASS} text-[#344651]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Study":
    case "Book Talk":
    case "Book":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#5c6f7a]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Work Together":
    case "Work":
      return {
        pillClass: `${APP_PILL_ACTIVE_CLASS} text-[#334650]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    case "Photo Walk":
    case "Photo":
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#5f6f78]`,
        bandClass: baseBandClass,
        iconWrapClass: baseIconWrapClass,
      };
    default:
      return {
        pillClass: `${APP_PILL_INACTIVE_CLASS} text-[#60707a]`,
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
      className:
        "border border-[#d4dfe6] bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] text-[#536a75]",
    };
  }

  if (isExpired) {
    return {
      label: "Expired",
      className:
        "border border-[#d7dde2] bg-[linear-gradient(180deg,#ffffff_0%,#eff3f5_100%)] text-[#75828a]",
    };
  }

  return {
    label: requestCount > 0 ? `Open / ${requestCount}` : "Open",
    className:
      "border border-[#c9d8cf] bg-[linear-gradient(180deg,#ffffff_0%,#edf7f1_100%)] text-[#466958]",
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
    return <span className={`text-sm ${APP_SUBTLE_TEXT_CLASS}`}>All filters</span>;
  }

  return (
    <span className={`text-sm font-medium ${APP_BODY_TEXT_CLASS}`}>
      {parts.join(" / ")}
    </span>
  );
}
