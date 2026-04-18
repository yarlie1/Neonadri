import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Clock3,
  Coins,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserCircle2,
  UserRound,
} from "lucide-react";
import { getDistanceOptionLabel, getPurposeLabel } from "./homeFeedHelpers";
import type { DistanceUnit } from "./useDistanceUnit";

export function FilterPill({
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
          ? "border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] text-[#33454f] shadow-[0_8px_16px_rgba(118,126,133,0.08)]"
          : "border border-[#e5ebef] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] text-[#66737b] hover:bg-[#f6f9fb]"
      }`}
    >
      {label}
    </button>
  );
}

type HomeFilterCardProps = {
  isPinned: boolean;
  isOpen: boolean;
  onToggle: () => void;
  summaryText: ReactNode;
  matchState: string;
  audience: string;
  purpose: string;
  gender: string;
  ageGroup: string;
  distance: string;
  distanceUnit: DistanceUnit;
  sort: string;
  matchStateOptions: string[];
  audienceOptions: readonly string[];
  purposeOptions: string[];
  genderOptions: string[];
  ageGroupOptions: string[];
  distanceOptions: readonly { value: string; label: string }[];
  distanceUnitOptions: readonly DistanceUnit[];
  sortOptions: readonly { value: string; label: string }[];
  onMatchState: (value: string) => void;
  onAudience: (value: string) => void;
  onPurpose: (value: string) => void;
  onGender: (value: string) => void;
  onAgeGroup: (value: string) => void;
  onDistance: (value: string) => void;
  onDistanceUnit: (value: DistanceUnit) => void;
  onSort: (value: string) => void;
  onReset: () => void;
  locationStatus: "idle" | "loading" | "granted" | "denied" | "unavailable";
};

export function HomeFilterCard({
  isPinned,
  isOpen,
  onToggle,
  summaryText,
  matchState,
  audience,
  purpose,
  gender,
  ageGroup,
  distance,
  distanceUnit,
  sort,
  matchStateOptions,
  audienceOptions,
  purposeOptions,
  genderOptions,
  ageGroupOptions,
  distanceOptions,
  distanceUnitOptions,
  sortOptions,
  onMatchState,
  onAudience,
  onPurpose,
  onGender,
  onAgeGroup,
  onDistance,
  onDistanceUnit,
  onSort,
  onReset,
  locationStatus,
}: HomeFilterCardProps) {
  return (
    <div
      className={`rounded-[28px] transition ${
        isPinned
          ? "border border-[#e4e9ed] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] shadow-[0_18px_40px_rgba(118,126,133,0.12)]"
          : "border border-[#e4e9ed] bg-[linear-gradient(180deg,#ffffff_0%,#f5f8fa_100%)] shadow-[0_8px_20px_rgba(118,126,133,0.05)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2f3b44]">
            <SlidersHorizontal className="h-4 w-4 text-[#7f888e]" />
            Refine your view
          </div>
          <div className="mt-2">{summaryText}</div>
        </div>

        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f7_100%)] text-[#737d84] shadow-[0_10px_18px_rgba(118,126,133,0.07)] transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto border-t border-[#efe6db] px-4 py-4 pb-6 sm:pb-5">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#7f8990]">
              Status
            </div>
            <div className="flex flex-wrap gap-2">
              {matchStateOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={matchState === option}
                  label={option}
                  onClick={() => onMatchState(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Audience
            </div>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={audience === option}
                  label={option}
                  onClick={() => onAudience(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Purpose
            </div>
            <div className="flex flex-wrap gap-2">
              {purposeOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={purpose === option}
                  label={option}
                  onClick={() => onPurpose(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Gender
            </div>
            <div className="flex flex-wrap gap-2">
              {genderOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={gender === option}
                  label={option}
                  onClick={() => onGender(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Age Group
            </div>
            <div className="flex flex-wrap gap-2">
              {ageGroupOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={ageGroup === option}
                  label={option}
                  onClick={() => onAgeGroup(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Near you
            </div>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((option) => (
                <FilterPill
                  key={option.value}
                  active={distance === option.value}
                  label={getDistanceOptionLabel(
                    option.value as
                      | "all"
                      | "nearby"
                      | "within_5mi"
                      | "within_10mi"
                      | "within_20mi",
                    distanceUnit
                  )}
                  onClick={() => onDistance(option.value)}
                />
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {distanceUnitOptions.map((option) => (
                <FilterPill
                  key={option}
                  active={distanceUnit === option}
                  label={option.toUpperCase()}
                  onClick={() => onDistanceUnit(option)}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
              Sort
            </div>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <FilterPill
                  key={option.value}
                  active={sort === option.value}
                  label={option.label}
                  onClick={() => onSort(option.value)}
                />
              ))}
            </div>

            {(sort === "distance" || distance !== "all") && (
              <div className="mt-3 text-xs text-[#7f8990]">
                {locationStatus === "loading" && "Finding nearby meetups..."}
                {locationStatus === "denied" &&
                  "Location permission is off, so nearby filters may be less precise."}
                {locationStatus === "unavailable" &&
                  "Distance is unavailable on this device or browser."}
                {locationStatus === "granted" &&
                  "Showing meetups from your current location."}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-full border border-[#dde5ea] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-3 py-2 text-xs font-medium text-[#5f6c74] transition hover:bg-[#f6f9fb]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function FeaturedMeetupCard({
  postId,
  placeLabel,
  purposeIcon,
  purposeLabel,
  purposeCopy,
  timeLabel,
  placeText,
  targetText,
}: {
  postId: number;
  placeLabel: string;
  purposeIcon: ReactNode;
  purposeLabel: string;
  purposeCopy: string;
  timeLabel: string;
  placeText: string;
  targetText: string;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-[#edf1f4] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(247,249,250,0.99)_38%,rgba(236,240,243,0.99)_100%)] shadow-[0_26px_64px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,1)]">
      <div className="border-b border-[#e3e6e8] px-5 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#838b91]">
              <Search className="h-3.5 w-3.5" />
              Featured moment
            </div>
            <div className="mt-2 text-[28px] font-black tracking-[-0.05em] text-[#24323f]">
              {placeLabel}
            </div>
          </div>

          <Link
            href={`/posts/${postId}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[18px] border border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f7_100%)] text-[#747e85] shadow-[0_12px_22px_rgba(118,126,133,0.08)] transition hover:bg-[#f7fafb]"
            aria-label="Open featured meetup"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.45fr_0.95fr] sm:px-5 sm:py-5">
        <div className="relative overflow-hidden rounded-[24px] border border-[#e4e9ed] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(247,249,250,0.985)_50%,rgba(235,239,242,0.99)_100%)] px-4 py-3.5 text-[#24323f] shadow-[0_18px_34px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,1)] sm:py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eef2f4] bg-[#ffffffd8] px-3 py-1.5 text-xs font-medium text-[#788087]">
            {purposeIcon}
            {purposeLabel}
          </div>

          <div className="mt-3 text-[30px] font-black leading-[0.98] tracking-[-0.05em] sm:mt-4">
            {purposeCopy}
          </div>

          <div className="mt-2.5 max-w-md text-sm leading-6 text-[#707980] sm:mt-3">
            A quieter featured moment with a little more room to breathe.
          </div>
        </div>

        <div className="relative overflow-hidden space-y-2 rounded-[20px] border border-[#e3e8ec] bg-[linear-gradient(180deg,rgba(255,255,255,0.995)_0%,rgba(245,247,248,0.985)_100%)] px-4 py-3.5 text-[#38434b] shadow-[0_14px_26px_rgba(118,126,133,0.08)] sm:space-y-2.5 sm:py-4">
          <div className="flex items-center gap-2 text-sm">
            <Clock3 className="h-4 w-4 text-[#7c8489]" />
            <span>{timeLabel}</span>
          </div>

          <div className="flex min-w-0 items-start gap-2 text-sm">
            <MapPin className="mt-0.5 h-4 w-4 text-[#7c8489]" />
            <span className="block min-w-0 flex-1 break-words line-clamp-2">
              {placeText}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Search className="h-4 w-4 text-[#7c8489]" />
            <span>{targetText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MeetupFeedCard({
  postId,
  isExpired,
  hostName,
  hostMeta,
  matchBadgeLabel,
  matchBadgeClassName,
  purposeIcon,
  purposeName,
  durationLabel,
  amountText,
  whenText,
  placeText,
  lookingForText,
  distanceText,
}: {
  postId: number;
  isExpired: boolean;
  hostName: string;
  hostMeta: string;
  matchBadgeLabel: string;
  matchBadgeClassName: string;
  purposeIcon: ReactNode;
  purposeName: string;
  durationLabel: string;
  amountText: string;
  whenText: string;
  placeText: string;
  lookingForText: string;
  distanceText: string;
}) {
  return (
    <Link
      href={`/posts/${postId}`}
      className={`block overflow-hidden rounded-[24px] border p-2.5 shadow-[0_18px_36px_rgba(118,126,133,0.12)] transition active:scale-[0.995] sm:p-3 ${
        isExpired
          ? "border-[#d6dde2] bg-[linear-gradient(180deg,rgba(236,240,243,0.97)_0%,rgba(221,227,232,0.95)_100%)] opacity-80"
          : "border-[#e4ebef] bg-[linear-gradient(180deg,rgba(248,250,252,0.985)_0%,rgba(228,235,240,0.95)_100%)] hover:-translate-y-0.5"
      }`}
    >
      <div className="rounded-[18px] border border-[#e6edf1] bg-[linear-gradient(180deg,rgba(253,254,255,0.998)_0%,rgba(238,243,246,0.975)_100%)] px-4 py-3.5 shadow-[0_16px_28px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,1)]">
        <div className="flex items-start justify-between gap-3">
          <div className="grid min-w-0 flex-1 grid-cols-[40px_minmax(0,1fr)] gap-x-2.5 gap-y-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#d7dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f7_100%)] text-[#6f808a] shadow-[0_8px_16px_rgba(118,126,133,0.08)]">
              {purposeIcon}
            </div>
            <div className="min-w-0 truncate self-center pt-[1px] text-[24px] font-black leading-none tracking-[-0.05em] text-[#1f2b34]">
              {purposeName}
            </div>
            <div className="col-start-2 min-w-0 truncate text-[12px] leading-none text-[#75818a]">
              Hosted by {hostName}
              {hostMeta ? ` | ${hostMeta}` : ""}
            </div>
          </div>

          <div
            className={`shrink-0 rounded-[14px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_16px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,0.88)] ${matchBadgeClassName}`}
          >
            {matchBadgeLabel}
          </div>
        </div>

        <div className="mt-3.5 grid gap-1.5">
          {whenText && (
            <div className="flex min-h-[56px] items-center gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f7_100%)] px-3.5 py-2 text-sm text-[#364149] shadow-[0_8px_18px_rgba(118,126,133,0.05),inset_0_1px_0_rgba(255,255,255,0.98)]">
              <Clock3 className="h-4 w-4 shrink-0 text-[#788b95]" />
              <span className="truncate">{whenText}</span>
              {durationLabel ? (
                <span className="ml-auto rounded-[14px] border border-[#cbd4db] bg-[linear-gradient(180deg,#ffffff_0%,#eceff2_100%)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#52616a] shadow-[0_8px_14px_rgba(118,126,133,0.12)]">
                  {durationLabel}
                </span>
              ) : null}
            </div>
          )}

          <div className="flex min-h-[56px] items-center gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f7_100%)] px-3.5 py-2 text-sm text-[#364149] shadow-[0_8px_18px_rgba(118,126,133,0.05),inset_0_1px_0_rgba(255,255,255,0.98)]">
            <MapPin className="h-4 w-4 shrink-0 text-[#788b95]" />
            <span className="min-w-0 flex-1 break-words">{placeText}</span>
          </div>

          <div className="flex min-h-[56px] items-center justify-between gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f7_100%)] px-3.5 py-2 text-sm text-[#364149] shadow-[0_8px_18px_rgba(118,126,133,0.05),inset_0_1px_0_rgba(255,255,255,0.98)]">
            <span className="inline-flex min-w-0 items-center gap-2 text-[#55646e]">
              <UserRound className="h-4 w-4 shrink-0 text-[#788b95]" />
              <span className="truncate">{lookingForText}</span>
            </span>
            {amountText ? (
              <span className="inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-[#ced7de] bg-[linear-gradient(180deg,#ffffff_0%,#edf1f4_100%)] px-3 py-1.5 font-semibold text-[#435760] shadow-[0_8px_16px_rgba(118,126,133,0.12)]">
                <Coins className="h-4 w-4 text-[#7b8d97]" />
                {amountText.startsWith("+") ? `$${amountText.slice(1)}` : amountText}
              </span>
            ) : null}
          </div>

          {distanceText && (
            <div className="flex min-h-[56px] items-center gap-2.5 rounded-[16px] border border-[#dde3e7] bg-[linear-gradient(180deg,#ffffff_0%,#f4f6f7_100%)] px-3.5 py-2 text-sm text-[#364149] shadow-[0_8px_18px_rgba(118,126,133,0.05),inset_0_1px_0_rgba(255,255,255,0.98)]">
              <LocateFixed className="h-4 w-4 shrink-0 text-[#788b95]" />
              <span>{distanceText}</span>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[#dde4e9] bg-[linear-gradient(90deg,rgba(252,253,254,0.98)_0%,rgba(239,243,246,0.9)_100%)] px-3 py-1.5">
          <div className="text-xs uppercase tracking-[0.16em] text-[#7a8b95]">
            Refined mode
          </div>
          <div className="ml-auto text-right text-sm font-semibold text-[#314454]">
            {getPurposeLabel(purposeName)}
          </div>
        </div>
      </div>
    </Link>
  );
}
