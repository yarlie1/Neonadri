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
  UserRound,
} from "lucide-react";
import { formatMeetingTime } from "../../lib/meetingTime";
import type { PostRow } from "./page";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_INNER_PANEL_CLASS,
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
  if (minutes === 60) return "1H";
  if (minutes === 90) return "1.5H";
  if (minutes === 120) return "2H";
  return `${minutes}m`;
}

export function getStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase();

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
  postStatus: "Upcoming" | "Expired",
  summary?: { isMatched: boolean }
) {
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

export function MiniPostPreview({
  post,
  timeZone,
  hostLine,
}: {
  post?: PostRow;
  timeZone: string;
  hostLine?: string;
}) {
  if (!post) {
    return (
      <div className={`mt-3 ${SOFT_CARD_CLASS} px-4 py-3 text-sm text-[#78848c]`}>
        Post details unavailable
      </div>
    );
  }

  const amount = parseBenefitAmount(post.benefit_amount);
  const durationLabel = formatDuration(post.duration_minutes);

  return (
    <div className={`mt-3 ${APP_INNER_PANEL_CLASS} p-3`}>
      <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-x-2.5 gap-y-0.5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] shadow-[0_8px_16px_rgba(118,126,133,0.1)] ${APP_ROW_SURFACE_CLASS}`}>
          {getPurposeIcon(post.meeting_purpose)}
        </div>
        <div className="min-w-0 self-center truncate pt-[1px] text-[24px] font-black leading-none tracking-[-0.05em] text-[#1f2b34]">
          {post.meeting_purpose || "Meetup"}
        </div>
        {hostLine ? (
          <div className="col-span-2 min-w-0 pl-[50px] pr-1 text-[12px] leading-[1.15] text-[#849099]">
            {hostLine}
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2">
        {post.meeting_time && (
          <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
            <Clock3 className="h-4 w-4 shrink-0 text-[#7a8b95]" />
            <span className="truncate">{formatMeetingTime(post.meeting_time, timeZone) || ""}</span>
            {durationLabel ? (
              <span className="ml-auto rounded-[14px] border border-[#cbd4db] bg-[linear-gradient(180deg,#ffffff_0%,#eceff2_100%)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#3b4c56] shadow-[0_8px_14px_rgba(118,126,133,0.12)]">
                {durationLabel}
              </span>
            ) : null}
          </div>
        )}

        <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
          <MapPin className="h-4 w-4 shrink-0 text-[#7a8b95]" />
          <span className="min-w-0 flex-1 break-words line-clamp-2">{post.place_name || post.location || "No place"}</span>
        </div>

        <div className={`flex min-h-[56px] items-center justify-between gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
          <span className="inline-flex min-w-0 items-center gap-2 text-[#55646e]">
            <UserRound className="h-4 w-4 shrink-0 text-[#7a8b95]" />
            <span className="truncate">{post.target_gender || "Any"} / {post.target_age_group || "Any"}</span>
          </span>
          {amount !== null ? (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-[14px] border border-[#c7d2da] bg-[linear-gradient(180deg,#ffffff_0%,#ebf0f4_100%)] px-3 py-1.5 font-semibold text-[#435760] shadow-[0_10px_18px_rgba(118,126,133,0.12)]">
              <Coins className="h-4 w-4 text-[#7a8b95]" />
              Cost support ${amount.toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>

      <div className={`mt-3 flex items-center justify-between gap-3 rounded-[16px] px-3.5 py-2 ${APP_SOFT_CARD_CLASS}`}>
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a949b]">
          Refined mode
        </span>
        <span className="truncate text-sm font-semibold text-[#314454]">
          {post.meeting_purpose || "Meetup"}
        </span>
      </div>
    </div>
  );
}
