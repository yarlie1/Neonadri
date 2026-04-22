"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Clock3,
  MapPin,
  MessageSquareMore,
  UserRound,
  FileText,
  Inbox,
  Send,
  HeartHandshake,
  Plus,
  Star,
} from "lucide-react";
import type { MatchChatMetaRow, MatchRow, MatchRequestRow, PostRow } from "./page";
import { parseMeetingTime } from "../../lib/meetingTime";
import {
  getPublicLocationLabel,
  getVisibleLocationLabel,
} from "../../lib/locationPrivacy";
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
  currentUserMeta,
  getPostStatus,
  formatTime,
  openPostDetail,
}: {
  filteredPosts: PostRow[];
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  currentUserMeta: string;
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
        const durationLabel = formatDuration(post.duration_minutes);

        return (
          <div
            key={post.id}
            onClick={() => openPostDetail(post.id)}
            className={`cursor-pointer ${SURFACE_CARD_CLASS} p-4`}
          >
            <div className={`${APP_INNER_PANEL_CLASS} p-3`}>
              <div className="grid grid-cols-[40px_minmax(0,1fr)_auto] items-start gap-x-2.5 gap-y-0.5">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] shadow-[0_8px_16px_rgba(118,126,133,0.1)] ${APP_ROW_SURFACE_CLASS}`}>
                  {getPurposeIcon(post.meeting_purpose)}
                </div>
                <div className="min-w-0 self-center truncate pt-[1px] text-[24px] font-black leading-none tracking-[-0.05em] text-[#1f2b34]">
                  {post.meeting_purpose || "Meetup"}
                </div>
                <div
                  className={`col-start-3 row-start-1 shrink-0 self-start rounded-[14px] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_8px_16px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,0.88)] ${getStatusBadgeClass(
                    postStatus
                  )}`}
                >
                  {postStatus}
                </div>
              </div>

              <div className="mt-1 min-w-0 pr-1 text-[12px] leading-[1.15] text-[#849099]">
                Hosted by you{currentUserMeta ? ` | ${currentUserMeta}` : ""}
              </div>

              <div className="mt-3 grid gap-2">
                {post.meeting_time && (
                  <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
                    <Clock3 className="h-4 w-4 shrink-0 text-[#7a8b95]" />
                    <span className="truncate">{formatTime(post.meeting_time)}</span>
                    {durationLabel ? (
                      <span className="ml-auto rounded-[14px] border border-[#cbd4db] bg-[linear-gradient(180deg,#ffffff_0%,#eceff2_100%)] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#3b4c56] shadow-[0_8px_14px_rgba(118,126,133,0.12)]">
                        {durationLabel}
                      </span>
                    ) : null}
                  </div>
                )}

                <div className={`flex min-h-[56px] items-center gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
                  <MapPin className="h-4 w-4 shrink-0 text-[#7a8b95]" />
                  <span className="min-w-0 flex-1 break-words line-clamp-2">
                    {post.place_name ||
                      getPublicLocationLabel(post.place_name, post.location) ||
                      "No place"}
                  </span>
                </div>

                <div className={`flex min-h-[56px] items-center justify-between gap-2.5 px-3.5 py-2 text-sm text-[#364149] ${APP_ROW_SURFACE_CLASS}`}>
                  <span className="inline-flex min-w-0 items-center gap-2 text-[#55646e]">
                    <UserRound className="h-4 w-4 shrink-0 text-[#7a8b95]" />
                    <span className="truncate">
                      {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                    </span>
                  </span>
                  {amount !== null ? (
                    <span className="inline-flex shrink-0 items-center rounded-[14px] border border-[#c7d2da] bg-[linear-gradient(180deg,#ffffff_0%,#ebf0f4_100%)] px-3 py-1.5 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#435760] shadow-[0_10px_18px_rgba(118,126,133,0.12)]">
                      CS ${amount.toLocaleString()}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className={`mt-3 flex items-center justify-between gap-3 rounded-[16px] px-3.5 py-2 ${SOFT_CARD_CLASS}`}>
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#8a949b]">
                  Refined mode
                </span>
                <span className="truncate text-sm font-semibold text-[#314454]">
                  {post.meeting_purpose || "Meetup"}
                </span>
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
  currentUserMeta,
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
  currentUserMeta: string;
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

            <MiniPostPreview
              post={postMap[item.post_id]}
              timeZone={userTimeZone}
              hostLine={`Hosted by you${currentUserMeta ? ` | ${currentUserMeta}` : ""}`}
            />

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
  profileMetaMap,
  postMap,
  userTimeZone,
  openPostDetail,
}: {
  requestsSent: MatchRequestRow[];
  profileMap: Record<string, string>;
  profileMetaMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  userTimeZone: string;
  openPostDetail: (postId: number) => void;
}) {
  return (
    <div className="space-y-4">
      {requestsSent.map((item) => {
        const hostName = profileMap[item.post_owner_user_id] || "Unknown";
        const hostMeta = profileMetaMap[item.post_owner_user_id] || "";
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

            <MiniPostPreview
              post={postMap[item.post_id]}
              timeZone={userTimeZone}
              hostLine={`Hosted by ${hostName}${hostMeta ? ` | ${hostMeta}` : ""}`}
            />
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
  profileMetaMap,
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
  profileMetaMap: Record<string, string>;
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
        const hostName = post?.user_id ? profileMap[post.user_id] || "Unknown" : "Unknown";
        const hostMeta = post?.user_id ? profileMetaMap[post.user_id] || "" : "";
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

            <MiniPostPreview
              post={post}
              timeZone={userTimeZone}
              hostLine={`Hosted by ${hostName}${hostMeta ? ` | ${hostMeta}` : ""}`}
            />

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
  profileMetaMap,
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
  profileMetaMap: Record<string, string>;
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
  const refreshInFlightRef = useRef(false);
  const refreshQueuedRef = useRef(false);
  const [liveReceivedItems, setLiveReceivedItems] = useState(requestsReceived);
  const [liveSentItems, setLiveSentItems] = useState(requestsSent);
  const [liveMatches, setLiveMatches] = useState(matches);
  const [livePostMap, setLivePostMap] = useState(postMap);
  const [liveProfileMap, setLiveProfileMap] = useState(profileMap);
  const [liveProfileMetaMap, setLiveProfileMetaMap] = useState(profileMetaMap);
  const [liveMatchSummaryMap, setLiveMatchSummaryMap] = useState(matchSummaryMap);
  const [liveMatchChatMetaMap, setLiveMatchChatMetaMap] = useState(matchChatMetaMap);
  const {
    userTimeZone,
    formatTime,
    formatTimeUntil,
    getPostStatus,
    posts,
    receivedItems,
    setReceivedItems,
    sentItems,
    setSentItems,
    matchItems,
    setMatchItems,
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
    requestsReceived: liveReceivedItems,
    requestsSent: liveSentItems,
    matches: liveMatches,
    postMap: livePostMap,
    profileMap: liveProfileMap,
    matchSummaryMap: liveMatchSummaryMap,
    reviewedMatchIds,
    userId,
    initialUserTimeZone,
  });
  const currentUserMeta = liveProfileMetaMap[userId] || "";

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

  const recentChats = matchItems
    .map((item) => {
      const otherUserId = item.user_a === userId ? item.user_b : item.user_a;
      const post = livePostMap[item.post_id];
      const chatMeta = liveMatchChatMetaMap[item.id];
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
        otherUserName: liveProfileMap[otherUserId] || "Unknown",
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

    try {
      const response = await fetch("/api/match-requests/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId,
          action: nextStatus,
        }),
      });

      const result = (await response.json()) as { ok?: boolean; error?: string };

      if (!response.ok || !result?.ok) {
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
        router.replace("/dashboard?tab=matches&success=1");
        router.refresh();
        return;
      }

      setReceivedItems((prev) =>
        prev.map((item) =>
          item.id === requestId ? { ...item, status: "rejected" } : item
        )
      );
      router.refresh();
    } catch (error) {
      console.error("Dashboard request action failed", error);
      alert("Failed to update request");
    } finally {
      setProcessingRequestId(null);
      setProcessingRequestAction(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let refreshChannel: ReturnType<typeof supabase.channel> | null = null;

    const hydrateDashboardRelations = async (
      nextReceived: MatchRequestRow[],
      nextSent: MatchRequestRow[],
      nextMatches: MatchRow[]
    ) => {
      const relatedUserIds = Array.from(
        new Set([
          ...nextReceived.map((item) => item.requester_user_id),
          ...nextSent.map((item) => item.post_owner_user_id),
          ...nextMatches.flatMap((item) => [item.user_a, item.user_b]),
        ])
      ).filter((id) => id !== userId);
      const profileUserIds = Array.from(new Set([...relatedUserIds, userId]));
      const relatedPostIds = Array.from(
        new Set([
          ...nextReceived.map((item) => item.post_id),
          ...nextSent.map((item) => item.post_id),
          ...nextMatches.map((item) => item.post_id),
        ])
      );

      const [profilesRes, postsRes, chatsRes, summaryRes] = await Promise.all([
        profileUserIds.length > 0
          ? supabase
              .from("profiles")
              .select("id, display_name, gender, age_group")
              .in("id", profileUserIds)
          : Promise.resolve({ data: [], error: null }),
        relatedPostIds.length > 0
          ? supabase
              .from("posts")
              .select(
                "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
              )
              .in("id", relatedPostIds)
          : Promise.resolve({ data: [], error: null }),
        nextMatches.length > 0
          ? supabase
              .from("match_chats")
              .select(
                "match_id, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, host_user_id, guest_user_id"
              )
              .in("match_id", nextMatches.map((match) => match.id))
          : Promise.resolve({ data: [], error: null }),
        initialPosts.length > 0
          ? supabase.rpc("get_post_match_summaries", {
              p_post_ids: initialPosts.map((post) => post.id),
            })
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (!mounted) return;

      const nextProfileMap: Record<string, string> = {};
      const nextProfileMetaMap: Record<string, string> = {};
      (
        (profilesRes.data || []) as Array<{
          id: string;
          display_name: string | null;
          gender: string | null;
          age_group: string | null;
        }>
      ).forEach((profile) => {
        nextProfileMap[profile.id] = profile.display_name || "Unknown";
        nextProfileMetaMap[profile.id] =
          profile.gender || profile.age_group
            ? `${profile.gender || "Unknown"}${profile.age_group ? ` / ${profile.age_group}` : ""}`
            : "";
      });

      const nextPostMap: Record<number, PostRow> = {};
      ((postsRes.data || []) as PostRow[]).forEach((post) => {
        nextPostMap[post.id] = post;
      });

      const nextChatMetaMap: Record<number, MatchChatMetaRow> = {};
      ((chatsRes.data || []) as MatchChatMetaRow[]).forEach((item) => {
        nextChatMetaMap[item.match_id] = item;
      });

      const nextSummaryMap: Record<
        number,
        { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
      > = {};
      (
        (summaryRes.data || []) as Array<{
          post_id: number;
          is_matched: boolean;
          pending_request_count: number;
          total_request_count: number;
        }>
      ).forEach((summary) => {
        nextSummaryMap[summary.post_id] = {
          isMatched: !!summary.is_matched,
          pendingRequestCount: Number(summary.pending_request_count || 0),
          totalRequestCount: Number(summary.total_request_count || 0),
        };
      });

      setLiveProfileMap(nextProfileMap);
      setLiveProfileMetaMap(nextProfileMetaMap);
      setLivePostMap(nextPostMap);
      setLiveMatchChatMetaMap(nextChatMetaMap);
      setLiveMatchSummaryMap(nextSummaryMap);
    };

    const runRefreshDashboardData = async () => {
      const [receivedRes, sentRes, matchesRes] = await Promise.all([
        supabase
          .from("match_requests")
          .select("id, post_id, requester_user_id, post_owner_user_id, status, created_at")
          .eq("post_owner_user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("match_requests")
          .select("id, post_id, requester_user_id, post_owner_user_id, status, created_at")
          .eq("requester_user_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("matches")
          .select("id, post_id, user_a, user_b, status, created_at")
          .or(`user_a.eq.${userId},user_b.eq.${userId}`)
          .order("created_at", { ascending: false }),
      ]);

      if (!mounted) return;

      const nextReceived = (receivedRes.data || []) as MatchRequestRow[];
      const nextSent = (sentRes.data || []) as MatchRequestRow[];
      const nextMatches = (matchesRes.data || []) as MatchRow[];

      setLiveReceivedItems(nextReceived);
      setLiveSentItems(nextSent);
      setLiveMatches(nextMatches);
      setReceivedItems(nextReceived);
      setSentItems(nextSent);
      setMatchItems(nextMatches);

      await hydrateDashboardRelations(nextReceived, nextSent, nextMatches);
    };

    const refreshDashboardData = async () => {
      if (refreshInFlightRef.current) {
        refreshQueuedRef.current = true;
        return;
      }

      refreshInFlightRef.current = true;

      try {
        await runRefreshDashboardData();
      } finally {
        refreshInFlightRef.current = false;

        if (refreshQueuedRef.current) {
          refreshQueuedRef.current = false;
          void refreshDashboardData();
        }
      }
    };

    refreshChannel = supabase
      .channel(`dashboard-live-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_requests",
          filter: `post_owner_user_id=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_requests",
          filter: `requester_user_id=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `user_a=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "matches",
          filter: `user_b=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_chats",
          filter: `host_user_id=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "match_chats",
          filter: `guest_user_id=eq.${userId}`,
        },
        () => void refreshDashboardData()
      )
      .subscribe();

    const handleWindowFocus = () => {
      void refreshDashboardData();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshDashboardData();
      }
    };

    const handlePageShow = () => {
      void refreshDashboardData();
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      mounted = false;
      refreshInFlightRef.current = false;
      refreshQueuedRef.current = false;
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      refreshChannel?.unsubscribe();
    };
  }, [
    initialPosts,
    setMatchItems,
    setReceivedItems,
    setSentItems,
    supabase,
    userId,
  ]);

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
                          {getVisibleLocationLabel({
                            placeName: item.post.place_name,
                            location: item.post.location,
                            revealExact: true,
                          }) || "Selected place"}
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
            subtext={activeTab === "posts" ? "Currently selected" : "Manage your meetups"}
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setActiveTab("posts")}
          />
          <DashboardTabCard
            active={activeTab === "matches"}
            label="Matches"
            value={matchItems.length}
            subtext={
              upcomingMatchedMeetups.length > 0
                ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-flex min-w-[18px] items-center justify-center rounded-full border border-[#b9c6cf] bg-[linear-gradient(180deg,#ffffff_0%,#dbe5eb_100%)] px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#2f404b] shadow-[0_10px_18px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]">
                        {upcomingMatchedMeetups.length > 99 ? "99+" : upcomingMatchedMeetups.length}
                      </span>
                      <span>upcoming</span>
                    </span>
                  )
                : "No upcoming"
            }
            icon={<HeartHandshake className="h-4 w-4" />}
            onClick={() => setActiveTab("matches")}
          />
          <DashboardTabCard
            active={activeTab === "sent"}
            label="Requests Sent"
            value={sentItems.length}
            subtext={
              acceptedSent > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex min-w-[18px] items-center justify-center rounded-full border border-[#a9b7c1] bg-[linear-gradient(180deg,#ffffff_0%,#d0dce4_100%)] px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#263844] shadow-[0_10px_18px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]">
                    {acceptedSent > 99 ? "99+" : acceptedSent}
                  </span>
                  <span>accepted</span>
                </span>
              ) : activeTab === "sent" ? (
                "Currently selected"
              ) : null
            }
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
                activeTab === "received" ? "Currently selected" : "No pending"
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
            matchSummaryMap={liveMatchSummaryMap}
            currentUserMeta={currentUserMeta}
            getPostStatus={getPostStatus}
            formatTime={formatTime}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "received" && (
          <ReceivedTabPanel
            receivedItems={filteredReceived}
            profileMap={liveProfileMap}
            currentUserMeta={currentUserMeta}
            postMap={livePostMap}
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
            profileMap={liveProfileMap}
            profileMetaMap={liveProfileMetaMap}
            postMap={livePostMap}
            userTimeZone={userTimeZone}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "matches" && (
          <MatchesTabPanel
            filteredMatches={filteredMatches}
            userId={userId}
            profileMap={liveProfileMap}
            profileMetaMap={liveProfileMetaMap}
            postMap={livePostMap}
            reviewedMatchIds={reviewedMatchIds}
            matchChatMetaMap={liveMatchChatMetaMap}
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
