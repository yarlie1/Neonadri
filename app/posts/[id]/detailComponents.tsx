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

const PURPOSE_ICON_CLASS = "h-[19px] w-[19px] shrink-0 text-[#7e746b]";

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
    "border border-[#eadfd2] bg-[linear-gradient(180deg,#fbf5ef_0%,#f3e8dc_100%)] text-[#2f261f]",
});

export const formatDuration = (minutes: number | null) => {
  if (!minutes) return null;
  const hours = minutes / 60;
  if (Number.isInteger(hours)) return `${hours}h`;
  return `${hours.toFixed(1).replace(/\.0$/, "")}h`;
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
                ? "fill-[#a48f7a] text-[#a48f7a]"
                : "text-[#d8cec3]"
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
    <div className="rounded-[18px] border border-[#e7ddd2] bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.08em] text-[#8b7f74]">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium leading-6 text-[#4f443b]">
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
    <div className="rounded-[22px] border border-[#eadfd3] bg-[#fffdfa] px-4 py-4 text-center shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
        {label}
      </div>
      <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
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
    <div className="rounded-[18px] border border-[#ede2d7] bg-[#fcf8f3] px-4 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#5f5347]">{value}</div>
      <div className="mt-0.5 text-[11px] text-[#8b7f74]">{detail}</div>
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
  const identityLine = `${data.gender || "Unknown"}${
    data.gender && data.ageGroup ? " / " : ""
  }${data.ageGroup || ""}`;

  const cardContent = summaryOnly ? (
    <div className="rounded-[28px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fffdfa_0%,#f7eee6_100%)] px-5 py-4 shadow-[0_10px_24px_rgba(92,69,52,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(92,69,52,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
            {title}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div className="truncate text-[1.15rem] font-black tracking-[-0.03em] text-[#2b1f1a]">
              {data.displayName}
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#e9ddd0] bg-[#fbf6f0] px-2.5 py-1 text-[11px] font-medium text-[#6c5f54]">
              <Star className="h-3.5 w-3.5 fill-current text-[#b08b5d]" />
              {data.averageRating.toFixed(1)}
            </span>
            {isCurrentUser && (
              <span className="rounded-full border border-[#ece1d4] bg-[#faf5ef] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.1em] text-[#7d6458]">
                You
              </span>
            )}
          </div>
          <div className="mt-2 text-sm text-[#5f5347]">{identityLine}</div>
        </div>
      </div>
    </div>
  ) : (
    <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f3d6c5_38%,#e5b29e_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
              {title}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle_at_top,_#f5d8bf,_#c18f73_78%)] text-lg font-bold text-white shadow-[0_12px_24px_rgba(160,111,82,0.18)]">
                {data.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {profileHref ? (
                    <Link
                      href={profileHref}
                      className="block truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#2b1f1a] underline-offset-4 transition hover:text-[#6b5f52] hover:underline"
                    >
                      {data.displayName}
                    </Link>
                  ) : (
                    <div className="truncate text-[1.7rem] font-black tracking-[-0.04em] text-[#2b1f1a]">
                      {data.displayName}
                    </div>
                  )}
                  {isCurrentUser && (
                    <span className="rounded-full border border-white/60 bg-white/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d6458]">
                      You
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-[#5f453b]">{subtitle}</div>
              </div>
            </div>
          </div>
          <div className="rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-medium text-[#6b5f52] backdrop-blur">
            {data.averageRating.toFixed(1)} rating / {data.reviewCount} reviews
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(data.gender || data.ageGroup) && (
            <InfoItem
              icon={<UserRound className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label={title.includes("Guest") ? "Guest" : "Host"}
              value={identityLine}
            />
          )}
          {hasLanguages && (
            <InfoItem
              icon={<Languages className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Languages"
              value={data.languages.join(", ")}
            />
          )}
          {hasMeetingStyle && (
            <InfoItem
              icon={<HeartHandshake className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Meeting Style"
              value={data.meetingStyle}
            />
          )}
          {hasResponseNote && (
            <InfoItem
              icon={<Clock3 className="h-3.5 w-3.5 text-[#8a7f74]" />}
              label="Response Note"
              value={data.responseNote}
            />
          )}
        </div>

        <div className="mt-4 rounded-[1.4rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
          <div className="flex items-start gap-3">
            <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-[#8a7f74]" />
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
                About Me
              </div>
              <div className="mt-2 text-[15px] leading-7 text-[#5f5347]">{summary}</div>
            </div>
          </div>
        </div>

        {!compact && hasInterests && (
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#9b8f84]">
              <Sparkles className="h-3.5 w-3.5 text-[#8a7f74]" />
              Interests
            </div>
            <div className="flex flex-wrap gap-2">
              {data.interests.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#f4ece4] px-3 py-1.5 text-xs font-medium text-[#6b5f52]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Rating</div>
            <div className="mt-1 text-xl font-bold text-[#2f2a26]">{data.averageRating.toFixed(1)}</div>
            <div className="mt-1 flex justify-center">
              <StarRating value={roundedAverage} size="sm" />
            </div>
          </div>
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Reviews</div>
            <div className="mt-2 text-xl font-bold text-[#2f2a26]">{data.reviewCount}</div>
          </div>
          <div className="rounded-[1.25rem] border border-[#e7ddd2] bg-[#fcfaf7] p-3 text-center">
            <div className="text-xs text-[#8b7f74]">Meetups</div>
            <div className="mt-2 text-xl font-bold text-[#2f2a26]">{data.completedMeetups}</div>
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
            label="Host reliability"
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
          <div className="mt-4 rounded-[1.25rem] border border-[#efe6db] bg-[#fcfaf7] px-4 py-4">
            <div className="text-sm font-semibold text-[#2f2a26]">Recent Reviews</div>
            <div className="mt-3 space-y-3">
              {data.recentReviews.length === 0 ? (
                <div className="text-sm text-[#8b7f74]">No reviews yet.</div>
              ) : (
                data.recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[1rem] border border-[#eee4d9] bg-white px-3 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <StarRating value={review.rating} size="md" />
                      <div className="text-[11px] text-[#9b8f84]">
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#5f5347]">
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
    <div className="rounded-[26px] border border-[#e9ddd1] bg-[linear-gradient(180deg,#fffdfa_0%,#f6ede5_100%)] p-4 shadow-[0_12px_28px_rgba(92,69,52,0.06)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
            Upcoming meetup
          </div>
          <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#2f2a26]">
            Upcoming matched meetup
          </div>
          <div className="mt-2 text-sm leading-6 text-[#6f655c]">
            Your next confirmed plan for this meetup.
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] p-4 shadow-[0_10px_22px_rgba(92,69,52,0.05)]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm ${purposeTheme.bandClass}`}
          >
            {getPurposeIcon(post.meeting_purpose)}
            {post.meeting_purpose || "Meetup"}
          </div>

          <div className="rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-[#74675d]">
            Matched
          </div>
        </div>

        <div className="mt-3 rounded-[18px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#2f2a26]">
              <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
              <span className="truncate">{meetupTimeLabel}</span>
            </div>
            <div className="shrink-0 rounded-full bg-[#f3e7da] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b6356]">
              {meetupCountdown || "Soon"}
            </div>
          </div>

          <div className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#5f5347]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a27767]" />
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
}) {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#ece0d4] bg-[radial-gradient(circle_at_top_left,#fffbf7_0%,#f6e8dd_44%,#edd8ca_100%)] px-6 py-6 shadow-[0_18px_42px_rgba(92,69,52,0.08)]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
      <div className="relative">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
              Meetup overview
            </div>
            <span className="rounded-full border border-white/60 bg-white/55 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7d6458]">
              {isPostMatched ? "Matched" : "Open"}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap items-stretch gap-3">
            <div
              className={`inline-flex min-w-0 flex-1 items-center gap-3 rounded-[18px] px-4 py-3 shadow-[0_10px_20px_rgba(64,45,33,0.06)] ${purposeTheme.bandClass}`}
            >
              <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/55 bg-[linear-gradient(180deg,#f7efe6_0%,#efe3d7_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
                {getPurposeIcon(
                  post.meeting_purpose,
                  "h-[18px] w-[18px] shrink-0 text-[#7e746b]"
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[1.18rem] font-black tracking-[-0.03em] text-[#2f261f] sm:text-[1.28rem]">
                  {post.meeting_purpose || "Meetup"}
                </div>
              </div>
            </div>
            <div className="inline-flex w-[58px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-white/70 px-1.5 py-2 text-center text-[#4f443b] shadow-sm backdrop-blur">
              <Clock3 className="h-4 w-4" />
              <span className="mt-1 text-sm font-semibold tracking-[-0.03em]">
                {meetupDurationLabel}
              </span>
            </div>
            <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center rounded-[16px] bg-[linear-gradient(135deg,#ffe5b6_0%,#ffd18e_100%)] px-1.5 py-2 text-center text-[#6e4715] shadow-sm">
              <Coins className="h-4 w-4" />
              <span className="mt-1 text-sm font-semibold tracking-[-0.03em]">
                {post.benefit_amount || "N/A"}
              </span>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
            {benefitExplanation}
          </p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm text-[#5f453b]">
            <span>Looking for {targetLabel}</span>
            <span>Hosted by {ownerName}</span>
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
            Quick snapshot
          </div>
          <div className="grid grid-cols-1 gap-3">
            <StatCard label="Host" value={hostIdentityLabel} />
            <StatCard label="Guest" value={targetLabel} />
            <StatCard label="When" value={meetupTimeLabel} />
            <StatCard label="Place" value={post.place_name || "Selected place"} />
          </div>
        </div>

        <div className="mt-5 rounded-[26px] border border-white/55 bg-white/58 px-4 py-4 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
              Location
            </div>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#e7dbcf] bg-[#fbf6f0] px-3 py-1.5 text-[11px] font-medium text-[#6a5e54] transition hover:bg-[#f4eadf]"
              >
                Open in Maps
              </a>
            )}
          </div>
          <div className="mt-3 text-[15px] text-[#5f5347]">
            <div className="space-y-3">
              {post.location && (
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                    <div className="text-[11px] font-semibold uppercase leading-none tracking-[0.12em] text-[#9b8f84]">
                      Address
                    </div>
                  </div>
                  <div className="mt-1 pl-6 line-clamp-3">{post.location}</div>
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
    <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
            Reviews
          </div>
          <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
            Match review
          </div>
        </div>
        {canLeaveReview && (
          <Link
            href={`/reviews/write/${matchedRecordId}`}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            <Star className="h-4 w-4 text-[#a48f7a]" />
            Leave Review
          </Link>
        )}
      </div>

      <div className="mt-4 rounded-[18px] border border-[#ece1d4] bg-[#fbf6f0] px-4 py-3 text-sm leading-6 text-[#6a5e54]">
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
              className="rounded-[18px] border border-[#ece1d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e8_100%)] px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
                    {getMatchReviewAuthorLabel(review)}
                  </div>
                  <div className="mt-1">
                    <StarRating value={review.rating} size="sm" />
                  </div>
                </div>
                <div className="text-xs text-[#9b8f84]">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-3 text-sm leading-6 text-[#4f443b]">
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
}: {
  isPostMatched: boolean;
  isViewerParticipant: boolean;
  matchedRecordId?: number | null;
  hasNewChatMessage: boolean;
}) {
  if (!(isPostMatched && isViewerParticipant && matchedRecordId)) {
    return null;
  }

  return (
    <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
            Chat
          </div>
          <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#2f2a26]">
            Stay in touch before the meetup
          </div>
        </div>

        <Link
          href={`/matches/${matchedRecordId}/chat`}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
        >
          <MessageSquare className="h-4 w-4 text-[#8b7367]" />
          Open Chat
          {hasNewChatMessage ? (
            <span className="rounded-full bg-[#f3e1d8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9a5d49]">
              New
            </span>
          ) : null}
        </Link>
      </div>
    </div>
  );
}

