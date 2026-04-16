"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import {
  Coins,
  Clock3,
  MapPin,
  UserRound,
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
import {
  CompactActionButton,
  DashboardTabCard,
  FilterPill,
  getPostMatchState,
  getPurposeIcon,
  getPurposeTheme,
  getStatusBadgeClass,
  MiniPostPreview,
  parseBenefitAmount,
  SectionIntro,
  SOFT_CARD_CLASS,
  SURFACE_CARD_CLASS,
  formatDuration,
} from "./dashboardComponents";
import { useDashboardState } from "./useDashboardState";

function PostsTabPanel({
  filteredPosts,
  matchSummaryMap,
  getPostStatus,
  formatTime,
  openPostDetail,
}: {
  filteredPosts: PostRow[];
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  getPostStatus: (meetingTime: string | null) => "Upcoming" | "Expired";
  formatTime: (meetingTime: string | null) => string;
  openPostDetail: (postId: number) => void;
}) {
  return (
    <div className="space-y-4">
      {filteredPosts.map((post) => {
        const postStatus = getPostMatchState(
          getPostStatus(post.meeting_time),
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
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8f7d71]">
                        When
                      </div>
                      <div className="truncate text-[12px] font-medium text-[#554a42]">
                        {formatTime(post.meeting_time)}
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
                    <div className="block truncate text-[12px] font-medium text-[#554a42]">
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
          </div>
        );
      })}

      {filteredPosts.length === 0 && (
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
          No meetups in this filter.
        </div>
      )}
    </div>
  );
}

function ReceivedTabPanel({
  receivedItems,
  profileMap,
  postMap,
  userTimeZone,
  processingRequestId,
  processingRequestAction,
  updateRequestStatus,
  openPostDetail,
  stopCardClick,
}: {
  receivedItems: MatchRequestRow[];
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  userTimeZone: string;
  processingRequestId: number | null;
  processingRequestAction: "accepted" | "rejected" | null;
  updateRequestStatus: (requestId: number, nextStatus: "accepted" | "rejected") => Promise<void>;
  openPostDetail: (postId: number) => void;
  stopCardClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
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
                <div className="mt-2 text-lg font-semibold text-[#2f2a26]">{statusLine}</div>
                <div className="mt-1 text-sm text-[#6f655c]">From {requesterName}</div>
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
                  {processingRequestId === item.id && processingRequestAction === "accepted"
                    ? "Accepting..."
                    : "Accept"}
                </CompactActionButton>

                <CompactActionButton
                  onClick={() => updateRequestStatus(item.id, "rejected")}
                  disabled={processingRequestId !== null}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  {processingRequestId === item.id && processingRequestAction === "rejected"
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
  );
}

function SentTabPanel({
  requestsSent,
  profileMap,
  postMap,
  userTimeZone,
  openPostDetail,
}: {
  requestsSent: MatchRequestRow[];
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  userTimeZone: string;
  openPostDetail: (postId: number) => void;
}) {
  return (
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
              <div className="mt-2 text-lg font-semibold text-[#2f2a26]">
                You asked to join this meetup.
              </div>
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
  );
}

function MatchesTabPanel({
  filteredMatches,
  userId,
  profileMap,
  postMap,
  reviewedMatchIds,
  userTimeZone,
  getPostStatus,
  openPostDetail,
  stopCardClick,
}: {
  filteredMatches: MatchRow[];
  userId: string;
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  reviewedMatchIds: number[];
  userTimeZone: string;
  getPostStatus: (meetingTime: string | null) => "Upcoming" | "Expired";
  openPostDetail: (postId: number) => void;
  stopCardClick: (event: React.MouseEvent<HTMLElement>) => void;
}) {
  return (
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

              <CompactActionButton href={`/matches/${item.id}/chat`}>
                <HeartHandshake className="h-3.5 w-3.5" />
                Open Chat
              </CompactActionButton>
            </div>
          </div>
        );
      })}

      {filteredMatches.length === 0 && (
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#8b7f74]`}>
          No matches in this filter.
        </div>
      )}
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
  initialUserTimeZone,
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
  initialUserTimeZone: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const {
    userTimeZone,
    formatTime,
    formatTimeUntil,
    getPostStatus,
    posts,
    receivedItems,
    setReceivedItems,
    activeTab,
    setActiveTab,
    postFilter,
    setPostFilter,
    matchFilter,
    setMatchFilter,
    processingRequestId,
    setProcessingRequestId,
    processingRequestAction,
    setProcessingRequestAction,
    showMatchSuccess,
    showReviewSuccess,
    filteredPosts,
    filteredMatches,
    pendingReceived,
    upcomingMatchedMeetups,
  } = useDashboardState({
    initialPosts,
    requestsReceived,
    matches,
    postMap,
    profileMap,
    matchSummaryMap,
    userId,
    initialUserTimeZone,
  });

  const stopCardClick = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  const openPostDetail = (postId?: number) => {
    if (!postId) return;
    router.push(`/posts/${postId}`);
  };

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
          <PostsTabPanel
            filteredPosts={filteredPosts}
            matchSummaryMap={matchSummaryMap}
            getPostStatus={getPostStatus}
            formatTime={formatTime}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "received" && (
          <ReceivedTabPanel
            receivedItems={receivedItems}
            profileMap={profileMap}
            postMap={postMap}
            userTimeZone={userTimeZone}
            processingRequestId={processingRequestId}
            processingRequestAction={processingRequestAction}
            updateRequestStatus={updateRequestStatus}
            openPostDetail={openPostDetail}
            stopCardClick={stopCardClick}
          />
        )}

        {activeTab === "sent" && (
          <SentTabPanel
            requestsSent={requestsSent}
            profileMap={profileMap}
            postMap={postMap}
            userTimeZone={userTimeZone}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "matches" && (
          <MatchesTabPanel
            filteredMatches={filteredMatches}
            userId={userId}
            profileMap={profileMap}
            postMap={postMap}
            reviewedMatchIds={reviewedMatchIds}
            userTimeZone={userTimeZone}
            getPostStatus={getPostStatus}
            openPostDetail={openPostDetail}
            stopCardClick={stopCardClick}
          />
        )}
      </div>
    </main>
  );
}



