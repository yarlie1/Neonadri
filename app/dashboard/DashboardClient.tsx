"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  MessageSquareMore,
  FileText,
  Inbox,
  Send,
  HeartHandshake,
  Plus,
  Star,
} from "lucide-react";
import type { MatchChatMetaRow, MatchRow, MatchRequestRow, PostRow } from "./page";
import { getMeetingStatus, parseMeetingTime } from "../../lib/meetingTime";
import {
  CompactActionButton,
  DashboardCompactMeetupCard,
  DashboardTabCard,
  FilterPill,
  getPostMatchState,
  getStatusBadgeClass,
  SectionIntro,
  SOFT_CARD_CLASS,
  SURFACE_CARD_CLASS,
} from "./dashboardComponents";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_INNER_PANEL_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
} from "../designSystem";
import { useDashboardState } from "./useDashboardState";
import { useCreateMeetupHref } from "../useCreateMeetupHref";

function PostsTabPanel({
  filteredPosts,
  matchSummaryMap,
  currentUserMeta,
  userTimeZone,
  getPostLifecycleStatus,
  openPostDetail,
}: {
  filteredPosts: PostRow[];
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  currentUserMeta: string;
  userTimeZone: string;
  getPostLifecycleStatus: (post: PostRow | null | undefined) => "Upcoming" | "Expired" | "Cancelled";
  openPostDetail: (postId: number) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
      {filteredPosts.map((post) => {
        const postStatus = getPostMatchState(
          getPostLifecycleStatus(post),
          matchSummaryMap[post.id]
        );
        const pendingCount = matchSummaryMap[post.id]?.pendingRequestCount || 0;

        return (
          <DashboardCompactMeetupCard
            key={post.id}
            post={post}
            timeZone={userTimeZone}
            title={post.meeting_purpose || "Meetup"}
            subtitle={`Hosted by you${currentUserMeta ? ` / ${currentUserMeta}` : ""}${pendingCount ? ` / ${pendingCount} pending` : ""}`}
            badgeLabel={postStatus}
            badgeClassName={getStatusBadgeClass(postStatus)}
            onClick={() => openPostDetail(post.id)}
          />
        );
      })}

      {filteredPosts.length === 0 && (
        <div className={`col-span-full ${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#78848c]`}>
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
          <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dde6ec] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafb_100%)] text-[#738690]">
            <MessageSquareMore className="h-4 w-4" />
          </div>
          <div>
            <div className={APP_EYEBROW_CLASS}>
              Meetup chat
            </div>
            <div className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Meetup chat updates.
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
            Meetup chat
          </div>
          <div className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[#24323f]">
            Recent meetup chats
          </div>
        </div>
        <Link
          href="/chats"
          className="shrink-0 rounded-full border border-[#d6dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] px-3 py-2 text-xs font-medium text-[#52616a] transition hover:bg-[#f5f8fa]"
        >
          View all chats
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] border border-[#dde6ec] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafb_100%)]">
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
                  <span className="shrink-0 rounded-full border border-[#dde6ec] bg-[linear-gradient(180deg,#ffffff_0%,#f7fafb_100%)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#5f7480]">
                    New
                  </span>
                ) : null}
              </div>
              <div className="mt-1 truncate text-xs text-[#78848c]">
                {formatRecentChatTime(chat.meetingTime, userTimeZone)}  /  {chat.placeLabel}
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
  openPostDetail,
}: {
  receivedItems: MatchRequestRow[];
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  userTimeZone: string;
  openPostDetail: (postId: number) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
      {receivedItems.map((item) => {
        const requesterName = profileMap[item.requester_user_id] || "Unknown";
        const relatedPost = postMap[item.post_id];
        const isCancelled =
          String(relatedPost?.status || "open").toLowerCase() === "cancelled";
        const title =
          isCancelled
            ? "Meetup cancelled"
            : item.status === "pending"
            ? `${requesterName} wants to join`
            : item.status === "accepted"
            ? `Accepted ${requesterName}`
            : `Declined ${requesterName}`;
        const badgeLabel = isCancelled ? "cancelled" : item.status;

        return (
          <DashboardCompactMeetupCard
            key={item.id}
            post={relatedPost}
            timeZone={userTimeZone}
            title={title}
            subtitle={new Date(item.created_at).toLocaleString()}
            badgeLabel={badgeLabel}
            badgeClassName={getStatusBadgeClass(badgeLabel)}
            onClick={() => openPostDetail(item.post_id)}
          />
        );
      })}

      {receivedItems.length === 0 && (
        <div className={`col-span-full ${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
      {requestsSent.map((item) => {
        const hostName = profileMap[item.post_owner_user_id] || "Unknown";
        const relatedPost = postMap[item.post_id];
        const isCancelled =
          String(relatedPost?.status || "open").toLowerCase() === "cancelled";
        const isUpcomingAccepted =
          !isCancelled &&
          item.status === "accepted" &&
          getMeetingStatus(relatedPost?.meeting_time || null, userTimeZone) === "Upcoming";
        const acceptedMessage =
          !isCancelled && item.status === "accepted"
            ? `Accepted by ${hostName}`
            : null;
        const title =
          isCancelled
            ? `${hostName} cancelled`
            : item.status === "rejected"
            ? `Declined by ${hostName}`
            : acceptedMessage
            ? acceptedMessage
            : `Sent to ${hostName}`;
        const badgeLabel = isCancelled
          ? "cancelled"
          : isUpcomingAccepted
          ? "upcoming accepted"
          : item.status;

        return (
          <DashboardCompactMeetupCard
            key={item.id}
            post={relatedPost}
            timeZone={userTimeZone}
            title={title}
            subtitle={new Date(item.created_at).toLocaleString()}
            badgeLabel={badgeLabel}
            badgeClassName={getStatusBadgeClass(isCancelled ? "cancelled" : item.status)}
            onClick={() => openPostDetail(item.post_id)}
          />
        );
      })}

      {requestsSent.length === 0 && (
        <div className={`col-span-full ${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
  cancellationFeedbackMatchIds,
  matchChatMetaMap,
  userTimeZone,
  getPostLifecycleStatus,
  openPostDetail,
}: {
  filteredMatches: MatchRow[];
  userId: string;
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  reviewedMatchIds: number[];
  cancellationFeedbackMatchIds: number[];
  matchChatMetaMap: Record<number, MatchChatMetaRow>;
  userTimeZone: string;
  getPostLifecycleStatus: (post: PostRow | null | undefined) => "Upcoming" | "Expired" | "Cancelled";
  openPostDetail: (postId: number) => void;
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
      {filteredMatches.map((item) => {
        const otherUserId = item.user_a === userId ? item.user_b : item.user_a;
        const post = postMap[item.post_id];
        const hostName = post?.user_id ? profileMap[post.user_id] || "Unknown" : "Unknown";
        const otherUserName = profileMap[otherUserId] || "Unknown";
        const alreadyReviewed = reviewedMatchIds.includes(item.id);
        const alreadyLeftCancellationFeedback =
          cancellationFeedbackMatchIds.includes(item.id);
        const meetupStatus = getPostLifecycleStatus(post).toLowerCase();
        const canLeaveReview = meetupStatus === "expired" && !alreadyReviewed;
        const canLeaveCancellationFeedback =
          meetupStatus === "cancelled" &&
          post?.cancelled_by_user_id !== userId &&
          !alreadyLeftCancellationFeedback;
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
        const badgeLabel =
          meetupStatus === "upcoming"
            ? "Matched"
            : meetupStatus === "cancelled"
            ? "Cancelled"
            : "Expired";
        const title =
          meetupStatus === "cancelled"
            ? `Cancelled by ${hostName}`
            : `Matched with ${otherUserName}`;

        return (
          <DashboardCompactMeetupCard
            key={item.id}
            post={post}
            timeZone={userTimeZone}
            title={title}
            subtitle={`Matched ${new Date(item.created_at).toLocaleString()}`}
            badgeLabel={badgeLabel}
            badgeClassName={getStatusBadgeClass(meetupStatus)}
            onClick={() => openPostDetail(item.post_id)}
            actions={
              <>
                <CompactActionButton href={`/matches/${item.id}/chat`}>
                  <HeartHandshake className="h-3.5 w-3.5" />
                  {meetupStatus === "cancelled" ? "Read Chat" : "Open Chat"}
                  {meetupStatus !== "cancelled" && hasNewMessage ? (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#b56c57]" />
                  ) : null}
                </CompactActionButton>

                {canLeaveReview ? (
                  <CompactActionButton href={`/reviews/write/${item.id}`}>
                    <Star className="h-3.5 w-3.5" />
                    Leave Review
                  </CompactActionButton>
                ) : canLeaveCancellationFeedback ? (
                  <CompactActionButton href={`/cancellation-feedback/write/${item.id}`}>
                    <Star className="h-3.5 w-3.5" />
                    Leave Feedback
                  </CompactActionButton>
                ) : alreadyLeftCancellationFeedback ? (
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    <Star className="h-3.5 w-3.5" />
                    Feedback submitted
                  </div>
                ) : meetupStatus === "cancelled" ? (
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                    <Star className="h-3.5 w-3.5" />
                    Cancellation recorded
                  </div>
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
              </>
            }
          />
        );
      })}

      {filteredMatches.length === 0 && (
        <div className={`col-span-full ${SURFACE_CARD_CLASS} px-6 py-10 text-center text-[#7f8a92]`}>
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
  cancellationFeedbackMatchIds,
  matchChatMetaMap,
  initialUserTimeZone,
  initialCreateHref,
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
  cancellationFeedbackMatchIds: number[];
  matchChatMetaMap: Record<number, MatchChatMetaRow>;
  initialUserTimeZone: string;
  initialCreateHref: string;
}) {
  const createHref = useCreateMeetupHref(true, initialCreateHref);
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
    getPostLifecycleStatus,
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
    showMatchSuccess,
    showReviewSuccess,
    showCancellationFeedbackSuccess,
    filteredPosts,
    filteredReceived,
    filteredSent,
    filteredMatches,
    reviewDueMatches,
    pendingReceived,
    acceptedReceived,
    rejectedReceived,
    acceptedSent,
    upcomingAcceptedSent,
    upcomingMatchedMeetups,
    setPosts,
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
      setSentFilter(upcomingAcceptedSent > 0 ? "accepted" : "all");
      return;
    }

    if (activeTab === "matches") {
      setMatchFilter(upcomingMatchedMeetups.length > 0 ? "upcoming" : "all");
    }
  }, [
    acceptedSent,
    upcomingAcceptedSent,
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

  const openPostDetail = (postId?: number) => {
    if (!postId) return;
    router.push(`/posts/${postId}`);
  };

  useEffect(() => {
    let mounted = true;
    let refreshChannel: ReturnType<typeof supabase.channel> | null = null;

    const hydrateDashboardRelations = async (
      nextReceived: MatchRequestRow[],
      nextSent: MatchRequestRow[],
      nextMatches: MatchRow[]
    ) => {
      const hostPostsPromise = supabase
        .from("posts")
        .select(
          "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, status, cancelled_at, cancelled_by_user_id"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

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

      const [hostPostsRes, profilesRes, postsRes, chatsRes, summaryRes] = await Promise.all([
        hostPostsPromise,
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
                "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, status, cancelled_at"
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

      setPosts((hostPostsRes.data || []) as PostRow[]);
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
            table: "posts",
            filter: `user_id=eq.${userId}`,
          },
          () => void refreshDashboardData()
        )
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
    void refreshDashboardData();

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
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
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

        {showCancellationFeedbackSuccess && (
          <div className={`${SOFT_CARD_CLASS} px-4 py-3 text-sm font-medium text-[#52616a] shadow-sm`}>
            Cancellation feedback submitted successfully.
          </div>
        )}

        <div className="relative overflow-hidden rounded-[24px] border border-[#dce5eb] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(246,249,251,0.99)_100%)] px-6 py-6 shadow-[0_18px_36px_rgba(118,126,133,0.09),inset_0_1px_0_rgba(255,255,255,1)]">
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
                Your meetups, requests, and chats.
              </p>
            </div>

            <Link
              href={createHref}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
          </div>
        </div>

        {reviewDueMatches.length > 0 ? (
          <Link
            href={`/reviews/write/${reviewDueMatches[0].id}`}
            className={`${SOFT_CARD_CLASS} block px-4 py-3 text-[#43525b] shadow-sm transition hover:bg-white/90`}
          >
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7f8990]">
              Review reminder
            </div>
            <div className="mt-1 text-sm font-medium leading-6">
              {reviewDueMatches.length === 1
                ? "1 review due."
                : `${reviewDueMatches.length} reviews due.`}
            </div>
          </Link>
        ) : null}

        {upcomingMatchedMeetups.length > 0 && (
          <div className={`${SURFACE_CARD_CLASS} p-4 sm:p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={APP_EYEBROW_CLASS}>
                  Coming up next
                </div>
                <div className="mt-2 text-xl font-black tracking-[-0.04em] text-[#24323f]">
                  Your next meetup
                </div>
                <div className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
                  Next confirmed plan.
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
              {upcomingMatchedMeetups.map((item) => {
                const countdown = formatTimeUntil(item.post.meeting_time);

                return (
                  <DashboardCompactMeetupCard
                    key={item.match.id}
                    post={item.post}
                    timeZone={userTimeZone}
                    title={item.post.meeting_purpose || "Next confirmed plan"}
                    subtitle={countdown || "Next confirmed plan"}
                    badgeLabel="Matched"
                    badgeClassName={getStatusBadgeClass("matched")}
                    onClick={() => openPostDetail(item.post.id)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <RecentChatsPanel recentChats={recentChats} userTimeZone={userTimeZone} />

        <div>
          <div className={`${APP_EYEBROW_CLASS} mb-3 px-1`}>Manage your meetup activity</div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <DashboardTabCard
            active={activeTab === "posts"}
            label="My Posts"
            value={posts.length}
            subtext="Manage your meetups"
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
              upcomingAcceptedSent > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex min-w-[18px] items-center justify-center rounded-full border border-[#a9b7c1] bg-[linear-gradient(180deg,#ffffff_0%,#d0dce4_100%)] px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-[#263844] shadow-[0_10px_18px_rgba(118,126,133,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]">
                    {upcomingAcceptedSent > 99 ? "99+" : upcomingAcceptedSent}
                  </span>
                  <span>Upcoming accepted</span>
                </span>
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
              ) : "No pending"
            }
            icon={<Inbox className="h-4 w-4" />}
            onClick={() => setActiveTab("received")}
          />
        </div>
        </div>

        {activeTab === "posts" && (
          <div className={`${SURFACE_CARD_CLASS} p-4`}>
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Hosting"
                title="Everything you are hosting"
                body="Your hosted meetups."
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
                  <FilterPill
                    active={postFilter === "cancelled"}
                    onClick={() => setPostFilter("cancelled")}
                  >
                    Cancelled
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
                body="Incoming requests."
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
                <FilterPill
                  active={receivedFilter === "accepted"}
                  onClick={() => setReceivedFilter("accepted")}
                >
                  Accepted
                </FilterPill>
                <FilterPill
                  active={receivedFilter === "rejected"}
                  onClick={() => setReceivedFilter("rejected")}
                >
                  Rejected
                </FilterPill>
                <FilterPill
                  active={receivedFilter === "cancelled"}
                  onClick={() => setReceivedFilter("cancelled")}
                >
                  Cancelled
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
                body="Requests you sent."
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
                <FilterPill
                  active={sentFilter === "cancelled"}
                  onClick={() => setSentFilter("cancelled")}
                >
                  Cancelled
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
                body="Confirmed meetups."
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
                <FilterPill
                  active={matchFilter === "cancelled"}
                  onClick={() => setMatchFilter("cancelled")}
                >
                  Cancelled
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
            userTimeZone={userTimeZone}
            getPostLifecycleStatus={getPostLifecycleStatus}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "received" && (
          <ReceivedTabPanel
            receivedItems={filteredReceived}
            profileMap={liveProfileMap}
            postMap={livePostMap}
            userTimeZone={userTimeZone}
            openPostDetail={openPostDetail}
          />
        )}

        {activeTab === "sent" && (
          <SentTabPanel
            requestsSent={filteredSent}
            profileMap={liveProfileMap}
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
            postMap={livePostMap}
            reviewedMatchIds={reviewedMatchIds}
            cancellationFeedbackMatchIds={cancellationFeedbackMatchIds}
            matchChatMetaMap={liveMatchChatMetaMap}
            userTimeZone={userTimeZone}
            getPostLifecycleStatus={getPostLifecycleStatus}
            openPostDetail={openPostDetail}
          />
        )}
      </div>
    </main>
  );
}
