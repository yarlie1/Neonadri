import Link from "next/link";
import type { ReactNode } from "react";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_MUTED_TEXT_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
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
  HeartHandshake,
  Laptop,
  Languages,
  MapPin,
  MessageSquare,
  MessageSquareText,
  Mic,
  Smile,
  Sparkles,
  Star,
  Target,
  UserRound,
  Utensils,
} from "lucide-react";

export type ReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
};

export type MatchReviewRow = {
  id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_user_id: string;
  reviewee_user_id: string;
};

export type ProfileCardData = {
  userId: string;
  displayName: string;
  aboutMe: string;
  gender: string;
  ageGroup: string;
  languages: string[];
  meetingStyle: string;
  interests: string[];
  responseNote: string;
  averageRating: number;
  reviewCount: number;
  completedMeetups: number;
  attendanceRate: number | null;
  attendanceCount: number;
  hostReliabilityRate: number | null;
  hostReliabilityCount: number;
  recentReviews: ReviewRow[];
};

export type PostRow = {
  id: number;
  user_id: string;
  created_at: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  target_gender: string | null;
  target_age_group: string | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number | null;
  longitude: number | null;
};

const PURPOSE_ICON_CLASS = "h-[19px] w-[19px] shrink-0 text-[#71828c]";

export const getPurposeIcon = (purpose: string | null, className?: string) => {
  const iconClassName = className || PURPOSE_ICON_CLASS;

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
      return <Sparkles className={iconClassName} />;
  }
};

export const getPurposeTheme = (_purpose: string | null) => ({
  bandClass:
    "border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#24323f]",
});

export const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}H`;
  return `${hours.toFixed(1).replace(/\.0$/, "")}H`;
};

function StarRating({
  value,
  size = "sm",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const iconClass = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= value;

        return (
          <Star
            key={n}
            className={`${iconClass} ${
              filled
                ? "fill-[#71828c] text-[#71828c]"
                : "text-[#d3dce2]"
            }`}
          />
        );
      })}
    </div>
  );
}
function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-3 shadow-[0_10px_18px_rgba(118,126,133,0.07),inset_0_1px_0_rgba(255,255,255,0.98)]">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[#849099]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium leading-6 text-[#3c4850]">
        {value}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-[#e3e9ee] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-4 text-center shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#24323f]">
        {value}
      </div>
    </div>
  );
}

function TrustStatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] shadow-[0_10px_18px_rgba(118,126,133,0.07),inset_0_1px_0_rgba(255,255,255,0.98)] px-4 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#52616a]">{value}</div>
      <div className="mt-0.5 text-[11px] text-[#849099]">{detail}</div>
    </div>
  );
}

export function ProfileShowcaseCard({
  title,
  subtitle,
  profileHref,
  data,
  isCurrentUser = false,
  compact = false,
  summaryOnly = false,
}: {
  title: string;
  subtitle: string;
  profileHref?: string;
  data: ProfileCardData;
  isCurrentUser?: boolean;
  compact?: boolean;
  summaryOnly?: boolean;
}) {
  const hasAboutMe = !!data.aboutMe.trim();
  const hasLanguages = data.languages.length > 0;
  const hasMeetingStyle = !!data.meetingStyle.trim();
  const hasInterests = data.interests.length > 0;
  const hasResponseNote = !!data.responseNote.trim();
  const summary = hasAboutMe
    ? data.aboutMe.replace(/\s+/g, " ").trim().length <= 140
      ? data.aboutMe.replace(/\s+/g, " ").trim()
      : `${data.aboutMe.replace(/\s+/g, " ").trim().slice(0, 137).trimEnd()}...`
    : "No introduction yet.";
  const roundedAverage = Math.round(data.averageRating);
  const hasRating = data.reviewCount > 0;
  const identityLine = `${data.gender || "Unknown"}${
    data.gender && data.ageGroup ? " / " : ""
  }${data.ageGroup || ""}`;

  const cardContent = summaryOnly ? (
    <div className={`${APP_SURFACE_CARD_CLASS} px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(118,126,133,0.14)]`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
            {title}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="truncate text-[1.15rem] font-black tracking-[-0.03em] text-[#24323f]">
              {data.displayName}
            </div>
            {hasRating ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2.5 py-1 text-[11px] font-medium text-[#5f7480]">
                <Star className="h-3.5 w-3.5 fill-current text-[#71828c]" />
                {data.averageRating.toFixed(1)}
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2.5 py-1 text-[11px] font-medium text-[#5f7480]">
                No reviews yet
              </span>
            )}
            {isCurrentUser && (
              <span className="rounded-full border border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#6b7b84]">
                You
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-[#52616a]">{identityLine}</div>
        </div>
      </div>
    </div>
  ) : (
    <div className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-6 py-6`}>
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#cfd8de]/35 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
              {title}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#ffffff,_#d9e1e6_78%)] text-lg font-bold text-[#24323f] shadow-[0_12px_24px_rgba(118,126,133,0.15)]">
                {data.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="block truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#24323f] underline-offset-4 transition hover:text-[#52616a] hover:underline"
                    >
                      {data.displayName}
                    </Link>
                  ) : (
                    <div className="truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#24323f]">
                      {data.displayName}
                    </div>
                  )}
                  {isCurrentUser && (
                    <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7b84]">
                      You
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-[#66727a]">{subtitle}</div>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-[#52616a] backdrop-blur">
            {hasRating
              ? `${data.averageRating.toFixed(1)} rating / ${data.reviewCount} reviews`
              : "No reviews yet"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(data.gender || data.ageGroup) && (
            <InfoItem
              icon={<UserRound className="h-3.5 w-3.5 text-[#71828c]" />}
              label={title.includes("Guest") ? "Guest" : "Host"}
              value={identityLine}
            />
          )}
          {hasLanguages && (
            <InfoItem
              icon={<Languages className="h-3.5 w-3.5 text-[#71828c]" />}
              label="Languages"
              value={data.languages.join(", ")}
            />
          )}
          {hasMeetingStyle && (
            <InfoItem
              icon={<HeartHandshake className="h-3.5 w-3.5 text-[#71828c]" />}
              label="Meeting Style"
              value={data.meetingStyle}
            />
          )}
          {hasResponseNote && (
            <InfoItem
              icon={<Clock3 className="h-3.5 w-3.5 text-[#71828c]" />}
              label="Response Note"
              value={data.responseNote}
            />
          )}
        </div>

        <div className={`mt-4 ${APP_SOFT_CARD_CLASS} px-4 py-4`}>
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#71828c]" />
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#849099]">
                About Me
              </div>
              <div className={`mt-2 text-[15px] leading-7 ${APP_MUTED_TEXT_CLASS}`}>{summary}</div>
            </div>
          </div>
        </div>

        {!compact && hasInterests && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#849099]">
              <Sparkles className="h-3.5 w-3.5 text-[#71828c]" />
              Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-3 py-1.5 text-xs font-medium text-[#52616a]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className={`${APP_SOFT_CARD_CLASS} p-3 text-center`}>
            <div className="text-xs text-[#849099]">Rating</div>
            {hasRating ? (
              <>
                <div className="mt-1 text-xl font-bold text-[#24323f]">{data.averageRating.toFixed(1)}</div>
                <div className="mt-1 flex justify-center">
                  <StarRating value={roundedAverage} size="sm" />
                </div>
              </>
            ) : (
              <div className="mt-2 text-sm font-semibold text-[#52616a]">No reviews yet</div>
            )}
          </div>
          <div className={`${APP_SOFT_CARD_CLASS} p-3 text-center`}>
            <div className="text-xs text-[#849099]">Reviews</div>
            <div className="mt-2 text-xl font-bold text-[#24323f]">{data.reviewCount}</div>
          </div>
          <div className={`${APP_SOFT_CARD_CLASS} p-3 text-center`}>
            <div className="text-xs text-[#849099]">Meetups</div>
            <div className="mt-2 text-xl font-bold text-[#24323f]">{data.completedMeetups}</div>
          </div>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <TrustStatCard
            label="Attendance"
            value={
              data.attendanceRate === null
                ? "No data yet"
                : `${Math.round(data.attendanceRate * 100)}%`
            }
            detail={
              data.attendanceCount > 0
                ? `Based on ${data.attendanceCount} meetup reviews`
                : "Not enough meetup reviews yet"
            }
          />
          <TrustStatCard
            label="Payout reliability"
            value={
              data.hostReliabilityRate === null
                ? "No data yet"
                : `${Math.round(data.hostReliabilityRate * 100)}%`
            }
            detail={
              data.hostReliabilityCount > 0
                ? `Based on ${data.hostReliabilityCount} host payout reviews`
                : "No host payout reviews yet"
            }
          />
        </div>

        {!compact && (
          <div className={`mt-4 ${APP_SOFT_CARD_CLASS} px-4 py-4`}>
            <div className="text-sm font-semibold text-[#24323f]">Recent Reviews</div>
            <div className="mt-3 space-y-3">
              {data.recentReviews.length === 0 ? (
                <div className="text-sm text-[#849099]">No reviews yet.</div>
              ) : (
                data.recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className={`${APP_ROW_SURFACE_CLASS} px-3 py-3`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StarRating value={review.rating} size="md" />
                      <div className="text-[11px] text-[#849099]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#52616a]">
                      {review.review_text || "No comment."}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return profileHref && summaryOnly ? (
    <Link href={profileHref} className="block">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
}

export function UpcomingMeetupCard({
  isPostMatched,
  isViewerParticipant,
  meetupFinished,
  purposeTheme,
  post,
  meetupTimeLabel,
  meetupCountdown,
}: {
  isPostMatched: boolean;
  isViewerParticipant: boolean;
  meetupFinished: boolean;
  purposeTheme: { bandClass: string };
  post: PostRow;
  meetupTimeLabel: string;
  meetupCountdown: string | null;
}) {
  if (!(isPostMatched && isViewerParticipant && !meetupFinished)) {
    return null;
  }

  return (
    <div className={`${APP_SURFACE_CARD_CLASS} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className={APP_EYEBROW_CLASS}>
            Upcoming meetup
          </div>
          <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#24323f]">
            Upcoming matched meetup
          </div>
          <div className={`mt-2 text-sm leading-6 ${APP_MUTED_TEXT_CLASS}`}>
            Your next confirmed plan for this meetup.
          </div>
        </div>
      </div>

      <div className={`mt-4 ${APP_INNER_PANEL_CLASS} p-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm ${purposeTheme.bandClass}`}
          >
            {getPurposeIcon(post.meeting_purpose)}
            {post.meeting_purpose || "Meetup"}
          </div>

          <div className={`${APP_PILL_INACTIVE_CLASS} px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.12em]`}>
            Matched
          </div>
        </div>

        <div className={`mt-3 ${APP_ROW_SURFACE_CLASS} px-4 py-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#24323f]">
              <Clock3 className="h-4 w-4 shrink-0 text-[#71828c]" />
              <span className="truncate">{meetupTimeLabel}</span>
            </div>
            <div className="shrink-0 rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#5f7480]">
              {meetupCountdown || "Soon"}
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#52616a]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#71828c]" />
            <span className="min-w-0 break-words line-clamp-2">
              {post.place_name || post.location || "Selected place"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MeetupOverviewCard({
  isPostMatched,
  purposeTheme,
  post,
  meetupDurationLabel,
  benefitExplanation,
  hostIdentityLabel,
  targetLabel,
  ownerName,
  meetupTimeLabel,
  mapUrl,
  distanceNote,
  placeDisplay,
  locationDisplay,
  locationHeading,
  locationPrivacyNote,
}: {
  isPostMatched: boolean;
  purposeTheme: { bandClass: string };
  post: PostRow;
  meetupDurationLabel: string;
  benefitExplanation: string;
  hostIdentityLabel: string;
  targetLabel: string;
  ownerName: string;
  meetupTimeLabel: string;
  mapUrl: string;
  distanceNote?: ReactNode;
  placeDisplay: string;
  locationDisplay: string;
  locationHeading: string;
  locationPrivacyNote: string | null;
}) {
  return (
    <div className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-6 py-6`}>
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/42 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#cfd8de]/35 blur-2xl" />
      <div className="relative">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className={APP_EYEBROW_CLASS}>Meetup overview</div>
            <span className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6b7b84]">
              {isPostMatched ? "Matched" : "Open"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-stretch gap-3">
            <div
              className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 shadow-[0_10px_20px_rgba(118,126,133,0.09)] ${purposeTheme.bandClass}`}
            >
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-[linear-gradient(180deg,#ffffff_0%,#e2e9ee_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  {getPurposeIcon(
                    post.meeting_purpose,
                    "h-[18px] w-[18px] shrink-0 text-[#71828c]"
                  )}
                </div>
              <div className="min-w-0">
                <div className="truncate text-[1.18rem] font-black tracking-[-0.03em] text-[#24323f] sm:text-[1.28rem]">
                  {post.meeting_purpose || "Meetup"}
                </div>
              </div>
            </div>
            <div className="inline-flex w-[72px] shrink-0 flex-col items-center justify-center rounded-[16px] border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2 py-2 text-center text-[#52616a] shadow-sm">
              <Clock3 className="h-3.5 w-3.5 text-[#7e8d96]" />
              <span className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-[#23333d]">
                {meetupDurationLabel}
              </span>
            </div>
            <div className="inline-flex w-[72px] shrink-0 flex-col items-center justify-center rounded-[16px] border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2 py-2 text-center text-[#52616a] shadow-sm">
              <Coins className="h-3.5 w-3.5 text-[#7e8d96]" />
              <span className="mt-1 text-sm font-extrabold leading-tight tracking-[-0.03em] text-[#23333d]">
                {post.benefit_amount || "N/A"}
              </span>
            </div>
          </div>
          <p className={`mt-3 max-w-2xl text-sm leading-6 sm:text-[15px] ${APP_MUTED_TEXT_CLASS}`}>
            {benefitExplanation}
          </p>
          <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm ${APP_MUTED_TEXT_CLASS}`}>
            <span>Looking for {targetLabel}</span>
            <span>Hosted by {ownerName}</span>
          </div>
        </div>

        <div className={`mt-5 ${APP_INNER_PANEL_CLASS} px-4 py-4`}>
          <div className={APP_EYEBROW_CLASS}>Quick snapshot</div>
          <div className="grid grid-cols-1 gap-3">
            <StatCard label="Host" value={hostIdentityLabel} />
            <StatCard label="Guest" value={targetLabel} />
            <StatCard label="When" value={meetupTimeLabel} />
            <StatCard label="Place" value={placeDisplay} />
          </div>
        </div>

        <div className={`mt-5 ${APP_INNER_PANEL_CLASS} px-4 py-4`}>
          <div className="flex items-center justify-between gap-3">
            <div className={APP_EYEBROW_CLASS}>Location</div>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex shrink-0 items-center gap-2 rounded-full ${APP_BUTTON_SECONDARY_CLASS} px-3 py-1.5 text-[11px] font-medium transition`}
              >
                Open in Maps
              </a>
            )}
          </div>
          <div className="mt-3 text-[15px] text-[#52616a]">
            <div className="space-y-3">
              {locationDisplay && (
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#71828c]" />
                    <div className="text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-[#849099]">
                      {locationHeading}
                    </div>
                  </div>
                  <div className="mt-1 pl-6 line-clamp-3">{locationDisplay}</div>
                  {locationPrivacyNote ? (
                    <div className="mt-2 pl-6 text-xs leading-5 text-[#859199]">
                      {locationPrivacyNote}
                    </div>
                  ) : null}
                </div>
              )}
              {distanceNote}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchReviewPanel({
  isPostMatched,
  isViewerParticipant,
  matchedRecordId,
  canLeaveReview,
  meetupFinished,
  viewerHasReview,
  matchReviews,
  getMatchReviewAuthorLabel,
}: {
  isPostMatched: boolean;
  isViewerParticipant: boolean;
  matchedRecordId?: number | null;
  canLeaveReview: boolean;
  meetupFinished: boolean;
  viewerHasReview: boolean;
  matchReviews: MatchReviewRow[];
  getMatchReviewAuthorLabel: (review: MatchReviewRow) => string;
}) {
  if (!(isPostMatched && isViewerParticipant && matchedRecordId)) {
    return null;
  }

  return (
    <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={APP_EYEBROW_CLASS}>
            Reviews
          </div>
          <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#24323f]">
            Match review
          </div>
        </div>
        {canLeaveReview && (
          <Link
            href={`/reviews/write/${matchedRecordId}`}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full ${APP_BUTTON_SECONDARY_CLASS} px-4 py-2 text-sm font-medium transition`}
          >
            <Star className="h-4 w-4 text-[#71828c]" />
            Leave Review
          </Link>
        )}
      </div>

      <div
        className={`mt-4 ${APP_SOFT_CARD_CLASS} px-4 py-3 text-sm leading-6 ${APP_MUTED_TEXT_CLASS}`}
      >
        {meetupFinished
          ? viewerHasReview
            ? "You already submitted your review for this meetup."
            : matchReviews.length > 0
            ? "Reviews from this matched meetup are shown below."
            : "This meetup is complete. You can leave a review now."
          : "This meetup is still upcoming. Reviews open after it is completed."}
      </div>

      {matchReviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {matchReviews.map((review) => (
            <div
              key={review.id}
              className={`${APP_ROW_SURFACE_CLASS} px-4 py-3`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#849099]">
                    {getMatchReviewAuthorLabel(review)}
                  </div>
                  <div className="mt-1">
                    <StarRating value={review.rating} size="sm" />
                  </div>
                </div>
                <div className="text-xs text-[#849099]">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[#3c4850]">
                {review.review_text || "No written comment."}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MatchedChatPanel({
  isPostMatched,
  isViewerParticipant,
  matchedRecordId,
  hasNewChatMessage,
  meetupFinished,
  chatClosed,
}: {
  isPostMatched: boolean;
  isViewerParticipant: boolean;
  matchedRecordId?: number | null;
  hasNewChatMessage: boolean;
  meetupFinished: boolean;
  chatClosed: boolean;
}) {
  if (!(isPostMatched && isViewerParticipant && matchedRecordId)) {
    return null;
  }

  const heading = chatClosed
    ? "Chat closed"
    : meetupFinished
    ? "Keep the conversation going"
    : "Stay in touch before the meetup";
  const body = chatClosed
    ? "This chat closed 72 hours after the meetup."
    : meetupFinished
    ? "You can still chat for 72 hours after the meetup."
    : "Use chat to confirm details and stay in sync before you meet.";
  const subBody =
    !chatClosed && !meetupFinished
      ? "Chat stays open for 72 hours after the meetup."
      : null;

  return (
    <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={APP_EYEBROW_CLASS}>
            Chat
          </div>
          <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#24323f]">
            {heading}
          </div>
          <div className="mt-2 text-sm leading-6 text-[#66727a]">
            {body}
          </div>
          {subBody ? (
            <div className="mt-1 text-xs leading-5 text-[#859199]">
              {subBody}
            </div>
          ) : null}
        </div>

        {chatClosed ? (
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-2 text-sm font-medium text-[#6b7981]">
            <MessageSquare className="h-4 w-4 text-[#738690]" />
            Closed
          </div>
        ) : (
          <Link
            href={`/matches/${matchedRecordId}/chat`}
            className={`inline-flex shrink-0 items-center gap-2 rounded-full ${APP_BUTTON_SECONDARY_CLASS} px-4 py-2 text-sm font-medium transition`}
          >
            <MessageSquare className="h-4 w-4 text-[#738690]" />
            Open Chat
            {hasNewChatMessage ? (
              <span className="rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f7480]">
                New
              </span>
            ) : null}
          </Link>
        )}
      </div>
    </div>
  );
}

