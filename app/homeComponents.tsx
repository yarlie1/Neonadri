import Link from "next/link";
import { useRef, type ReactNode } from "react";
import { buildPostPath } from "../lib/postUrl";
import {
  ArrowUpDown,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Coins,
  LocateFixed,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import { getDistanceOptionLabel, getPurposeIcon, getPurposeLabel } from "./homeFeedHelpers";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
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
      className={`inline-flex items-center rounded-[8px] px-3 py-2 text-sm font-medium transition ${
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
  hostGender: string;
  hostAgeGroup: string;
  gender: string;
  ageGroup: string;
  distance: string;
  distanceUnit: DistanceUnit;
  sort: string;
  matchStateOptions: string[];
  audienceOptions: readonly string[];
  genderOptions: string[];
  ageGroupOptions: string[];
  distanceOptions: readonly { value: string; label: string }[];
  distanceUnitOptions: readonly DistanceUnit[];
  sortOptions: readonly { value: string; label: string }[];
  onMatchState: (value: string) => void;
  onAudience: (value: string) => void;
  onHostGender: (value: string) => void;
  onHostAgeGroup: (value: string) => void;
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
  hostGender,
  hostAgeGroup,
  gender,
  ageGroup,
  distance,
  distanceUnit,
  sort,
  matchStateOptions,
  audienceOptions,
  genderOptions,
  ageGroupOptions,
  distanceOptions,
  distanceUnitOptions,
  sortOptions,
  onMatchState,
  onAudience,
  onHostGender,
  onHostAgeGroup,
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
      className={`rounded-[8px] transition ${
        isPinned
          ? `${APP_SOFT_CARD_CLASS} shadow-none`
          : `${APP_SOFT_CARD_CLASS} shadow-none`
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#111111]">
            <SlidersHorizontal className={`h-4 w-4 ${APP_SUBTLE_TEXT_CLASS}`} />
            Refine your view
          </div>
          <div className="mt-2">{summaryText}</div>
        </div>

        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] shadow-none transition ${APP_PILL_INACTIVE_CLASS} ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto border-t border-[#111111] px-4 py-4 pb-6 sm:pb-5">
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

            {distanceUnitOptions.length > 1 ? (
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
            ) : null}
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
                  "Location is off. Nearby filters may vary."}
                {locationStatus === "unavailable" &&
                  "Distance is unavailable here."}
                {locationStatus === "granted" &&
                  "Showing nearby meetups."}
              </div>
            )}
          </div>

          <div className="mt-5 border-t border-[#111111] pt-4">
            <button
              type="button"
              onClick={onReset}
              className={`inline-flex items-center gap-2 rounded-[14px] px-3.5 py-2.5 text-xs font-semibold transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  icon,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  icon?: ReactNode;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative inline-flex shrink-0 items-center">
      <span className="sr-only">{label}</span>
      {icon ? (
        <span className="pointer-events-none absolute left-3 text-[#444444]">
          {icon}
        </span>
      ) : null}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`h-11 appearance-none rounded-[8px] border border-[#111111] bg-white pr-10 text-sm font-semibold text-[#111111] shadow-none outline-none transition hover:border-[#111111] focus:border-[#111111] ${
          icon ? "pl-9" : "pl-4"
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-[#444444]" />
    </label>
  );
}

export function HomeFilterRail({
  matchState,
  audience,
  hostGender,
  hostAgeGroup,
  gender,
  ageGroup,
  distance,
  distanceUnit,
  sort,
  matchStateOptions,
  audienceOptions,
  genderOptions,
  ageGroupOptions,
  distanceOptions,
  sortOptions,
  onMatchState,
  onAudience,
  onHostGender,
  onHostAgeGroup,
  onGender,
  onAgeGroup,
  onDistance,
  onSort,
  onReset,
  locationStatus,
}: {
  matchState: string;
  audience: string;
  hostGender: string;
  hostAgeGroup: string;
  gender: string;
  ageGroup: string;
  distance: string;
  distanceUnit: DistanceUnit;
  sort: string;
  matchStateOptions: string[];
  audienceOptions: readonly string[];
  genderOptions: string[];
  ageGroupOptions: string[];
  distanceOptions: readonly { value: string; label: string }[];
  sortOptions: readonly { value: string; label: string }[];
  onMatchState: (value: string) => void;
  onAudience: (value: string) => void;
  onHostGender: (value: string) => void;
  onHostAgeGroup: (value: string) => void;
  onGender: (value: string) => void;
  onAgeGroup: (value: string) => void;
  onDistance: (value: string) => void;
  onSort: (value: string) => void;
  onReset: () => void;
  locationStatus: "idle" | "loading" | "granted" | "denied" | "unavailable";
}) {
  const optionize = (
    options: readonly string[],
    labels: Partial<Record<string, string>> = {}
  ) => options.map((option) => ({ value: option, label: labels[option] || option }));
  const distanceSelectOptions = distanceOptions.map((option) => ({
    value: option.value,
    label:
      option.value === "all"
        ? "All Distance"
        : getDistanceOptionLabel(
            option.value as "nearby" | "within_5mi" | "within_10mi" | "within_20mi",
            distanceUnit
          ),
  }));

  const locationMessage =
    sort === "distance" || distance !== "all"
      ? locationStatus === "loading"
        ? "Finding nearby meetups..."
        : locationStatus === "denied"
          ? "Location is off."
          : locationStatus === "unavailable"
            ? "Distance unavailable."
            : locationStatus === "granted"
              ? "Nearby ready."
              : ""
      : "";

  return (
    <div className="-mx-4 sm:mx-0">
      <div className="overflow-x-auto border-y border-[#111111]/80 px-4 py-3 [scrollbar-width:none] sm:rounded-[8px] sm:border sm:bg-white sm:px-4 sm:shadow-none [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[8px] px-4 text-sm font-bold text-[#6f65d8] transition hover:bg-white"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <FilterSelect
            label="Host age"
            value={hostAgeGroup}
            options={optionize(ageGroupOptions, { All: "Host age" })}
            onChange={onHostAgeGroup}
          />
          <FilterSelect
            label="Host gender"
            value={hostGender}
            options={optionize(genderOptions, { All: "Host gender" })}
            onChange={onHostGender}
          />
          <FilterSelect
            label="Guest age"
            value={ageGroup}
            options={optionize(ageGroupOptions, { All: "Guest age" })}
            onChange={onAgeGroup}
          />
          <FilterSelect
            label="Guest gender"
            value={gender}
            options={optionize(genderOptions, { All: "Guest gender" })}
            onChange={onGender}
          />
          <FilterSelect
            label="Fits"
            value={audience}
            options={optionize(audienceOptions, { All: "All guests", "Fits me": "Fits me" })}
            onChange={onAudience}
          />
          <FilterSelect
            label="Distance"
            value={distance}
            options={distanceSelectOptions}
            onChange={onDistance}
          />
          <FilterSelect
            label="Status"
            value={matchState}
            options={optionize(matchStateOptions, { All: "All Status" })}
            onChange={onMatchState}
          />
          <FilterSelect
            label="Sort"
            value={sort}
            options={sortOptions}
            icon={<ArrowUpDown className="h-4 w-4" />}
            onChange={onSort}
          />
          {locationMessage ? (
            <span className={`shrink-0 px-2 text-xs font-medium ${APP_SUBTLE_TEXT_CLASS}`}>
              {locationMessage}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function HomePurposeRail({
  purpose,
  purposeOptions,
  onPurpose,
}: {
  purpose: string;
  purposeOptions: string[];
  onPurpose: (value: string) => void;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollRail = (direction: "left" | "right") => {
    railRef.current?.scrollBy({
      left: direction === "left" ? -420 : 420,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative -mx-4 sm:mx-0">
      <button
        type="button"
        aria-label="Previous meetup types"
        onClick={() => scrollRail("left")}
        className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[8px] bg-[#24323f] text-white shadow-none transition hover:bg-[#1b2630] sm:inline-flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <div
        ref={railRef}
        className="overflow-x-auto border-y border-[#111111]/80 px-4 py-3 [scrollbar-width:none] sm:border sm:bg-white sm:px-14 sm:shadow-none [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex min-w-max items-stretch gap-6 sm:gap-8 lg:gap-10">
          {purposeOptions.map((option) => {
            const active = purpose === option;
            const icon =
              option === "All" ? (
                <Search className="h-5 w-5" />
              ) : (
                getPurposeIcon(option, "h-5 w-5")
              );

            return (
              <button
                key={option}
                type="button"
                onClick={() => onPurpose(option)}
                className={`group relative flex w-[74px] shrink-0 flex-col items-center gap-2 px-1 pb-2 pt-1 text-center transition ${
                  active ? "text-[#111111]" : "text-[#444444] hover:text-[#43505a]"
                }`}
              >
                <span
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-[12px] border transition ${
                    active
                      ? "border-[#c5d0d8] bg-white shadow-none"
                      : "border-transparent bg-transparent"
                  }`}
                >
                  {icon}
                </span>
                <span className="line-clamp-2 min-h-[28px] text-[11px] font-semibold leading-[1.15]">
                  {option === "All" ? "All" : option}
                </span>
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-[8px] transition ${
                    active ? "bg-[#24323f]" : "bg-transparent"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        aria-label="Next meetup types"
        onClick={() => scrollRail("right")}
        className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-[8px] bg-[#24323f] text-white shadow-none transition hover:bg-[#1b2630] sm:inline-flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function FeaturedMeetupCard({
  className = "",
  postId,
  placeLabel,
  purposeIcon,
  purposeLabel,
  purposeCopy,
  timeLabel,
  placeText,
  targetText,
}: {
  className?: string;
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
    <section className={`overflow-hidden rounded-[8px] border border-[#111111] bg-white shadow-none  ${className}`}>
      <div className="border-b border-[#111111] px-5 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] ${APP_SUBTLE_TEXT_CLASS}`}>
              <Search className="h-3.5 w-3.5" />
              Featured moment
            </div>
            <div className="mt-1.5 text-[25px] font-black tracking-[-0.05em] text-[#111111]">
              {placeLabel}
            </div>
          </div>

          <Link
            href={buildPostPath(postId, purposeLabel, placeText || placeLabel)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-[8px] shadow-none transition ${APP_BUTTON_SECONDARY_CLASS}`}
            aria-label="Open featured meetup"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-2 px-4 py-3 sm:px-5 sm:py-4">
        <div className={`relative overflow-hidden px-4 py-3 text-[#111111] ${APP_INNER_PANEL_CLASS}`}>
          <div className={`inline-flex items-center gap-2 rounded-[8px] px-3 py-1 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            {purposeIcon}
            {purposeLabel}
          </div>

          <div className="mt-2 text-[25px] font-black leading-[0.98] tracking-[-0.05em]">
            {purposeCopy}
          </div>

          <div className={`mt-2 max-w-md text-sm ${APP_BODY_TEXT_CLASS}`}>
            A 1:1 social meetup with room to breathe.
          </div>
        </div>

        <div className="grid gap-2">
          <div className={`flex min-h-[38px] items-center gap-2.5 px-3 py-1.5 text-sm text-[#111111] ${APP_ROW_SURFACE_CLASS}`}>
            <Clock3 className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span>{timeLabel}</span>
          </div>

          <div className={`flex min-h-[38px] min-w-0 items-center gap-2.5 px-3 py-1.5 text-sm ${APP_ROW_SURFACE_CLASS}`}>
            <MapPin className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span className="min-w-0 flex-1 truncate font-semibold text-[#111111]">
              {placeText}
            </span>
          </div>

          <div className={`flex min-h-[38px] items-center gap-2.5 px-3 py-1.5 text-sm text-[#111111] ${APP_ROW_SURFACE_CLASS}`}>
            <Search className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
            <span className="truncate">{targetText}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MeetupFeedCard({
  postId,
  href,
  onClick,
  className = "",
  isExpired,
  hostName,
  hostLine,
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
  activityLabel = "Activity",
  activityText,
}: {
  postId: number;
  href?: string | null;
  onClick?: () => void;
  className?: string;
  isExpired: boolean;
  hostName: string;
  hostLine?: string;
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
  activityLabel?: string;
  activityText?: string;
}) {
  const cardClassName = `block w-full max-w-full overflow-hidden rounded-[8px] border p-2.5 shadow-none transition active:scale-[0.995] sm:p-3 ${
        isExpired
          ? "border-[#111111] bg-white"
          : "border-[#111111] bg-white hover:-translate-y-0.5 hover:shadow-none"
      } ${onClick ? "w-full cursor-pointer text-left" : ""} ${className}`;
  const resolvedHref =
    href === undefined ? buildPostPath(postId, purposeName, placeText) : href;
  const content = (
      <div className={`min-w-0 px-2.5 py-3 sm:px-3.5 ${APP_INNER_PANEL_CLASS}`}>
        <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 gap-y-1 sm:grid-cols-[46px_minmax(0,1fr)_auto] sm:gap-x-2.5">
          <div className="row-span-2 inline-flex h-10 w-10 items-center justify-center self-center rounded-[8px] border border-white/70 bg-white text-[#60717c] shadow-none -md sm:h-11 sm:w-11">
            {purposeIcon}
          </div>
          <div className="col-span-2 min-w-0 truncate pt-[1px] text-[22px] font-black leading-none tracking-[-0.05em] text-[#1f2b34] sm:text-[24px]">
            {placeText}
          </div>
          <div className="col-start-3 row-start-2 flex items-start justify-end self-start">
            <div
              className={`shrink-0 rounded-[14px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-none ${matchBadgeClassName}`}
            >
              {matchBadgeLabel}
            </div>
          </div>
          <div
            className={`col-start-2 row-start-2 min-w-0 pr-1 line-clamp-2 text-[12px] leading-[1.15] ${APP_SUBTLE_TEXT_CLASS}`}
          >
            {hostLine || (
              <>
                Hosted by {hostName}
              </>
            )}
          </div>
        </div>

        <div className="mt-2.5 grid min-w-0 gap-1.5">
          <div className={`flex min-h-[40px] min-w-0 items-center gap-2 px-2.5 py-1.5 text-sm text-[#364149] sm:gap-2.5 sm:px-3 ${APP_ROW_SURFACE_CLASS}`}>
            <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-[#55646e]">
              <UserRound className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span className="truncate font-semibold text-[#435760]">{lookingForText}</span>
            </span>
          </div>

          {whenText && (
            <div className={`flex min-h-[40px] min-w-0 items-center gap-2 px-2.5 py-1.5 text-sm text-[#364149] sm:gap-2.5 sm:px-3 ${APP_ROW_SURFACE_CLASS}`}>
              <Clock3 className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span className="min-w-0 flex-1 truncate">{whenText}</span>
              {durationLabel ? (
                <span className="ml-auto rounded-[14px] border border-[#111111] bg-white px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#3b4c56] shadow-none">
                  {durationLabel}
                </span>
              ) : null}
            </div>
          )}

          {amountText ? (
            <div className={`flex min-h-[40px] min-w-0 items-center justify-between gap-2 px-2.5 py-1.5 text-sm text-[#364149] sm:gap-2.5 sm:px-3 ${APP_ROW_SURFACE_CLASS}`}>
              <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-[#55646e]">
                <Coins className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
                <span className="truncate">Host covers</span>
              </span>
              <span className="shrink-0 font-semibold text-[#435760]">
                {amountText}
              </span>
            </div>
          ) : null}

          {distanceText && (
            <div className={`flex min-h-[40px] min-w-0 items-center gap-2 px-2.5 py-1.5 text-sm text-[#364149] sm:gap-2.5 sm:px-3 ${APP_ROW_SURFACE_CLASS}`}>
              <LocateFixed className={`h-4 w-4 shrink-0 ${APP_SUBTLE_TEXT_CLASS}`} />
              <span className="min-w-0 truncate">{distanceText}</span>
            </div>
          )}
        </div>

        <div className={`mt-2.5 flex items-center justify-between gap-3 rounded-[14px] px-3 py-1 ${APP_SOFT_CARD_CLASS}`}>
          <div className={`text-xs uppercase tracking-[0.16em] ${APP_SUBTLE_TEXT_CLASS}`}>
            {activityLabel}
          </div>
          <div className="ml-auto text-right text-sm font-semibold text-[#314454]">
            {activityText || getPurposeLabel(purposeName)}
          </div>
        </div>
      </div>
  );

  if (resolvedHref) {
    return (
      <Link href={resolvedHref} className={cardClassName}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cardClassName}>
        {content}
      </button>
    );
  }

  return (
    <div className={cardClassName}>
      {content}
    </div>
  );
}
