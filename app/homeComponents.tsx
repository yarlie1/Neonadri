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
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
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
  sort: string;
  matchStateOptions: string[];
  audienceOptions: readonly string[];
  purposeOptions: string[];
  genderOptions: string[];
  ageGroupOptions: string[];
  distanceOptions: readonly { value: string; label: string }[];
  sortOptions: readonly { value: string; label: string }[];
  onMatchState: (value: string) => void;
  onAudience: (value: string) => void;
  onPurpose: (value: string) => void;
  onGender: (value: string) => void;
  onAgeGroup: (value: string) => void;
  onDistance: (value: string) => void;
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
  sort,
  matchStateOptions,
  audienceOptions,
  purposeOptions,
  genderOptions,
  ageGroupOptions,
  distanceOptions,
  sortOptions,
  onMatchState,
  onAudience,
  onPurpose,
  onGender,
  onAgeGroup,
  onDistance,
  onSort,
  onReset,
  locationStatus,
}: HomeFilterCardProps) {
  return (
    <div
      className={`rounded-[28px] transition ${
        isPinned
          ? "border border-[#eadfd3] bg-[linear-gradient(180deg,#fffdf9_0%,#faf1e8_100%)] shadow-[0_18px_40px_rgba(92,69,52,0.12)]"
          : "border border-[#eadfd3] bg-[linear-gradient(180deg,#fffdf9_0%,#fbf3eb_100%)] shadow-[0_8px_20px_rgba(92,69,52,0.04)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:py-4"
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2f2a26]">
            <SlidersHorizontal className="h-4 w-4" />
            Shape your mood
          </div>
          <div className="mt-2">{summaryText}</div>
        </div>

        <span
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e7ddd2] bg-[linear-gradient(180deg,#fffdf9_0%,#f5e8dc_100%)] text-[#6b5f52] shadow-sm transition ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4" />
        </span>
      </button>

      {isOpen && (
        <div className="max-h-[calc(100vh-14rem)] overflow-y-auto border-t border-[#efe6db] px-4 py-4 pb-6 sm:pb-5">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
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
              Distance
            </div>
            <div className="flex flex-wrap gap-2">
              {distanceOptions.map((option) => (
                <FilterPill
                  key={option.value}
                  active={distance === option.value}
                  label={option.label}
                  onClick={() => onDistance(option.value)}
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
              <div className="mt-3 text-xs text-[#8b7f74]">
                {locationStatus === "loading" && "Getting your location..."}
                {locationStatus === "denied" &&
                  "Location permission denied. Distance filters may not be accurate."}
                {locationStatus === "unavailable" &&
                  "Location is unavailable on this device/browser."}
                {locationStatus === "granted" &&
                  "Using your current location."}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
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
    <section className="overflow-hidden rounded-[32px] border border-[#eee2d6] bg-[linear-gradient(180deg,rgba(255,253,250,0.97)_0%,rgba(250,244,237,0.94)_100%)] shadow-[0_24px_70px_rgba(86,63,44,0.12)] backdrop-blur">
      <div className="border-b border-[#efe2d5] px-5 py-[18px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
              <Search className="h-3.5 w-3.5" />
              Featured vibe
            </div>
            <div className="mt-1 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
              {placeLabel}
            </div>
          </div>

          <Link
            href={`/posts/${postId}`}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#eaded2] bg-[linear-gradient(180deg,#fffdfa_0%,#f6ede4_100%)] text-[#6f5649] shadow-[0_6px_14px_rgba(109,78,57,0.05)] transition hover:bg-[#f7efe7]"
            aria-label="Open featured meetup"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-[1.4fr_1fr] sm:px-5">
        <div className="rounded-[26px] border border-[#ebe0d4] bg-[linear-gradient(180deg,#f8f0e8_0%,#f2e7dc_100%)] px-4 py-4 text-[#302720] shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#eee1d6] bg-[linear-gradient(180deg,#faf5ef_0%,#f1e6db_100%)] px-3 py-1.5 text-xs font-medium text-[#6e5b4e]">
            {purposeIcon}
            {purposeLabel}
          </div>

          <div className="mt-4 text-2xl font-black leading-[1.02] tracking-[-0.04em]">
            {purposeCopy}
          </div>

          <div className="mt-2 text-sm leading-6 text-[#6a5d54]">
            Low-pressure social energy with a clear plan, time, and place.
          </div>
        </div>

        <div className="space-y-2.5 rounded-[24px] border border-[#efe4d9] bg-[linear-gradient(180deg,#fffdfb_0%,#f7efe7_100%)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
          <div className="flex items-center gap-2 text-sm text-[#5a5149]">
            <Clock3 className="h-4 w-4 text-[#a27767]" />
            <span>{timeLabel}</span>
          </div>

          <div className="flex min-w-0 items-start gap-2 text-sm text-[#5a5149]">
            <MapPin className="mt-0.5 h-4 w-4 text-[#a27767]" />
            <span className="block min-w-0 flex-1 break-words line-clamp-2">
              {placeText}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#5a5149]">
            <Search className="h-4 w-4 text-[#a27767]" />
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
  purposeBandClass,
  purposeIconWrapClass,
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
  purposeBandClass: string;
  purposeIconWrapClass: string;
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
      className={`block overflow-hidden rounded-[32px] border p-[14px] shadow-[0_20px_48px_rgba(92,69,52,0.10)] transition active:scale-[0.995] sm:p-4 ${
        isExpired
          ? "border-[#ddd2c5] bg-[linear-gradient(180deg,#f4efe9_0%,#eee6dd_100%)] opacity-80"
          : "border-[#e8ddd2] bg-[linear-gradient(180deg,#fffdfb_0%,#fbf3eb_100%)] hover:-translate-y-0.5"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0 rounded-full border border-[#efe4da] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.3125rem] text-[11px] font-medium leading-none tracking-[0.02em] text-[#74675d]">
          <div className="truncate">{hostName}</div>
        </div>

        <div
          className={`rounded-full px-3 py-[0.3125rem] text-[11px] font-medium leading-none tracking-[0.02em] ${matchBadgeClassName}`}
        >
          {matchBadgeLabel}
        </div>
      </div>

      <div className="rounded-[26px] border border-[#efe2d5] bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e8_100%)] p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
        <div className="flex items-stretch gap-2">
          <div
            className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[20px] px-4 py-3 ${purposeBandClass} shadow-[0_10px_20px_rgba(64,45,33,0.06)]`}
          >
            <div
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${purposeIconWrapClass}`}
            >
              {purposeIcon}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[1.18rem] font-black tracking-[-0.03em] text-[#2f261f] sm:text-[1.28rem]">
                {purposeName}
              </div>
            </div>
          </div>

          {durationLabel ? (
            <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[18px] border border-[#eee4d9] bg-[linear-gradient(180deg,#fffdfb_0%,#f6eee6_100%)] px-1.5 py-2 text-[#5d5147] shadow-[0_4px_10px_rgba(86,65,47,0.04)]">
              <Clock3 className="h-4 w-4" />
              <span className="mt-1 text-sm font-semibold">{durationLabel}</span>
            </div>
          ) : null}

          {amountText ? (
            <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[18px] border border-[#efdcb8] bg-[linear-gradient(180deg,#f9ebcb_0%,#f3dba9_100%)] px-1.5 py-2 text-[#795527] shadow-[0_4px_10px_rgba(160,112,44,0.07)]">
              <Coins className="h-4 w-4 shrink-0" />
              <span className="mt-1 text-sm font-semibold">{amountText}</span>
            </div>
          ) : null}
        </div>

        <div className="mt-3 grid gap-2.5 text-[#7d7268] sm:grid-cols-2">
          {whenText && (
            <div className="flex items-start gap-2 rounded-[18px] border border-[#f1e6dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
              <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
              <div className="min-w-0 leading-[1.2]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                  When
                </div>
                <div className="truncate text-[12px] font-medium text-[#554a42]">
                  {whenText}
                </div>
              </div>
            </div>
          )}

          <div className="flex min-w-0 items-start gap-2 rounded-[18px] border border-[#f1e6dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
            <div className="min-w-0 leading-[1.2]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                Place
              </div>
              <div className="block truncate text-[12px] font-medium text-[#554a42]">
                {placeText}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[18px] border border-[#f1e6dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            <UserCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
            <div className="min-w-0 leading-[1.2]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                Hosted by
              </div>
              <div className="truncate text-[12px] font-medium text-[#554a42]">
                {hostName}
                {hostMeta ? ` - ${hostMeta}` : ""}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[18px] border border-[#f1e6dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)]">
            <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
            <div className="min-w-0 leading-[1.2]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                Looking for
              </div>
              <div className="truncate text-[12px] font-medium text-[#554a42]">
                {lookingForText}
              </div>
            </div>
          </div>

          {distanceText && (
            <div className="flex items-start gap-2 rounded-[18px] border border-[#f1e6dc] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.68)] sm:col-span-2">
              <LocateFixed className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
              <div className="leading-[1.2]">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                  Distance
                </div>
                <div className="text-[12px] font-medium text-[#554a42]">
                  {distanceText}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
