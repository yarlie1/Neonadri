"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Coins,
  Clock3,
  MapPin,
  MessageSquareMore,
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
import type { MatchChatMetaRow, MatchRow, MatchRequestRow, PostRow } from "./page";
import { parseMeetingTime } from "../../lib/meetingTime";
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
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
} from "../designSystem";
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

            <div className={`${APP_INNER_PANEL_CLASS} p-3`}>
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

                {amount !== null && (
                  <div className="inline-flex w-[66px] shrink-0 flex-col items-center justify-center whitespace-nowrap rounded-[16px] border border-[#ccd6dd] bg-[linear-gradient(180deg,#ffffff_0%,#e7eef3_100%)] px-1.5 py-2 text-[#435760] shadow-[0_8px_16px_rgba(118,126,133,0.1)]">
                    <Coins className="h-4 w-4 shrink-0 text-[#758893]" />
                    <span className="mt-1 text-sm font-semibold">
                      +${amount.toLocaleString()}
                    </span>
                  </div>
                )}
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
                        {formatTime(post.meeting_time)}
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
                    <div className="block truncate text-[12px] font-medium text-[#3c4850]">
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
          </div>
        );
      })}

      {filteredPosts.length === 0 && (
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#78848c]`}>
          No meetups in this filter.
        </div>
      )}
    </div>
  );
}

function formatRecentChatTime(meetingTime: string | null, userTimeZone: string) {
  const parsed = parseMeetingTime(meetingTime, userTimeZone);
  if (!parsed) return "Time TBD";

  const dateLabel = parsed.toLocaleDateString("en-US", {
    timeZone: userTimeZone,
    month: "short",
    day: "numeric",
  });

  const timeLabel = parsed.toLocaleTimeString("en-US", {
    timeZone: userTimeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} / ${timeLabel}`;
}

function RecentChatsPanel({
  recentChats,
  userTimeZone,
}: {
  recentChats: Array<{
    matchId: number;
    otherUserName: string;
    meetingTime: string | null;
    placeLabel: string;
    hasNewMessage: boolean;
  }>;
  userTimeZone: string;
}) {
  if (recentChats.length === 0) {
    return (
      <div className={`${SURFACE_CARD_CLASS} p-4 sm:p-5`}>
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] text-[#738690]">
            <MessageSquareMore className="h-4 w-4" />
          </div>
          <div>
            <div className={APP_EYEBROW_CLASS}>
              Recent chats
            </div>
            <div className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              When you match with someone, your chat rooms will show up here.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${SURFACE_CARD_CLASS} p-4 sm:p-5`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className={APP_EYEBROW_CLASS}>
            Recent chats
          </div>
          <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#24323f]">
            Open a chat right away
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] border border-[#d8e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)]">
        {recentChats.map((chat, index) => (
          <Link
            key={chat.matchId}
            href={`/matches/${chat.matchId}/chat`}
            className={`flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-white/80 ${
              index !== recentChats.length - 1 ? "border-b border-[#dfe6ea]" : ""
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-[#24323f]">
                  {chat.otherUserName}
                </span>
                {chat.hasNewMessage ? (
                  <span className="shrink-0 rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5f7480]">
                    New
                  </span>
                ) : null}
              </div>
              <div className="mt-1 truncate text-xs text-[#78848c]">
                {formatRecentChatTime(chat.meetingTime, userTimeZone)} · {chat.placeLabel}
              </div>
            </div>

            <div className="shrink-0 text-xs font-medium text-[#78848c]">Open</div>
          </Link>
        ))}
      </div>
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
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
                  Incoming request
                </div>
                <div className="mt-2 text-lg font-semibold text-[#24323f]">{statusLine}</div>
                <div className="mt-1 text-sm text-[#66727a]">From {requesterName}</div>
                <div className="mt-1 text-sm text-[#7f8a92]">
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
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
      {requestsSent.map((item) => {
        const hostName = profileMap[item.post_owner_user_id] || "Unknown";
        const acceptedMessage =
          item.status === "accepted" ? `${hostName} accepted your request.` : null;
        const statusMessage =
          item.status === "rejected" ? `${hostName} closed this request.` : `Sent to ${hostName}`;

        return (
          <div
            key={item.id}
            onClick={() => openPostDetail(item.post_id)}
            className={`cursor-pointer ${SURFACE_CARD_CLASS} p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
                  Outgoing request
                </div>
                <div className="mt-2 text-lg font-semibold text-[#24323f]">
                  You asked to join this meetup.
                </div>
                {acceptedMessage ? (
                  <div className="mt-1 text-lg font-semibold text-[#24323f]">
                    {acceptedMessage}
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-[#66727a]">{statusMessage}</div>
                )}
                <div className="mt-1 text-sm text-[#7f8a92]">
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
        );
      })}

      {requestsSent.length === 0 && (
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
  matchChatMetaMap,
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
  matchChatMetaMap: Record<number, MatchChatMetaRow>;
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
        const chatMeta = matchChatMetaMap[item.id];
        const viewerLastSeen =
          chatMeta?.host_user_id === userId
            ? chatMeta.last_seen_by_host_at
            : chatMeta?.guest_user_id === userId
            ? chatMeta.last_seen_by_guest_at
            : null;
        const hasNewMessage = Boolean(
          chatMeta?.last_chat_activity_at &&
            (!viewerLastSeen || chatMeta.last_chat_activity_at > viewerLastSeen)
        );

        return (
          <div
            key={item.id}
            onClick={() => openPostDetail(item.post_id)}
            className={`cursor-pointer ${SURFACE_CARD_CLASS} p-5 sm:p-6`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
                  Match status
                </div>
                <div className="mt-2 flex items-center gap-2 text-lg font-semibold text-[#24323f]">
                  <HeartHandshake className="h-5 w-5 text-[#738690]" />
                  <span>Match confirmed</span>
                </div>
                <div className="mt-1 text-sm text-[#66727a]">
                  You are matched with {profileMap[otherUserId] || "Unknown"}.
                </div>
                <div className="mt-1 text-sm text-[#7f8a92]">
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
              <CompactActionButton href={`/matches/${item.id}/chat`}>
                <HeartHandshake className="h-3.5 w-3.5" />
                Open Chat
                {hasNewMessage ? (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#b56c57]" />
                ) : null}
              </CompactActionButton>

              {canLeaveReview ? (
                <CompactActionButton href={`/reviews/write/${item.id}`}>
                  <Star className="h-3.5 w-3.5" />
                  Leave Review
                </CompactActionButton>
              ) : alreadyReviewed ? (
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  <Star className="h-3.5 w-3.5" />
                  Review submitted
                </div>
              ) : (
                <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                  <Star className="h-3.5 w-3.5" />
                  Review after meetup
                </div>
              )}
            </div>
          </div>
        );
      })}

      {filteredMatches.length === 0 && (
        <div className={`${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
  matchChatMetaMap,
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
  matchChatMetaMap: Record<number, MatchChatMetaRow>;
  initialUserTimeZone: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const previousActiveTabRef = useRef<string | null>(null);
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
    receivedFilter,
    setReceivedFilter,
    sentFilter,
    setSentFilter,
    matchFilter,
    setMatchFilter,
    processingRequestId,
    setProcessingRequestId,
    processingRequestAction,
    setProcessingRequestAction,
    showMatchSuccess,
    showReviewSuccess,
    filteredPosts,
    filteredReceived,
    filteredSent,
    filteredMatches,
    pendingReceived,
    acceptedSent,
    upcomingMatchedMeetups,
  } = useDashboardState({
    initialPosts,
    requestsReceived,
    requestsSent,
    matches,
    postMap,
    profileMap,
    matchSummaryMap,
    reviewedMatchIds,
    userId,
    initialUserTimeZone,
  });

  useEffect(() => {
    if (previousActiveTabRef.current === activeTab) return;
    previousActiveTabRef.current = activeTab;

    if (activeTab === "received") {
      setReceivedFilter(pendingReceived > 0 ? "pending" : "all");
      return;
    }

    if (activeTab === "sent") {
      setSentFilter(acceptedSent > 0 ? "accepted" : "all");
      return;
    }

    if (activeTab === "matches") {
      setMatchFilter(upcomingMatchedMeetups.length > 0 ? "upcoming" : "all");
    }
  }, [
    acceptedSent,
    activeTab,
    pendingReceived,
    setMatchFilter,
    setReceivedFilter,
    setSentFilter,
    upcomingMatchedMeetups.length,
  ]);

  const recentChats = matches
    .map((item) => {
      const otherUserId = item.user_a === userId ? item.user_b : item.user_a;
      const post = postMap[item.post_id];
      const chatMeta = matchChatMetaMap[item.id];
      const viewerLastSeen =
        chatMeta?.host_user_id === userId
          ? chatMeta.last_seen_by_host_at
          : chatMeta?.guest_user_id === userId
          ? chatMeta.last_seen_by_guest_at
          : null;
      const hasNewMessage = Boolean(
        chatMeta?.last_chat_activity_at &&
          (!viewerLastSeen || chatMeta.last_chat_activity_at > viewerLastSeen)
      );

      return {
        matchId: item.id,
        otherUserName: profileMap[otherUserId] || "Unknown",
        meetingTime: post?.meeting_time || null,
        placeLabel: post?.place_name || post?.location || "Selected place",
        hasNewMessage,
        sortKey: chatMeta?.last_chat_activity_at || item.created_at,
      };
    })
    .sort((a, b) => {
      if (a.hasNewMessage !== b.hasNewMessage) {
        return a.hasNewMessage ? -1 : 1;
      }
      return b.sortKey.localeCompare(a.sortKey);
    })
    .slice(0, 3);

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
    <main className={`min-h-screen px-4 py-5 sm:py-6 ${APP_PAGE_BG_CLASS}`}>
      <div className="mx-auto max-w-2xl space-y-4 sm:space-y-5">
        {showMatchSuccess && (
          <div className={`${SOFT_CARD_CLASS} px-4 py-3 text-sm font-medium text-[#52616a] shadow-sm`}>
            Match created successfully.
          </div>
        )}

        {showReviewSuccess && (
          <div className={`${SOFT_CARD_CLASS} px-4 py-3 text-sm font-medium text-[#52616a] shadow-sm`}>
            Review submitted successfully.
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] border border-[#dfe7ec] bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#f4f7f9_44%,#dfe7ec_100%)] px-6 py-6 shadow-[0_18px_42px_rgba(118,126,133,0.11)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d8e1e7]/55 blur-2xl" />
          <div className="relative">
          <div className={APP_EYEBROW_CLASS}>DASHBOARD</div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-[#24323f] sm:text-[36px]">
                My Meetups
              </h1>
              <p className={`mt-2 max-w-md ${APP_BODY_TEXT_CLASS}`}>
                Manage posts, requests, matches, and reviews.
              </p>
            </div>

            <Link
              href="/write"
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
          </div>
        </div>

        {upcomingMatchedMeetups.length > 0 && (
          <div className={`${SURFACE_CARD_CLASS} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={APP_EYEBROW_CLASS}>
                  Coming up next
                </div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#24323f]">
                  Upcoming matched meetups
                </div>
                <div className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
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
                    className={`block ${APP_INNER_PANEL_CLASS} p-4 transition hover:bg-white/96`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] shadow-sm ${purposeTheme.bandClass}`}
                      >
                        {getPurposeIcon(item.post.meeting_purpose)}
                        {item.post.meeting_purpose || "Meetup"}
                      </div>

                      <div className="rounded-full border border-[#d4dfe6] bg-[linear-gradient(180deg,#ffffff_0%,#eef4f7_100%)] px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.12em] text-[#536a75]">
                        Matched
                      </div>
                    </div>

                    <div className={`mt-3 ${APP_ROW_SURFACE_CLASS} px-4 py-3`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-[#24323f]">
                          <Clock3 className="h-4 w-4 shrink-0 text-[#7a8b95]" />
                          <span className="truncate">{formatTime(item.post.meeting_time)}</span>
                        </div>
                        <div className="shrink-0 text-sm font-semibold text-[#24323f]">
                          {countdown || "Soon"}
                        </div>
                      </div>
                      <div className="mt-2 flex items-start gap-2 text-sm leading-6 text-[#66727a]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7a8b95]" />
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

        <RecentChatsPanel recentChats={recentChats} userTimeZone={userTimeZone} />

        <div className="grid grid-cols-2 gap-4">
          <DashboardTabCard
            active={activeTab === "posts"}
            label="My Posts"
            value={posts.length}
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setActiveTab("posts")}
          />
          <DashboardTabCard
            active={activeTab === "matches"}
            label="Matches"
            value={matches.length}
            subtext={
              upcomingMatchedMeetups.length > 0
                ? `${upcomingMatchedMeetups.length} upcoming`
                : "No upcoming"
            }
            icon={<HeartHandshake className="h-4 w-4" />}
            onClick={() => setActiveTab("matches")}
          />
          <DashboardTabCard
            active={activeTab === "sent"}
            label="Requests Sent"
            value={requestsSent.length}
            subtext={acceptedSent > 0 ? `${acceptedSent} accepted` : null}
            icon={<Send className="h-4 w-4" />}
            onClick={() => setActiveTab("sent")}
          />
          <DashboardTabCard
            active={activeTab === "received"}
            label="Requests Received"
            value={receivedItems.length}
            subtext={
              pendingReceived > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex min-w-[18px] items-center justify-center rounded-full border border-[#b9c6cf] bg-[linear-gradient(180deg,#ffffff_0%,#dbe5eb_100%)] px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#2f404b] shadow-[0_10px_18px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]">
                    {pendingReceived > 99 ? "99+" : pendingReceived}
                  </span>
                  <span>pending</span>
                </span>
              ) : (
                "No pending"
              )
            }
            icon={<Inbox className="h-4 w-4" />}
            onClick={() => setActiveTab("received")}
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

        {activeTab === "received" && (
          <div className={`${SURFACE_CARD_CLASS} p-4`}>
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Incoming"
                title="People who want to join"
                body="Review every request at once, or focus on the pending ones that still need your decision."
              />

              <div className="flex flex-wrap gap-2">
                <FilterPill
                  active={receivedFilter === "all"}
                  onClick={() => setReceivedFilter("all")}
                >
                  All
                </FilterPill>
                <FilterPill
                  active={receivedFilter === "pending"}
                  onClick={() => setReceivedFilter("pending")}
                >
                  Pending
                </FilterPill>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sent" && (
          <div className={`${SURFACE_CARD_CLASS} p-4`}>
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Outgoing"
                title="Requests you have sent"
                body="See which requests are still waiting, which got accepted, and which ones have already closed."
              />

              <div className="flex flex-wrap gap-2">
                <FilterPill active={sentFilter === "all"} onClick={() => setSentFilter("all")}>
                  All
                </FilterPill>
                <FilterPill
                  active={sentFilter === "pending"}
                  onClick={() => setSentFilter("pending")}
                >
                  Pending
                </FilterPill>
                <FilterPill
                  active={sentFilter === "accepted"}
                  onClick={() => setSentFilter("accepted")}
                >
                  Accepted
                </FilterPill>
                <FilterPill
                  active={sentFilter === "rejected"}
                  onClick={() => setSentFilter("rejected")}
                >
                  Rejected
                </FilterPill>
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
                <FilterPill
                  active={matchFilter === "review_due"}
                  onClick={() => setMatchFilter("review_due")}
                >
                  Review Due
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
            receivedItems={filteredReceived}
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
            requestsSent={filteredSent}
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
            matchChatMetaMap={matchChatMetaMap}
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





