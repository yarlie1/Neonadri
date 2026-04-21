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
export type PostFilter = "all" | "open" | "expired";
export type ReceivedFilter = "all" | "pending";
export type MatchFilter = "all" | "upcoming" | "expired" | "review_due";
export type SentFilter = "all" | "pending" | "accepted" | "rejected";

export function useDashboardState({
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
}: {
  initialPosts: PostRow[];
  requestsReceived: MatchRequestRow[];
  requestsSent: MatchRequestRow[];
  matches: MatchRow[];
  postMap: Record<number, PostRow>;
  profileMap: Record<string, string>;
  matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  >;
  reviewedMatchIds: number[];
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
  const [sentItems, setSentItems] = useState(requestsSent);
  const [matchItems, setMatchItems] = useState(matches);
  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [receivedFilter, setReceivedFilter] = useState<ReceivedFilter>("pending");
  const [sentFilter, setSentFilter] = useState<SentFilter>("all");
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

  useEffect(() => {
    setReceivedItems(requestsReceived);
  }, [requestsReceived]);

  useEffect(() => {
    setSentItems(requestsSent);
  }, [requestsSent]);

  useEffect(() => {
    setMatchItems(matches);
  }, [matches]);

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

  const filteredReceived = useMemo(() => {
    if (receivedFilter === "all") return receivedItems;
    return receivedItems.filter((item) => item.status === "pending");
  }, [receivedItems, receivedFilter]);

  const filteredSent = useMemo(() => {
    if (sentFilter === "all") return sentItems;
    return sentItems.filter((item) => item.status === sentFilter);
  }, [sentItems, sentFilter]);

  const pendingSent = useMemo(
    () => sentItems.filter((item) => item.status === "pending").length,
    [sentItems]
  );

  const acceptedSent = useMemo(
    () => sentItems.filter((item) => item.status === "accepted").length,
    [sentItems]
  );

  const filteredMatches = useMemo(() => {
    if (matchFilter === "all") return matchItems;
    return matchItems.filter((match) => {
      const post = postMap[match.post_id];
      const status = getPostStatus(post?.meeting_time || null).toLowerCase();
      if (matchFilter === "review_due") {
        return status === "expired" && !reviewedMatchIds.includes(match.id);
      }
      return status === matchFilter;
    });
  }, [matchItems, matchFilter, postMap, reviewedMatchIds]);

  const pendingReceived = useMemo(
    () => receivedItems.filter((item) => item.status === "pending").length,
    [receivedItems]
  );

  const upcomingMatchedMeetups = useMemo(() => {
    return matchItems
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
  }, [matchItems, postMap, profileMap, userId, userTimeZone]);

  return {
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
    pendingSent,
    acceptedSent,
    upcomingMatchedMeetups,
  };
}
