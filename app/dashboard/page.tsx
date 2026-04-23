import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../../lib/supabase/server";
import { normalizeUserTimeZone, USER_TIME_ZONE_COOKIE } from "../../lib/userTimeZone";
import DashboardClient from "./DashboardClient";

export type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  created_at: string;
  status: string | null;
  cancelled_at: string | null;
  cancelled_by_user_id: string | null;
};

export type MatchRequestRow = {
  id: number;
  post_id: number;
  requester_user_id: string;
  post_owner_user_id: string;
  status: string;
  created_at: string;
};

export type MatchRow = {
  id: number;
  post_id: number;
  user_a: string;
  user_b: string;
  status: string;
  created_at: string;
};

export type MatchChatMetaRow = {
  match_id: number;
  last_chat_activity_at: string | null;
  last_seen_by_host_at: string | null;
  last_seen_by_guest_at: string | null;
  host_user_id: string;
  guest_user_id: string;
};

export type ProfileRow = {
  id: string;
  display_name: string | null;
  gender: string | null;
  age_group: string | null;
};

export type MatchReviewRow = {
  id: number;
  match_id: number;
  reviewer_user_id: string;
  reviewee_user_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
};

export type CancellationFeedbackRow = {
  id: number;
  match_id: number;
  feedback_user_id: string;
  created_at: string;
};

export type MatchSummaryRow = {
  post_id: number;
  is_matched: boolean;
  pending_request_count: number;
  total_request_count: number;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const initialUserTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [postsRes, receivedRes, sentRes, matchesRes, reviewsRes, cancellationFeedbackRes] =
    await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, status, cancelled_at, cancelled_by_user_id"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("match_requests")
      .select("id, post_id, requester_user_id, post_owner_user_id, status, created_at")
      .eq("post_owner_user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("match_requests")
      .select("id, post_id, requester_user_id, post_owner_user_id, status, created_at")
      .eq("requester_user_id", user.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("matches")
      .select("id, post_id, user_a, user_b, status, created_at")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order("created_at", { ascending: false }),

    supabase
      .from("match_reviews")
      .select("id, match_id, reviewer_user_id, reviewee_user_id, rating, review_text, created_at")
      .eq("reviewer_user_id", user.id),

    supabase
      .from("meetup_cancellation_feedback")
      .select("id, match_id, feedback_user_id, created_at")
      .eq("feedback_user_id", user.id),
  ]);

  const posts = (postsRes.data || []) as PostRow[];
  const requestsReceived = (receivedRes.data || []) as MatchRequestRow[];
  const requestsSent = (sentRes.data || []) as MatchRequestRow[];
  const matches = (matchesRes.data || []) as MatchRow[];
  const reviews = (reviewsRes.data || []) as MatchReviewRow[];
  const cancellationFeedback =
    (cancellationFeedbackRes.data || []) as CancellationFeedbackRow[];
  let matchChatMetaMap: Record<number, MatchChatMetaRow> = {};
  let matchSummaryMap: Record<
    number,
    { isMatched: boolean; pendingRequestCount: number; totalRequestCount: number }
  > = {};

  const relatedUserIds = Array.from(
    new Set([
      ...requestsReceived.map((item) => item.requester_user_id),
      ...requestsSent.map((item) => item.post_owner_user_id),
      ...matches.flatMap((item) => [item.user_a, item.user_b]),
    ])
  ).filter((id) => id !== user.id);
  const profileUserIds = Array.from(new Set([...relatedUserIds, user.id]));

  const relatedPostIds = Array.from(
    new Set([
      ...requestsReceived.map((item) => item.post_id),
      ...requestsSent.map((item) => item.post_id),
      ...matches.map((item) => item.post_id),
    ])
  );

  let profileMap: Record<string, string> = {};
  let profileMetaMap: Record<string, string> = {};
  let postMap: Record<number, PostRow> = {};

  if (profileUserIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name, gender, age_group")
      .in("id", profileUserIds);

    ((profilesData || []) as ProfileRow[]).forEach((profile) => {
      profileMap[profile.id] = profile.display_name || "Unknown";
      const gender = profile.gender || "";
      const ageGroup = profile.age_group || "";
      profileMetaMap[profile.id] =
        gender || ageGroup
          ? `${gender || "Unknown"}${ageGroup ? ` / ${ageGroup}` : ""}`
          : "";
    });
  }

  if (relatedPostIds.length > 0) {
    const { data: relatedPostsData } = await supabase
      .from("posts")
      .select(
        "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at, status, cancelled_at, cancelled_by_user_id"
      )
      .in("id", relatedPostIds);

    ((relatedPostsData || []) as PostRow[]).forEach((post) => {
      postMap[post.id] = post;
    });
  }

  if (posts.length > 0) {
    const { data: summaryData } = await supabase.rpc("get_post_match_summaries", {
      p_post_ids: posts.map((post) => post.id),
    });

    ((summaryData || []) as MatchSummaryRow[]).forEach((summary) => {
      matchSummaryMap[summary.post_id] = {
        isMatched: !!summary.is_matched,
        pendingRequestCount: Number(summary.pending_request_count || 0),
        totalRequestCount: Number(summary.total_request_count || 0),
      };
    });
  }

  const reviewedMatchIds = reviews.map((r) => r.match_id);
  const cancellationFeedbackMatchIds = cancellationFeedback.map((item) => item.match_id);

  if (matches.length > 0) {
    const { data: matchChatMetaData } = await supabase
      .from("match_chats")
      .select(
        "match_id, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, host_user_id, guest_user_id"
      )
      .in("match_id", matches.map((match) => match.id));

    ((matchChatMetaData || []) as MatchChatMetaRow[]).forEach((item) => {
      matchChatMetaMap[item.match_id] = item;
    });
  }

  return (
    <DashboardClient
      userId={user.id}
      posts={posts}
      requestsReceived={requestsReceived}
      requestsSent={requestsSent}
      matches={matches}
      profileMap={profileMap}
      profileMetaMap={profileMetaMap}
      postMap={postMap}
      matchSummaryMap={matchSummaryMap}
      reviewedMatchIds={reviewedMatchIds}
      cancellationFeedbackMatchIds={cancellationFeedbackMatchIds}
      matchChatMetaMap={matchChatMetaMap}
      initialUserTimeZone={initialUserTimeZone}
    />
  );
}
