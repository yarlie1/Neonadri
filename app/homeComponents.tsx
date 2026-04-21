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
  UserRound,
} from "lucide-react";
import { getDistanceOptionLabel, getPurposeLabel } from "./homeFeedHelpers";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "./designSystem";
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
        active ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
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
          ? `${APP_SOFT_CARD_CLASS} shadow-[0_18px_40px_rgba(118,126,133,0.11)]`
          : `${APP_SOFT_CARD_CLASS} shadow-[0_8px_20px_rgba(118,126,133,0.05)]`
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2f3b44]">
            <SlidersHorizontal className={`h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
            Refine your view
          </div>
          <div className="mt-2">{summaryText}</div>
        </div>

        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-[0_10px_18px_rgba(118,126,133,0.07)] transition ${APP_PILL_INACTIVE_CLASS} ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto border-t border-[#e6edf1] px-4 py-4 pb-6 sm:pb-5">
          <div>
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
            <div className={`mb-2 text-xs font-medium uppercase tracking-[0.08em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
              <div className={`mt-3 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
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
              className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-medium transition ${APP_PILL_INACTIVE_CLASS}`}
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
    <section className={`overflow-hidden ${APP_SURFACE_CARD_CLASS} shadow-[0_24px_48px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,1)]`}>
      <div className="border-b border-[#e3e6e8] px-5 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${APP_SUBTLE_TEXT_CLASS}`}>
              <Search className="h-3.5 w-3.5" />
              Featured moment
            </div>
            <div className="mt-2 text-[28px] font-black tracking-[-0.05em] text-[#24323f]">
              {placeLabel}
            </div>
          </div>

          <Link
            href={`/posts/${postId}`}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-[18px] shadow-[0_12px_22px_rgba(118,126,133,0.08)] transition ${APP_BUTTON_SECONDARY_CLASS}`}
            aria-label="Open featured meetup"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.45fr_0.95fr] sm:px-5 sm:py-5">
        <div className={`relative overflow-hidden px-4 py-3.5 text-[#24323f] sm:py-4 ${APP_INNER_PANEL_CLASS}`}>
          <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            {purposeIcon}
            {purposeLabel}
          </div>

          <div className="mt-3 text-[30px] font-black leading-[0.98] tracking-[-0.05em] sm:mt-4">
            {purposeCopy}
          </div>

          <div className={`mt-2.5 max-w-md sm:mt-3 ${APP_BODY_TEXT_CLASS}`}>
            A quieter featured moment, with just a little more room to breathe.
          </div>
        </div>

        <div className={`relative overflow-hidden space-y-2 px-4 py-3.5 text-[#38434b] sm:space-y-2.5 sm:py-4 ${APP_INNER_PANEL_CLASS}`}>
          <div className="flex items-center gap-2 text-sm">
            <Clock3 className={`h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span>{timeLabel}</span>
          </div>

          <div className="flex min-w-0 items-start gap-2 text-sm">
            <MapPin className={`mt-0.5 h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span className="block min-w-0 flex-1 break-words line-clamp-2">
              {placeText}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Search className={`h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
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
      className={`block overflow-hidden rounded-[24px] border p-2.5 shadow-[0_18px_30px_rgba(118,126,133,0.12)] transition active:scale-[0.995] sm:p-3 ${
        isExpired
          ? "border-[#d2dbe1] bg-[linear-gradient(180deg,rgba(239,243,246,0.99)_0%,rgba(227,233,238,0.98)_100%)]"
          : "border-[#d7e1e7] bg-[linear-gradient(180deg,rgba(250,252,254,1)_0%,rgba(231,238,243,0.985)_100%)] hover:-translate-y-0.5 hover:shadow-[0_20px_34px_rgba(118,126,133,0.15)]"
      }`}
    >
      <div className={`px-4 py-3.5 ${APP_INNER_PANEL_CLASS}`}>
        <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-0.5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] shadow-[0_8px_16px_rgba(118,126,133,0.1)] ${APP_ROW_SURFACE_CLASS}`}>
              {purposeIcon}
            </div>
            <div className="min-w-0 self-center truncate pt-[1px] text-[24px] font-black leading-none tracking-[-0.05em] text-[#1f2b34]">
              {purposeName}
            </div>
            <div
              className={`col-span-3 row-start-2 min-w-0 pl-[50px] pr-1 line-clamp-2 text-[12px] leading-[1.15] ${APP_SUBTLE_TEXT_CLASS}`}
            >
              Hosted by {hostName}
              {hostMeta ? ` | ${hostMeta}` : ""}
            </div>
          <div
            className={`col-start-3 row-start-1 shrink-0 self-start rounded-[14px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_16px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,0.88)] ${matchBadgeClassName}`}
          >
            {matchBadgeLabel}
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {whenText && (
            <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
              <Clock3 className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span className="truncate">{whenText}</span>
              {durationLabel ? (
                <span className="ml-auto rounded-[14px] border border-[#cbd4db] bg-[linear-gradient(180deg,#ffffff_0%,#eceff2_100%)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#3b4c56] shadow-[0_8px_14px_rgba(118,126,133,0.12)]">
                  {durationLabel}
                </span>
              ) : null}
            </div>
          )}

          <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
            <MapPin className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span className="min-w-0 flex-1 break-words">{placeText}</span>
          </div>

          <div className={`flex min-h-[56px] items-center justify-between gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
            <span className="inline-flex min-w-0 items-center gap-2 text-[#55646e]">
              <UserRound className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span className="truncate">{lookingForText}</span>
            </span>
            {amountText ? (
              <span className="inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-[#c7d2da] bg-[linear-gradient(180deg,#ffffff_0%,#ebf0f4_100%)] px-3 py-1.5 font-semibold text-[#435760] shadow-[0_10px_18px_rgba(118,126,133,0.12)]">
                <Coins className={`h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
                {amountText.startsWith("+") ? `$${amountText.slice(1)}` : amountText}
              </span>
            ) : null}
          </div>

          {distanceText && (
            <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
              <LocateFixed className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span>{distanceText}</span>
            </div>
          )}
        </div>

        <div className={`mt-3 flex items-center justify-between gap-3 rounded-[14px] px-3 py-1.5 ${APP_SOFT_CARD_CLASS}`}>
          <div className={`text-xs uppercase tracking-[0.16em] ${APP_SUBTLE_TEXT_CLASS}`}>
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
