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
  const baseBandClass =
    "border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#24323f]";

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
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
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
      className={`w-full rounded-[26px] border px-4 py-5 text-left transition ${
        active
          ? "border-[#c7d2d9] bg-[linear-gradient(180deg,#ffffff_0%,#e0e8ed_100%)] text-[#1f2e38] shadow-[0_16px_32px_rgba(118,126,133,0.14)]"
          : "border-[#e0e7ec] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] text-[#2f3a42] hover:bg-[#f7fafb]"
      }`}
    >
      <div className="flex min-h-[108px] flex-col sm:min-h-[120px]">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {label}
        </div>

        <div className="mt-auto">
          <div className="text-[36px] font-extrabold leading-none">{value}</div>
          <div className="mt-2 min-h-[16px] text-xs opacity-80">{subtext || ""}</div>
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
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
      }`}
    >
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
}: {
  post?: PostRow;
  timeZone: string;
}) {
  if (!post) {
    return (
      <div className={`mt-3 ${SOFT_CARD_CLASS} px-4 py-3 text-sm text-[#78848c]`}>
        Post details unavailable
      </div>
    );
  }

  const amount = parseBenefitAmount(post.benefit_amount);
  const purposeTheme = getPurposeTheme(post.meeting_purpose);

  return (
    <div className={`mt-3 ${APP_INNER_PANEL_CLASS} p-3`}>
      <div className="flex items-stretch gap-2">
        <div
          className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 ${purposeTheme.bandClass}`}
        >
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
            {getPurposeIcon(post.meeting_purpose)}
          </div>
          <span className="truncate text-[1.02rem] font-black tracking-[-0.03em] text-[#24323f]">
            {post.meeting_purpose || "Meetup"}
          </span>
        </div>

        {formatDuration(post.duration_minutes) ? (
          <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[16px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)] px-1.5 py-2 text-[#52616a] shadow-[0_8px_16px_rgba(118,126,133,0.08)]">
            <Clock3 className="h-4 w-4" />
            <span className="mt-1 text-sm font-semibold">
              {formatDuration(post.duration_minutes)}
            </span>
          </div>
        ) : null}

        {amount !== null ? (
          <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[16px] border border-[#ccd6dd] bg-[linear-gradient(180deg,#ffffff_0%,#e7eef3_100%)] px-1.5 py-2 text-[#435760] shadow-[0_8px_16px_rgba(118,126,133,0.1)]">
            <Coins className="h-4 w-4 shrink-0 text-[#758893]" />
            <span className="mt-1 text-sm font-semibold">
              +${amount.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-[#6f7a82] sm:grid-cols-2">
        {post.meeting_time && (
          <div className={`flex items-start gap-2 ${APP_ROW_SURFACE_CLASS} px-3 py-2`}>
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7a8b95]" />
            <div className="min-w-0 leading-[1.2]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#849099]">
                When
              </div>
              <div className="truncate text-[12px] font-medium text-[#3c4850]">
                {formatMeetingTime(post.meeting_time, timeZone) || ""}
              </div>
            </div>
          </div>
        )}

        <div className={`flex min-w-0 items-start gap-2 ${APP_ROW_SURFACE_CLASS} px-3 py-2`}>
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7a8b95]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#849099]">
              Place
            </div>
            <div className="line-clamp-2 break-words text-[12px] font-medium text-[#3c4850]">
              {post.place_name || post.location || "No place"}
            </div>
          </div>
        </div>

        <div className={`flex items-start gap-2 ${APP_ROW_SURFACE_CLASS} px-3 py-2 sm:col-span-2`}>
          <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#7a8b95]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#849099]">
              Looking for
            </div>
            <div className="truncate text-[12px] font-medium text-[#3c4850]">
              {post.target_gender || "Any"} / {post.target_age_group || "Any"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
