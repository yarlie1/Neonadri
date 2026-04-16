"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatMeetingCountdown,
  formatMeetingTime,
  getMeetingStatus,
  parseMeetingTime,
} from "../../lib/meetingTime";
import type { MatchRow, MatchRequestRow, PostRow } from "./page";
import { getPostMatchState } from "./dashboardComponents";

export type DashboardTab = "posts" | "received" | "sent" | "matches";
export type PostFilter = "all" | "open" | "matched" | "expired";
export type MatchFilter = "all" | "upcoming" | "expired";

export function useDashboardState({
  initialPosts,
  requestsReceived,
  matches,
  postMap,
  profileMap,
  matchSummaryMap,
  userId,
  initialUserTimeZone,
}: {
  initialPosts: PostRow[];
  requestsReceived: MatchRequestRow[];
  matches: MatchRow[];
  postMap: Record<number, PostRow>;
  profileMap: Record<string, string>;
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  userId: string;
  initialUserTimeZone: string;
}) {
  const userTimeZone = useMemo(
    () => initialUserTimeZone,
    [initialUserTimeZone]
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
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(
    null
  );
  const [processingRequestAction, setProcessingRequestAction] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

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

  return {
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
  };
}
