import { getMeetingStatus } from "./meetingTime";
import { isConfirmedMatchStatus } from "./matches/status";

type QueryResult = {
  data?: any;
  error?: any;
  count?: number | null;
};

type QueryBuilder = PromiseLike<QueryResult> & {
  eq: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: unknown[]) => QueryBuilder;
  or: (filters: string) => QueryBuilder;
  select: (columns: string, options?: Record<string, unknown>) => QueryBuilder;
};

type SupabaseLikeClient = {
  from: (table: string) => QueryBuilder;
};

export type NavIndicatorState = {
  pendingCount: number;
  acceptedSentCount: number;
  upcomingMatchCount: number;
  hasNewChatActivity: boolean;
};

async function countRequestsOnLiveMeetups(
  supabase: SupabaseLikeClient,
  {
    userId,
    requestColumn,
    status,
    userTimeZone,
    upcomingOnly = false,
  }: {
    userId: string;
    requestColumn: "post_owner_user_id" | "requester_user_id";
    status: "pending" | "accepted";
    userTimeZone: string;
    upcomingOnly?: boolean;
  }
) {
  const { data, error } = await supabase
    .from("match_requests")
    .select("id, post_id")
    .eq(requestColumn, userId)
    .eq("status", status);

  if (error) {
    throw error;
  }

  const requestRows = data || [];
  const postIds = Array.from(
    new Set(requestRows.map((row: { post_id: number | null }) => row.post_id).filter(Boolean))
  );

  if (postIds.length === 0) {
    return 0;
  }

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, status, meeting_time")
    .in("id", postIds);

  if (postsError) {
    throw postsError;
  }

  const livePostIds = new Set(
    (postsData || [])
      .filter((post: { id: number; status: string | null; meeting_time: string | null }) => {
        if (String(post.status || "open").toLowerCase() === "cancelled") {
          return false;
        }

        if (!upcomingOnly) {
          return true;
        }

        return getMeetingStatus(post.meeting_time || null, userTimeZone) === "Upcoming";
      })
      .map((post: { id: number }) => post.id)
  );

  return requestRows.filter((row: { post_id: number }) => livePostIds.has(row.post_id)).length;
}

async function loadPendingCount(supabase: SupabaseLikeClient, userId: string) {
  const { count, error } = await supabase
    .from("match_requests")
    .select("id", { count: "exact", head: true })
    .eq("post_owner_user_id", userId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }

  return count || 0;
}

async function loadAcceptedSentCount(
  supabase: SupabaseLikeClient,
  userId: string,
  userTimeZone: string
) {
  return countRequestsOnLiveMeetups(supabase, {
    userId,
    requestColumn: "requester_user_id",
    status: "accepted",
    userTimeZone,
    upcomingOnly: true,
  });
}

async function loadUpcomingMatchCount(
  supabase: SupabaseLikeClient,
  userId: string,
  userTimeZone: string
) {
  const { data, error } = await supabase
    .from("matches")
    .select("id, post_id, status")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);

  if (error) {
    throw error;
  }

  const confirmedMatches = (data || []).filter((row: { status: string | null }) =>
    isConfirmedMatchStatus(String(row.status || ""))
  );
  const postIds = Array.from(
    new Set(confirmedMatches.map((row: { post_id: number | null }) => row.post_id).filter(Boolean))
  );

  if (postIds.length === 0) {
    return 0;
  }

  const { data: postsData, error: postsError } = await supabase
    .from("posts")
    .select("id, status, meeting_time")
    .in("id", postIds);

  if (postsError) {
    throw postsError;
  }

  const upcomingPostIds = new Set(
    (postsData || [])
      .filter((post: { id: number; status: string | null; meeting_time: string | null }) => {
        if (String(post.status || "open").toLowerCase() === "cancelled") {
          return false;
        }

        return getMeetingStatus(post.meeting_time || null, userTimeZone) === "Upcoming";
      })
      .map((post: { id: number }) => post.id)
  );

  return confirmedMatches.filter((row: { post_id: number }) => upcomingPostIds.has(row.post_id))
    .length;
}

async function loadHasNewChatActivity(supabase: SupabaseLikeClient, userId: string) {
  const { data, error } = await supabase
    .from("match_chats")
    .select(
      "host_user_id,guest_user_id,last_chat_activity_at,last_seen_by_host_at,last_seen_by_guest_at"
    )
    .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`);

  if (error) {
    throw error;
  }

  return (data || []).some(
    (row: {
      host_user_id: string;
      guest_user_id: string;
      last_chat_activity_at: string | null;
      last_seen_by_host_at: string | null;
      last_seen_by_guest_at: string | null;
    }) => {
      if (!row.last_chat_activity_at) return false;

      const lastActivity = new Date(row.last_chat_activity_at).getTime();
      if (Number.isNaN(lastActivity)) return false;

      const lastSeen =
        row.host_user_id === userId ? row.last_seen_by_host_at : row.last_seen_by_guest_at;

      if (!lastSeen) return true;

      const lastSeenTime = new Date(lastSeen).getTime();
      if (Number.isNaN(lastSeenTime)) return true;

      return lastActivity > lastSeenTime;
    }
  );
}

export async function loadNavIndicatorState(
  supabase: SupabaseLikeClient,
  userId: string,
  userTimeZone: string
): Promise<NavIndicatorState> {
  const [pendingCount, acceptedSentCount, upcomingMatchCount, hasNewChatActivity] =
    await Promise.all([
      loadPendingCount(supabase, userId),
      loadAcceptedSentCount(supabase, userId, userTimeZone),
      loadUpcomingMatchCount(supabase, userId, userTimeZone),
      loadHasNewChatActivity(supabase, userId),
    ]);

  return {
    pendingCount,
    acceptedSentCount,
    upcomingMatchCount,
    hasNewChatActivity,
  };
}
