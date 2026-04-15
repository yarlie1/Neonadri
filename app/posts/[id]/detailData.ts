import type { ProfileCardData, ReviewRow } from "./detailComponents";

export type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  about_me: string | null;
  gender: string | null;
  age_group: string | null;
  preferred_area: string | null;
  languages: string[] | null;
  meeting_style: string | null;
  interests: string[] | null;
  response_time_note: string | null;
};

export type MatchRequestRow = {
  id: number;
  requester_user_id: string;
  post_owner_user_id: string;
  status: string;
  created_at: string;
};

export type MatchRow = {
  id: number;
  user_a?: string;
  user_b?: string;
  status: string;
};

export type MatchSummaryRow = {
  post_id: number;
  is_matched: boolean;
  pending_request_count: number;
  total_request_count: number;
};

export type ProfileStats = {
  average_rating?: number | null;
  review_count?: number | null;
  completed_meetups?: number | null;
};

export type LoadedProfileData = {
  displayName: string;
  gender: string;
  ageGroup: string;
  aboutMe: string;
  languages: string[];
  meetingStyle: string;
  interests: string[];
  responseNote: string;
  averageRating: number;
  reviewCount: number;
  completedMeetups: number;
  recentReviews: ReviewRow[];
  profileCardData: ProfileCardData;
};

export async function fetchProfileShowcaseData(
  supabase: any,
  userId: string
): Promise<LoadedProfileData> {
  const [profileRes, statsRes, reviewsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, display_name, bio, about_me, gender, age_group, preferred_area, languages, meeting_style, interests, response_time_note"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase.rpc("get_profile_stats", {
      p_user_id: userId,
    }),
    supabase
      .from("match_reviews")
      .select("id, rating, review_text, created_at")
      .eq("reviewee_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const profile = profileRes.data as ProfileRow | null;
  const stats = statsRes.data as ProfileStats | null;
  const recentReviews = (reviewsRes.data || []) as ReviewRow[];

  const displayName = profile?.display_name || "Unknown";
  const aboutMe = profile?.about_me || "";
  const gender = profile?.gender || "";
  const ageGroup = profile?.age_group || "";
  const languages = profile?.languages || [];
  const meetingStyle = profile?.meeting_style || "";
  const interests = profile?.interests || [];
  const responseNote = profile?.response_time_note || "";
  const averageRating = Number(stats?.average_rating ?? 0);
  const reviewCount = Number(stats?.review_count ?? 0);
  const completedMeetups = Number(stats?.completed_meetups ?? 0);

  return {
    displayName,
    aboutMe,
    gender,
    ageGroup,
    languages,
    meetingStyle,
    interests,
    responseNote,
    averageRating,
    reviewCount,
    completedMeetups,
    recentReviews,
    profileCardData: {
      userId,
      displayName,
      aboutMe,
      gender,
      ageGroup,
      languages,
      meetingStyle,
      interests,
      responseNote,
      averageRating,
      reviewCount,
      completedMeetups,
      recentReviews,
    },
  };
}

export async function fetchRequesterProfileMap(
  supabase: any,
  requesterIds: string[]
) {
  const requesterProfileMap = new Map<
    string,
    { displayName: string; gender: string; ageGroup: string }
  >();

  if (requesterIds.length === 0) {
    return requesterProfileMap;
  }

  const { data: requesterProfiles } = await supabase
    .from("profiles")
    .select("id, display_name, gender, age_group")
    .in("id", requesterIds);

  ((requesterProfiles || []) as Array<{
    id: string;
    display_name: string | null;
    gender: string | null;
    age_group: string | null;
  }>).forEach((profile) => {
    requesterProfileMap.set(profile.id, {
      displayName: profile.display_name || "Unknown",
      gender: profile.gender || "",
      ageGroup: profile.age_group || "",
    });
  });

  return requesterProfileMap;
}

export function getMatchedGuestId(
  matchedRecord: MatchRow | null,
  ownerUserId: string
) {
  if (!matchedRecord) return null;

  if (matchedRecord.user_a && matchedRecord.user_a !== ownerUserId) {
    return matchedRecord.user_a;
  }

  if (matchedRecord.user_b && matchedRecord.user_b !== ownerUserId) {
    return matchedRecord.user_b;
  }

  return null;
}
