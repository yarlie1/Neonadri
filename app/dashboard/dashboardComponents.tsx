import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  Book,
  BookOpen,
  Cake,
  Camera,
  Clock3,
  Coins,
  Coffee,
  CookingPot,
  Dice5,
  Film,
  Footprints,
  Gamepad2,
  Laptop,
  MapPin,
  Mic,
  Sandwich,
  Smile,
  Target,
  Utensils,
  UserRound,
} from "lucide-react";
import { formatMeetingTime } from "../../lib/meetingTime";
import { getPublicLocationLabel } from "../../lib/locationPrivacy";
import type { PostRow } from "./page";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

export const SURFACE_CARD_CLASS =
  APP_SURFACE_CARD_CLASS;
export const SOFT_CARD_CLASS =
  APP_SOFT_CARD_CLASS;

export function getPurposeTheme(purpose: string | null) {
  const baseBandClass = `${APP_ROW_SURFACE_CLASS} text-[#24323f]`;

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
    case "Meal":
    case "Lunch":
    case "Dinner":
    case "Dessert":
    case "Walk":
    case "Jogging":
    case "Yoga":
    case "Movie":
    case "Theater":
    case "Karaoke":
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
    case "Study":
    case "Book Talk":
    case "Book":
    case "Work Together":
    case "Work":
    case "Photo Walk":
    case "Photo":
    default:
      return {
        bandClass: baseBandClass,
      };
  }
}

export function getPurposeIcon(purpose: string | null) {
  const className = "h-5 w-5 shrink-0 text-[#71828c]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={className} />;
    case "Meal":
      return <Utensils className={className} />;
    case "Lunch":
      return <Sandwich className={className} />;
    case "Dinner":
      return <CookingPot className={className} />;
    case "Dessert":
      return <Cake className={className} />;
    case "Walk":
      return <Footprints className={className} />;
    case "Jogging":
      return <Activity className={className} />;
    case "Yoga":
      return <Smile className={className} />;
    case "Movie":
    case "Theater":
      return <Film className={className} />;
    case "Karaoke":
      return <Mic className={className} />;
    case "Board Games":
      return <Dice5 className={className} />;
    case "Gaming":
    case "Bowling":
      return <Gamepad2 className={className} />;
    case "Arcade":
      return <Target className={className} />;
    case "Study":
      return <BookOpen className={className} />;
    case "Work Together":
    case "Work":
      return <Laptop className={className} />;
    case "Book Talk":
    case "Book":
      return <Book className={className} />;
    case "Photo Walk":
    case "Photo":
      return <Camera className={className} />;
    default:
      return <MapPin className={className} />;
  }
}

export function formatDuration(minutes: number | null) {
  if (!minutes) return "";
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}H`;
  if (minutes % 60 === 30) return `${Math.floor(hours)}.5H`;
  return `${minutes}M`;
}

export function getStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "cancelled") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#f0f3f5_100%)] text-[#6f7d86] border border-[#d7dde2]";
  }

  if (normalized === "expired") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#eff3f5_100%)] text-[#75828a] border border-[#d7dde2]";
  }

  if (normalized === "upcoming") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#edf3f7_100%)] text-[#4f6672] border border-[#d6e0e7]";
  }

  if (normalized === "open") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] text-[#536a75] border border-[#d4dfe6]";
  }

  if (normalized === "matched" || normalized === "accepted") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] text-[#536a75] border border-[#d4dfe6]";
  }

  if (normalized === "pending") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#eff3f5_100%)] text-[#75828a] border border-[#d7dde2]";
  }

  if (normalized === "rejected") {
    return "bg-[linear-gradient(180deg,#ffffff_0%,#f2f5f7_100%)] text-[#8a949b] border border-[#dce3e8]";
  }

  return "bg-[linear-gradient(180deg,#ffffff_0%,#eff3f5_100%)] text-[#75828a] border border-[#d7dde2]";
}

export function getPostMatchState(
  postStatus: "Upcoming" | "Expired" | "Cancelled",
  summary?: { isMatched: boolean }
) {
  if (postStatus === "Cancelled") {
    return "Cancelled";
  }

  if (summary?.isMatched) {
    return "Matched";
  }

  if (postStatus === "Expired") {
    return "Expired";
  }

  return "Open";
}

export function parseBenefitAmount(value: string | null) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

export function DashboardTabCard({
  active,
  label,
  value,
  subtext,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  value: number;
  subtext?: ReactNode;
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-[26px] border px-4 py-5 text-left transition ${
        active
          ? "border-[#b7c6d0] bg-[linear-gradient(180deg,#ffffff_0%,#d8e3ea_100%)] text-[#1c2a34] shadow-[0_20px_38px_rgba(118,126,133,0.18)] ring-1 ring-[#c8d4dc]"
          : "border-[#e0e7ec] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] text-[#2f3a42] hover:bg-[#f7fafb] hover:border-[#d3dde4]"
      }`}
    >
      {active ? (
        <span className="absolute right-4 top-4 inline-flex h-2.5 w-2.5 rounded-full bg-[#506873] shadow-[0_0_0_4px_rgba(255,255,255,0.62)]" />
      ) : null}
      <div className="flex min-h-[108px] flex-col sm:min-h-[120px]">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {label}
        </div>

        <div className="mt-auto">
          <div className="text-[36px] font-extrabold leading-none">{value}</div>
          <div className={`mt-2 min-h-[16px] text-xs ${active ? "text-[#4f6672]" : "opacity-80"}`}>
            {subtext || ""}
          </div>
        </div>
      </div>
    </button>
  );
}

export function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? `${APP_PILL_ACTIVE_CLASS} ring-1 ring-[#c6d1d8] shadow-[0_10px_18px_rgba(118,126,133,0.14)] text-[#22323d]`
          : `${APP_PILL_INACTIVE_CLASS} text-[#61717a]`
      }`}
    >
      {active ? <span className="h-1.5 w-1.5 rounded-full bg-[#435760] shadow-[0_0_0_3px_rgba(255,255,255,0.54)]" /> : null}
      {children}
    </button>
  );
}

export function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className={`${SOFT_CARD_CLASS} px-4 py-4`}>
      <div className={APP_EYEBROW_CLASS}>
        {eyebrow}
      </div>
      <div className="mt-2 text-lg font-black tracking-[-0.04em] text-[#24323f]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#66727a]">{body}</p>
    </div>
  );
}

export function CompactActionButton({
  href,
  onClick,
  disabled,
  primary = false,
  children,
}: {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: ReactNode;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
    primary
      ? APP_BUTTON_PRIMARY_CLASS
      : APP_BUTTON_SECONDARY_CLASS
  } ${disabled ? "opacity-50" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

export function DashboardCompactMeetupCard({
  post,
  timeZone,
  title,
  subtitle,
  badgeLabel,
  badgeClassName,
  onClick,
  className = "",
  actions,
}: {
  post?: PostRow;
  timeZone: string;
  title: string;
  subtitle?: string;
  badgeLabel: string;
  badgeClassName: string;
  onClick?: () => void;
  className?: string;
  actions?: ReactNode;
}) {
  if (!post) {
    return (
      <div className={`${SURFACE_CARD_CLASS} ${className} px-5 py-6 text-sm text-[#78848c]`}>
        Details unavailable.
      </div>
    );
  }

  const amount = parseBenefitAmount(post.benefit_amount);
  const durationLabel = formatDuration(post.duration_minutes);
  const postStatus = String(post.status || "open").toLowerCase();
  const isClosed = postStatus === "expired" || postStatus === "cancelled";
  const timeLabel = post.meeting_time
    ? formatMeetingTime(post.meeting_time, timeZone) || ""
    : "";
  const placeLabel =
    post.place_name || getPublicLocationLabel(post.place_name, post.location) || "No place";
  const guestLabel = `${post.target_gender || "Any"} / ${post.target_age_group || "Any"}`;

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`${SURFACE_CARD_CLASS} ${className} flex min-h-[250px] flex-col overflow-hidden p-4 text-left ${
        onClick ? "cursor-pointer transition hover:-translate-y-0.5 hover:border-[#cfdae1]" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="line-clamp-2 text-lg font-black leading-tight tracking-[-0.04em] text-[#24323f]">
            {title}
          </div>
          {subtitle ? (
            <div className="mt-1 truncate text-xs font-medium text-[#7b8992]">{subtitle}</div>
          ) : null}
        </div>

        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badgeClassName}`}>
          {badgeLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-2 text-sm font-medium text-[#43525b]">
        <div className={`${SOFT_CARD_CLASS} flex min-w-0 items-center gap-2 px-3 py-2`}>
          {getPurposeIcon(post.meeting_purpose)}
          <span className="min-w-0 truncate">{post.meeting_purpose || "Meetup"}</span>
        </div>

        <div className={`${SOFT_CARD_CLASS} flex min-w-0 items-center gap-2 px-3 py-2`}>
          <MapPin className="h-4 w-4 shrink-0 text-[#82919a]" />
          <span className="min-w-0 truncate">{placeLabel}</span>
        </div>

        <div className={`${SOFT_CARD_CLASS} flex min-w-0 items-center justify-between gap-2 px-3 py-2`}>
          <span className="flex min-w-0 items-center gap-2">
            <Clock3 className="h-4 w-4 shrink-0 text-[#82919a]" />
            <span className="min-w-0 truncate">{timeLabel || "Time TBD"}</span>
          </span>
          {durationLabel ? (
            <span className="shrink-0 rounded-full border border-[#d8e2e8] px-2 py-0.5 text-xs font-bold text-[#43525b]">
              {durationLabel}
            </span>
          ) : null}
        </div>

        <div className={`${SOFT_CARD_CLASS} flex min-w-0 items-center justify-between gap-2 px-3 py-2`}>
          <span className="flex min-w-0 items-center gap-2">
            <UserRound className="h-4 w-4 shrink-0 text-[#82919a]" />
            <span className="min-w-0 truncate">{guestLabel}</span>
          </span>
          {amount !== null ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#d8e2e8] px-2 py-0.5 text-xs font-bold text-[#43525b]">
              <Coins className="h-3.5 w-3.5" />
              ${amount.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>

      {actions ? (
        <div
          className="mt-auto flex flex-wrap gap-2 pt-4"
          onClick={(event) => event.stopPropagation()}
        >
          {actions}
        </div>
      ) : null}

      {isClosed ? <span className="sr-only">{postStatus}</span> : null}
    </div>
  );
}
