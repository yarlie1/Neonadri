import { getMeetingStatus } from "./meetingTime";
import type { SupabaseClient } from "@supabase/supabase-js";

const ADMIN_TIME_ZONE = "America/Los_Angeles";
const RECENT_ITEM_LIMIT = 8;

type ProfileRow = {
  id: string;
  display_name: string | null;
  signup_intent: "guest" | "host" | null;
  created_at: string | null;
};

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  meeting_purpose: string | null;
  status: string | null;
  created_at: string;
};

type MatchRow = {
  id: number;
  post_id: number;
  user_a: string;
  user_b: string;
  created_at: string;
};

type MatchReviewRow = {
  match_id: number;
};

type BetaApplicationRow = {
  id: number;
  email: string;
  full_name: string | null;
  city: string | null;
  status: string;
  created_at: string;
};

type SiteVisitRow = {
  visitor_id: string;
  created_at: string;
};

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);

  const offsetLabel =
    parts.find((part) => part.type === "timeZoneName")?.value || "GMT+0";
  const match = offsetLabel.match(/(?:GMT|UTC)([+-])(\d{1,2})(?::?(\d{2}))?/i);

  if (!match) return 0;

  const [, sign, hourText, minuteText] = match;
  const hours = Number(hourText || "0");
  const minutes = Number(minuteText || "0");
  const direction = sign === "-" ? -1 : 1;

  return direction * (hours * 60 + minutes) * 60 * 1000;
}

function getStartOfTodayIso(timeZone: string) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = Number(parts.find((part) => part.type === "year")?.value || "0");
  const month = Number(
    parts.find((part) => part.type === "month")?.value || "1"
  );
  const day = Number(parts.find((part) => part.type === "day")?.value || "1");

  const baseUtcMs = Date.UTC(year, month - 1, day, 0, 0, 0);
  let candidate = new Date(baseUtcMs);

  for (let i = 0; i < 2; i += 1) {
    const offsetMs = getTimeZoneOffsetMs(candidate, timeZone);
    candidate = new Date(baseUtcMs - offsetMs);
  }

  return candidate.toISOString();
}

function getPostLifecycleStatus(post: Pick<PostRow, "status" | "meeting_time">) {
  if (String(post.status || "open").toLowerCase() === "cancelled") {
    return "Cancelled" as const;
  }

  return getMeetingStatus(post.meeting_time, ADMIN_TIME_ZONE);
}

export async function getAdminOverviewData(admin: SupabaseClient) {
  const startOfTodayIso = getStartOfTodayIso(ADMIN_TIME_ZONE);
  const weekAgoIso = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString();

  const [
    profilesRes,
    postsRes,
    matchesRes,
    reviewsRes,
    betaApplicationsRes,
    siteVisitsRes,
  ] =
    await Promise.all([
      admin
        .from("profiles")
        .select("id, display_name, signup_intent, created_at")
        .order("created_at", { ascending: false }),
      admin
        .from("posts")
        .select(
          "id, user_id, place_name, location, meeting_time, meeting_purpose, status, created_at"
        )
        .order("created_at", { ascending: false }),
      admin
        .from("matches")
        .select("id, post_id, user_a, user_b, created_at")
        .order("created_at", { ascending: false }),
      admin.from("match_reviews").select("match_id"),
      admin
        .from("beta_applications")
        .select("id, email, full_name, city, status, created_at")
        .order("created_at", { ascending: false }),
      admin
        .from("site_visits")
        .select("visitor_id, created_at")
        .order("created_at", { ascending: false }),
    ]);

  if (profilesRes.error) throw profilesRes.error;
  if (postsRes.error) throw postsRes.error;
  if (matchesRes.error) throw matchesRes.error;
  if (reviewsRes.error) throw reviewsRes.error;
  if (betaApplicationsRes.error) throw betaApplicationsRes.error;
  if (siteVisitsRes.error) throw siteVisitsRes.error;

  const profiles = (profilesRes.data || []) as ProfileRow[];
  const posts = (postsRes.data || []) as PostRow[];
  const matches = (matchesRes.data || []) as MatchRow[];
  const reviews = (reviewsRes.data || []) as MatchReviewRow[];
  const betaApplications = (betaApplicationsRes.data || []) as BetaApplicationRow[];
  const siteVisits = (siteVisitsRes.data || []) as SiteVisitRow[];

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile.display_name || "Unknown"])
  );
  const postMap = new Map(posts.map((post) => [post.id, post]));
  const reviewedMatchIds = new Set(reviews.map((review) => review.match_id));

  const pendingBetaApplications = betaApplications.filter(
    (item) => item.status === "pending"
  );
  const upcomingMeetups = posts.filter(
    (post) => getPostLifecycleStatus(post) === "Upcoming"
  );
  const matchesThisWeek = matches.filter(
    (match) => match.created_at >= weekAgoIso
  );
  const totalVisitorIds = new Set(siteVisits.map((visit) => visit.visitor_id));
  const todayVisitorIds = new Set(
    siteVisits
      .filter((visit) => visit.created_at >= startOfTodayIso)
      .map((visit) => visit.visitor_id)
  );
  const reviewDueMatches = matches.filter((match) => {
    const post = postMap.get(match.post_id);
    if (!post) return false;
    return (
      getPostLifecycleStatus(post) === "Expired" &&
      !reviewedMatchIds.has(match.id)
    );
  });

  return {
    metrics: {
      totalUsers: profiles.length,
      newUsersToday: profiles.filter(
        (profile) => !!profile.created_at && profile.created_at >= startOfTodayIso
      ).length,
      pendingBetaApplications: pendingBetaApplications.length,
      upcomingMeetups: upcomingMeetups.length,
      matchesThisWeek: matchesThisWeek.length,
      reviewsDue: reviewDueMatches.length,
      totalVisitors: totalVisitorIds.size,
      visitorsToday: todayVisitorIds.size,
    },
    recentSignups: profiles.slice(0, RECENT_ITEM_LIMIT).map((profile) => ({
      id: profile.id,
      displayName: profile.display_name || "Unknown",
      signupIntent: profile.signup_intent || "guest",
      createdAt: profile.created_at,
    })),
    recentMeetups: posts.slice(0, RECENT_ITEM_LIMIT).map((post) => ({
      id: post.id,
      hostDisplayName: profileMap.get(post.user_id) || "Unknown",
      placeName: post.place_name || post.location || "Selected place",
      meetingPurpose: post.meeting_purpose || "Meetup",
      createdAt: post.created_at,
      status: getPostLifecycleStatus(post),
    })),
    pendingBetaApplications: pendingBetaApplications
      .slice(0, RECENT_ITEM_LIMIT)
      .map((item) => ({
        id: item.id,
        email: item.email,
        fullName: item.full_name || "Not provided",
        city: item.city || "Unknown region",
        createdAt: item.created_at,
      })),
    reviewDueMatches: reviewDueMatches.slice(0, RECENT_ITEM_LIMIT).map((match) => {
      const post = postMap.get(match.post_id);
      const participantNames = [match.user_a, match.user_b]
        .map((userId) => profileMap.get(userId) || "Unknown")
        .join(" & ");

      return {
        id: match.id,
        postId: match.post_id,
        participantNames,
        placeName:
          post?.place_name || post?.location || "Selected place",
        meetingPurpose: post?.meeting_purpose || "Meetup",
        meetingTime: post?.meeting_time || null,
      };
    }),
  };
}
