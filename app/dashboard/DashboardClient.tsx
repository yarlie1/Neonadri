"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  formatMeetingCountdown,
  formatMeetingTime,
  getMeetingStatus,
  parseMeetingTime,
} from "../../lib/meetingTime";
import { createClient } from "../../lib/supabase/client";
import {
  Activity,
  Coffee,
  Utensils,
  Cake,
  Footprints,
  Smile,
  Film,
  Mic,
  Dice5,
  Gamepad2,
  BookOpen,
  Target,
  Laptop,
  Book,
  Camera,
  Clock3,
  MapPin,
  UserRound,
  Coins,
  FileText,
  Inbox,
  Send,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Plus,
  Star,
} from "lucide-react";
import type { MatchRow, MatchRequestRow, PostRow } from "./page";

type DashboardTab = "posts" | "received" | "sent" | "matches";
type PostFilter = "all" | "open" | "matched" | "expired";
type MatchFilter = "all" | "upcoming" | "expired";

const SURFACE_CARD_CLASS =
  "rounded-[30px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] shadow-[0_14px_32px_rgba(92,69,52,0.07)] backdrop-blur";
const SOFT_CARD_CLASS =
  "rounded-[24px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)]";

function getPurposeTheme(purpose: string | null) {
  const baseBandClass =
    "border border-[#eadfd2] bg-[linear-gradient(180deg,#fbf5ef_0%,#f3e8dc_100%)] text-[#2f261f]";
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return {
        bandClass: baseBandClass,
      };
    case "Meal":
    case "Dessert":
      return {
        bandClass: baseBandClass,
      };
    case "Walk":
    case "Jogging":
    case "Yoga":
      return {
        bandClass: baseBandClass,
      };
    case "Movie":
    case "Theater":
    case "Karaoke":
      return {
        bandClass: baseBandClass,
      };
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return {
        bandClass: baseBandClass,
      };
    case "Study":
    case "Book Talk":
    case "Book":
      return {
        bandClass: baseBandClass,
      };
    case "Work Together":
    case "Work":
      return {
        bandClass: baseBandClass,
      };
    case "Photo Walk":
    case "Photo":
      return {
        bandClass: baseBandClass,
      };
    default:
      return {
        bandClass: baseBandClass,
      };
  }
}

function getPurposeIcon(purpose: string | null) {
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

function formatDuration(minutes: number | null) {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
}

function getStatusBadgeClass(status: string) {
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

function getPostMatchState(
  postStatus: "Upcoming" | "Expired",
  summary?: { isMatched: boolean }
) {
  const isExpired = postStatus === "Expired";

  if (summary?.isMatched) {
    return "Matched";
  }

  if (isExpired) {
    return "Expired";
  }

  return "Open";
}

function parseBenefitAmount(value: string | null) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

function DashboardTabCard({
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
  subtext?: string;
  icon: React.ReactNode;
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

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
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

function SectionIntro({
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

function CompactActionButton({
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
  children: React.ReactNode;
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

function MiniPostPreview({
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
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">When</div>
              <div className="truncate text-[12px] font-medium text-[#554a42]">
                {formatMeetingTime(post.meeting_time, timeZone) || ""}
              </div>
            </div>
          </div>
        )}

        <div className="flex min-w-0 items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Place</div>
            <div className="line-clamp-2 break-words text-[12px] font-medium text-[#554a42]">
              {post.place_name || post.location || "No place"}
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2 sm:col-span-2">
          <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
          <div className="min-w-0 leading-[1.2]">
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Looking for</div>
            <div className="truncate text-[12px] font-medium text-[#554a42]">{post.target_gender || "Any"} / {post.target_age_group || "Any"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardClient({
  userId,
  posts: initialPosts,
  requestsReceived,
  requestsSent,
  matches,
  profileMap,
  postMap,
  matchSummaryMap,
  reviewedMatchIds,
}: {
  userId: string;
  posts: PostRow[];
  requestsReceived: MatchRequestRow[];
  requestsSent: MatchRequestRow[];
  matches: MatchRow[];
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  reviewedMatchIds: number[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const userTimeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  );

  const formatTime = (meetingTime: string | null) =>
    formatMeetingTime(meetingTime, userTimeZone) || "";

  const formatTimeUntil = (meetingTime: string | null) =>
    formatMeetingCountdown(meetingTime, userTimeZone) || "";

  const getPostStatus = (meetingTime: string | null) =>
    getMeetingStatus(meetingTime, userTimeZone);

  const [posts] = useState(initialPosts);
  const [receivedItems, setReceivedItems] = useState(requestsReceived);
  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [matchFilter, setMatchFilter] = useState<MatchFilter>("all");
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [processingRequestAction, setProcessingRequestAction] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  const stopCardClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  const openPostDetail = (postId?: number) => {
    if (!postId) return;
    router.push(`/posts/${postId}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const success = params.get("success");
    const review = params.get("review");

    if (tab === "posts" || tab === "received" || tab === "sent" || tab === "matches") {
      setActiveTab(tab);
    }

    if (success === "1") {
      setShowMatchSuccess(true);
      const timer = setTimeout(() => setShowMatchSuccess(false), 3000);
      return () => clearTimeout(timer);
    }

    if (review === "1") {
      setShowReviewSuccess(true);
      const timer = setTimeout(() => setShowReviewSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    if (postFilter === "all") return posts;
    return posts.filter(
      (post) =>
        getPostMatchState(
          getPostStatus(post.meeting_time) as "Upcoming" | "Expired",
          matchSummaryMap[post.id]
        ).toLowerCase() === postFilter
    );
  }, [posts, postFilter, matchSummaryMap]);

  const filteredMatches = useMemo(() => {
    if (matchFilter === "all") return matches;
    return matches.filter((match) => {
      const post = postMap[match.post_id];
      const status = getPostStatus(post?.meeting_time || null).toLowerCase();
      return status === matchFilter;
    });
  }, [matches, matchFilter, postMap]);

  const pendingReceived = useMemo(
    () => receivedItems.filter((item) => item.status === "pending").length,
    [receivedItems]
  );

  const upcomingMatchedMeetups = useMemo(() => {
    return matches
      .map((match) => {
        const post = postMap[match.post_id];
        if (!post?.meeting_time) return null;

        const time =
          parseMeetingTime(post.meeting_time, userTimeZone)?.getTime() ?? NaN;
        if (Number.isNaN(time) || time < Date.now()) return null;

        const otherUserId = match.user_a === userId ? match.user_b : match.user_a;

        return {
          match,
          post,
          time,
          otherUserId,
          otherName: profileMap[otherUserId] || "Unknown",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a!.time - b!.time);
  }, [matches, postMap, profileMap, userId, userTimeZone]);

  const updateRequestStatus = async (
    requestId: number,
    nextStatus: "accepted" | "rejected"
  ) => {
    if (processingRequestId !== null) return;

    const targetRequest = receivedItems.find((item) => item.id === requestId);
    if (!targetRequest) return;

    setProcessingRequestId(requestId);
    setProcessingRequestAction(nextStatus);

    const rpcName =
      nextStatus === "accepted" ? "accept_match_request" : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      setProcessingRequestId(null);
      setProcessingRequestAction(null);
      alert(error.message);
      return;
    }

    const result = data as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      setProcessingRequestId(null);
      setProcessingRequestAction(null);
      alert(result?.error || "Failed to update request");
      return;
    }

    if (nextStatus === "accepted") {
      setReceivedItems((prev) =>
        prev.map((item) =>
          item.post_id === targetRequest.post_id
            ? { ...item, status: item.id === requestId ? "accepted" : "rejected" }
            : item
        )
      );
    } else {
      setReceivedItems((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status: "rejected" } : item
        )
      );
    }

    if (nextStatus === "accepted") {
      router.replace("/dashboard?tab=matches&success=1");
      router.refresh();
      return;
    }

    setProcessingRequestId(null);
    setProcessingRequestAction(null);
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-5 text-[#2f2a26] sm:py-6">
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-5">
        {showMatchSuccess && (
          <div className={`${SOFT_CARD_CLASS} px-4 py-3 text-sm font-medium text-[#5f5347] shadow-sm`}>
            Match created successfully.
          </div>
        )}

        {showReviewSuccess && (
          <div className={`${SOFT_CARD_CLASS} px-4 py-3 text-sm font-medium text-[#5f5347] shadow-sm`}>
            Review submitted successfully.
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] border border-[#ece0d4] bg-[radial-gradient(circle_at_top_left,#fffbf7_0%,#f6e8dd_44%,#edd8ca_100%)] px-6 py-6 shadow-[0_18px_42px_rgba(92,69,52,0.08)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
          <div className="text-[11px] tracking-[0.28em] text-[#9b8f84]">DASHBOARD</div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-[#2b1f1a] sm:text-[36px]">
                My Meetups
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5f453b]">
                Manage posts, requests, matches, and reviews.
              </p>
            </div>

            <Link
              href="/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d9c9bc] bg-[#fff6ee] px-4 py-2.5 text-sm font-medium text-[#6f5649] shadow-sm transition hover:bg-[#f7eadf]"
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
          </div>
        </div>

        {upcomingMatchedMeetups.length > 0 && (
          <div className="rounded-[28px] border border-[#e9ddd1] bg-[linear-gradient(180deg,#fffdfa_0%,#f6ede5_100%)] p-4 shadow-[0_12px_28px_rgba(92,69,52,0.06)] sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                  Coming up next
                </div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#2f2a26]">
                  Upcoming matched meetups
                </div>
                <div className="mt-2 text-sm leading-6 text-[#6f655c]">
                  {upcomingMatchedMeetups.length} meetup{upcomingMatchedMeetups.length > 1 ? "s" : ""} already matched and still ahead.
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingMatchedMeetups.map((item) => {
                const purposeTheme = getPurposeTheme(item.post.meeting_purpose);
                const countdown = formatTimeUntil(item.post.meeting_time);

                return (
                  <Link
                    key={item.match.id}
                    href={`/posts/${item.post.id}`}
                    className="block rounded-[22px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] p-4 shadow-[0_10px_22px_rgba(92,69,52,0.05)] transition hover:bg-white/96"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm ${purposeTheme.bandClass}`}
                      >
                        {getPurposeIcon(item.post.meeting_purpose)}
                        {item.post.meeting_purpose || "Meetup"}
                      </div>

                      <div className="rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-[#74675d]">
                        Matched
                      </div>
                    </div>

                    <div className="mt-3 rounded-[18px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#2f2a26]">
                          <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                          <span className="truncate">{formatTime(item.post.meeting_time)}</span>
                        </div>
                        <div className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8f6e5f]">
                          {countdown || "Soon"}
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#5f5347]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a27767]" />
                        <span className="min-w-0 truncate">
                          {item.post.place_name || item.post.location || "Selected place"}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <DashboardTabCard
            active={activeTab === "posts"}
            label="My Posts"
            value={posts.length}
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setActiveTab("posts")}
          />
          <DashboardTabCard
            active={activeTab === "received"}
            label="Requests Received"
            value={receivedItems.length}
            subtext={pendingReceived > 0 ? `${pendingReceived} pending` : "No pending"}
            icon={<Inbox className="h-4 w-4" />}
            onClick={() => setActiveTab("received")}
          />
          <DashboardTabCard
            active={activeTab === "sent"}
            label="Requests Sent"
            value={requestsSent.length}
            icon={<Send className="h-4 w-4" />}
            onClick={() => setActiveTab("sent")}
          />
          <DashboardTabCard
            active={activeTab === "matches"}
            label="Matches"
            value={matches.length}
            icon={<HeartHandshake className="h-4 w-4" />}
            onClick={() => setActiveTab("matches")}
          />
        </div>

        {activeTab === "posts" && (
          <div className={`${SURFACE_CARD_CLASS} p-4`}>
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Hosting"
                title="Everything you are hosting"
                body="Review what is live, what has passed, and what still needs attention before the meetup happens."
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={postFilter === "all"} onClick={() => setPostFilter("all")}>
                    All
                  </FilterPill>
                  <FilterPill
                    active={postFilter === "open"}
                    onClick={() => setPostFilter("open")}
                  >
                    Open
                  </FilterPill>
                  <FilterPill
                    active={postFilter === "matched"}
                    onClick={() => setPostFilter("matched")}
                  >
                    Matched
                  </FilterPill>
                  <FilterPill
                    active={postFilter === "expired"}
                    onClick={() => setPostFilter("expired")}
                  >
                    Expired
                  </FilterPill>
                </div>

              </div>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className={`${SURFACE_CARD_CLASS} p-4`}>
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Connections"
                title="People you have matched with"
                body="Keep track of upcoming meetups, revisit finished ones, and leave reviews after the moment has passed."
              />

              <div className="flex flex-wrap gap-2">
                <FilterPill active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>
                  All
                </FilterPill>
                <FilterPill
                  active={matchFilter === "upcoming"}
                  onClick={() => setMatchFilter("upcoming")}
                >
                  Upcoming
                </FilterPill>
                <FilterPill
                  active={matchFilter === "expired"}
                  onClick={() => setMatchFilter("expired")}
                >
                  Expired
                </FilterPill>
              </div>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const postStatus = getPostMatchState(
                getPostStatus(post.meeting_time) as "Upcoming" | "Expired",
                matchSummaryMap[post.id]
              );
              const amount = parseBenefitAmount(post.benefit_amount);
              const purposeTheme = getPurposeTheme(post.meeting_purpose);

              return (
                <div
                  key={post.id}
                  onClick={() => openPostDetail(post.id)}
                  className={`cursor-pointer ${SURFACE_CARD_CLASS} p-4`}
                >
                  <div className="mb-4 flex items-center justify-start gap-3">
                    <div
                      className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${getStatusBadgeClass(
                        postStatus
                      )}`}
                    >
                      {postStatus}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[#f1e4d8] bg-[linear-gradient(180deg,#fffdfa_0%,#fcfaf7_100%)] p-3">
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

                      {amount !== null && (
                        <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[16px] bg-[linear-gradient(135deg,#ffe5b6_0%,#ffd18e_100%)] px-1.5 py-2 text-[#6e4715] shadow-sm">
                          <Coins className="h-4 w-4 shrink-0" />
                          <span className="mt-1 text-sm font-semibold">
                            +${amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid gap-2 text-[#7d7268] sm:grid-cols-2">
                      {post.meeting_time && (
                        <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                          <Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                          <div className="min-w-0 leading-[1.2]">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">When</div>
                            <div className="truncate text-[12px] font-medium text-[#554a42]">{formatTime(post.meeting_time)}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex min-w-0 items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                        <div className="min-w-0 leading-[1.2]">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Place</div>
                          <div className="block truncate text-[12px] font-medium text-[#554a42]">{post.place_name || post.location || "No place"}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 rounded-[16px] bg-[#faf3ec] px-3 py-2 sm:col-span-2">
                        <UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#9a6f5f]" />
                        <div className="min-w-0 leading-[1.2]">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">Looking for</div>
                          <div className="truncate text-[12px] font-medium text-[#554a42]">{post.target_gender || "Any"} / {post.target_age_group || "Any"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
                {postFilter === "all"
                  ? "No meetups yet."
                  : postFilter === "open"
                  ? "No open meetups."
                  : postFilter === "matched"
                  ? "No matched meetups."
                  : "No expired meetups."}
              </div>
            )}
          </div>
        )}

        {activeTab === "received" && (
          <div className="space-y-4">
            {receivedItems.map((item) => {
              const requesterName = profileMap[item.requester_user_id] || "Unknown";
              const statusLine =
                item.status === "pending"
                  ? `${requesterName} wants to join this meetup.`
                  : item.status === "accepted"
                  ? `You matched with ${requesterName}.`
                  : `${requesterName}'s request is closed.`;

              return (
                <div
                  key={item.id}
                  onClick={() => openPostDetail(item.post_id)}
                  className={`cursor-pointer ${SURFACE_CARD_CLASS} p-5 sm:p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                        Incoming request
                      </div>
                      <div className="mt-2 text-lg font-semibold text-[#2f2a26]">
                        {statusLine}
                      </div>

                      <div className="mt-1 text-sm text-[#6f655c]">
                        From {requesterName}
                      </div>

                      <div className="mt-1 text-sm text-[#8b7f74]">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <MiniPostPreview post={postMap[item.post_id]} timeZone={userTimeZone} />

                  {item.status === "pending" ? (
                    <div className="mt-5 flex flex-wrap gap-2" onClick={stopCardClick}>
                      <CompactActionButton
                        onClick={() => updateRequestStatus(item.id, "accepted")}
                        disabled={processingRequestId !== null}
                        primary
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {processingRequestId === item.id &&
                        processingRequestAction === "accepted"
                          ? "Accepting..."
                          : "Accept"}
                      </CompactActionButton>

                      <CompactActionButton
                        onClick={() => updateRequestStatus(item.id, "rejected")}
                        disabled={processingRequestId !== null}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {processingRequestId === item.id &&
                        processingRequestAction === "rejected"
                          ? "Rejecting..."
                          : "Reject"}
                      </CompactActionButton>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {receivedItems.length === 0 && (
              <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
                No requests received.
              </div>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="space-y-4">
            {requestsSent.map((item) => (
              <div
                key={item.id}
                onClick={() => openPostDetail(item.post_id)}
                className={`cursor-pointer ${SURFACE_CARD_CLASS} p-5 sm:p-6`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                      Outgoing request
                    </div>
                    <div className="mt-2 text-lg font-semibold text-[#2f2a26]">You asked to join this meetup.</div>

                    <div className="mt-1 text-sm text-[#6f655c]">
                      Sent to {profileMap[item.post_owner_user_id] || "Unknown"}
                    </div>

                    <div className="mt-1 text-sm text-[#8b7f74]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <MiniPostPreview post={postMap[item.post_id]} timeZone={userTimeZone} />

              </div>
            ))}

            {requestsSent.length === 0 && (
              <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
                No requests sent.
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            {filteredMatches.map((item) => {
              const otherUserId = item.user_a === userId ? item.user_b : item.user_a;
              const post = postMap[item.post_id];
              const alreadyReviewed = reviewedMatchIds.includes(item.id);
              const meetupStatus = getPostStatus(post?.meeting_time || null).toLowerCase();
              const canLeaveReview = meetupStatus === "expired" && !alreadyReviewed;

              return (
                <div
                  key={item.id}
                  onClick={() => openPostDetail(item.post_id)}
                className={`cursor-pointer ${SURFACE_CARD_CLASS} p-5 sm:p-6`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                        Match status
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#2f2a26]">
                        <HeartHandshake className="h-5 w-5 text-[#a48f7a]" />
                        <span>Match confirmed</span>
                      </div>

                      <div className="mt-1 text-sm text-[#6f655c]">
                        You are matched with {profileMap[otherUserId] || "Unknown"}.
                      </div>

                      <div className="mt-1 text-sm text-[#8b7f74]">
                        Matched on {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                        meetupStatus
                      )}`}
                    >
                      {meetupStatus === "upcoming" ? "Matched" : "Expired"}
                    </span>
                  </div>

                  <MiniPostPreview post={post} timeZone={userTimeZone} />

                  <div className="mt-5 flex flex-wrap gap-2" onClick={stopCardClick}>
                    {canLeaveReview ? (
                      <CompactActionButton href={`/reviews/write/${item.id}`}>
                        <Star className="h-3.5 w-3.5" />
                        Leave Review
                      </CompactActionButton>
                    ) : alreadyReviewed ? (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-[#fcfaf7] px-3 py-2 text-xs font-medium text-[#8b7f74]">
                        <Star className="h-3.5 w-3.5" />
                        Review submitted
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-[#fcfaf7] px-3 py-2 text-xs font-medium text-[#8b7f74]">
                        <Star className="h-3.5 w-3.5" />
                        Review after meetup
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredMatches.length === 0 && (
              <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
                {matchFilter === "all"
                  ? "No matches yet."
                  : matchFilter === "upcoming"
                  ? "No upcoming matches."
                  : "No expired matches."}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


