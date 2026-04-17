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

export const SURFACE_CARD_CLASS =
  "rounded-[30px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] shadow-[0_14px_32px_rgba(92,69,52,0.07)] backdrop-blur";
export const SOFT_CARD_CLASS =
  "rounded-[24px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)]";

export function getPurposeTheme(purpose: string | null) {
  const baseBandClass =
    "border border-[#eadfd2] bg-[linear-gradient(180deg,#fbf5ef_0%,#f3e8dc_100%)] text-[#2f261f]";

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
  const className = "h-5 w-5 shrink-0 text-[#7b7067]";

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
    return "bg-[#f4ece4] text-[#8b7f74] border border-[#e7ddd2]";
  }

  if (normalized === "upcoming") {
    return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
  }

  if (normalized === "open") {
    return "bg-[#eef7ee] text-[#4f8a54] border border-[#dce8dc]";
  }

  if (normalized === "matched" || normalized === "accepted") {
    return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
  }

  if (normalized === "pending") {
    return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
  }

  if (normalized === "rejected") {
    return "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]";
  }

  return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
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
          ? "bg-[linear-gradient(135deg,#b79f89_0%,#927763_100%)] border-[#b7a38f] text-white shadow-[0_16px_32px_rgba(120,76,52,0.18)]"
          : "bg-[#fcfaf7] border-[#e7ddd2] text-[#2f2a26] hover:bg-[#f6efe7]"
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
        active
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#6b5f52] hover:bg-[#ede3da]"
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
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
        {eyebrow}
      </div>
      <div className="mt-2 text-lg font-black tracking-[-0.04em] text-[#2f2a26]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#7a6b61]">{body}</p>
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
      ? "bg-[#a48f7a] text-white shadow-sm hover:bg-[#927d69]"
      : "border border-[#dccfc2] bg-[#fffdfa] text-[#5a5149] hover:bg-[#f4ece4]"
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
      <div className={`mt-3 ${SOFT_CARD_CLASS} px-4 py-3 text-sm text-[#8b7f74]`}>
        Post details unavailable
      </div>
    );
  }

  const amount = parseBenefitAmount(post.benefit_amount);
  const purposeTheme = getPurposeTheme(post.meeting_purpose);

  return (
    <div className="mt-3 rounded-[22px] border border-[#f1e4d8] bg-[linear-gradient(180deg,#fffdfa_0%,#fcfaf7_100%)] p-3">
      <div className="flex items-stretch gap-2">
        <div
          className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 ${purposeTheme.bandClass}`}
        >
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-[linear-gradient(180deg,#f7efe6_0%,#efe3d7_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
            {getPurposeIcon(post.meeting_purpose)}
          </div>
          <span className="truncate text-[1.02rem] font-black tracking-[-0.03em] text-[#2f261f]">
            {post.meeting_purpose || "Meetup"}
          </span>
        </div>

        {formatDuration(post.duration_minutes) ? (
          <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[#f4ece4] px-1.5 py-2 text-[#4f443b]">
            <Clock3 className="h-4 w-4" />
            <span className="mt-1 text-sm font-semibold">
              {formatDuration(post.duration_minutes)}
            </span>
          </div>
        ) : null}

        {amount !== null ? (
          <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[16px] bg-[linear-gradient(135deg,#ffe5b6_0%,#ffd18e_100%)] px-1.5 py-2 text-[#6e4715] shadow-sm">
            <Coins className="h-4 w-4 shrink-0" />
            <span className="mt-1 text-sm font-semibold">
              +${amount.toLocaleString()}
            </span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-[#7d7268] sm:grid-cols-2">
        {post.meeting_time && (
          <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
            <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
            <div className="min-w-0 leading-[1.2]">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                When
              </div>
              <div className="truncate text-[12px] font-medium text-[#554a42]">
                {formatMeetingTime(post.meeting_time, timeZone) || ""}
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
              Place
            </div>
            <div className="line-clamp-2 break-words text-[12px] font-medium text-[#554a42]">
              {post.place_name || post.location || "No place"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2 sm:col-span-2">
          <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
              Looking for
            </div>
            <div className="truncate text-[12px] font-medium text-[#554a42]">
              {post.target_gender || "Any"} / {post.target_age_group || "Any"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
