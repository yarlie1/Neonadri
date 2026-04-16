import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Sparkles } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../lib/userTimeZone";
import MatchRequestBox from "./MatchRequestBox";
import OwnerMatchPanel from "./OwnerMatchPanel";
import DeletePostButton from "./DeletePostButton";
import {
  buildDetailViewModel,
  fetchProfileShowcaseData,
  fetchRequesterProfileMap,
  getMatchedGuestId,
  type MatchRequestRow,
  type MatchRow,
  type MatchSummaryRow,
} from "./detailData";
import {
  MatchedChatPanel,
  MatchReviewPanel,
  MeetupOverviewCard,
  ProfileShowcaseCard,
  type MatchReviewRow,
  type PostRow,
  type ProfileCardData,
  type ReviewRow,
  UpcomingMeetupCard,
} from "./detailComponents";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const cookieStore = cookies();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const id = params.id;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, duration_minutes, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .eq("id", id)
    .maybeSingle();

  if (postError || !postData) {
    notFound();
  }

  const post = postData as PostRow;

  let ownerName = "Unknown";
  let ownerAboutMe = "";
  let ownerGender = "";
  let ownerAgeGroup = "";
  let ownerLanguages: string[] = [];
  let ownerMeetingStyle = "";
  let ownerInterests: string[] = [];
  let ownerResponseNote = "";

  let ownerAverageRating = 0;
  let ownerReviewCount = 0;
  let ownerCompletedMeetups = 0;
  let ownerRecentReviews: ReviewRow[] = [];
  let guestProfileData: ProfileCardData | null = null;
  let matchedGuestUserId: string | null = null;

  if (post.user_id) {
    const ownerData = await fetchProfileShowcaseData(supabase, post.user_id);
    ownerName = ownerData.displayName;
    ownerAboutMe = ownerData.aboutMe;
    ownerGender = ownerData.gender;
    ownerAgeGroup = ownerData.ageGroup;
    ownerLanguages = ownerData.languages;
    ownerMeetingStyle = ownerData.meetingStyle;
    ownerInterests = ownerData.interests;
    ownerResponseNote = ownerData.responseNote;
    ownerAverageRating = ownerData.averageRating;
    ownerReviewCount = ownerData.reviewCount;
    ownerCompletedMeetups = ownerData.completedMeetups;
    ownerRecentReviews = ownerData.recentReviews;
  }

  let myRequestStatus = "No request yet";
  let myRequestId: number | null = null;
  let isPostMatched = false;
  let pendingRequestCount = 0;
  let totalRequestCount = 0;
  let ownerRequests: MatchRequestRow[] = [];
  let matchReviews: MatchReviewRow[] = [];
  let matchedRecord: MatchRow | null = null;
  let matchedPartner:
    | {
        userId: string;
        displayName: string;
        gender: string;
        ageGroup: string;
      }
    | null = null;

  const { data: summaryData } = await supabase.rpc("get_post_match_summaries", {
    p_post_ids: [post.id],
  });

  const summary = ((summaryData || []) as MatchSummaryRow[])[0];
  isPostMatched = !!summary?.is_matched;
  pendingRequestCount = Number(summary?.pending_request_count || 0);
  totalRequestCount = Number(summary?.total_request_count || 0);
  const hasAnyRequests = totalRequestCount > 0;

  if (user && post.user_id && user.id !== post.user_id) {
    const [{ data: requestData }, { data: matchData }] = await Promise.all([
      supabase
        .from("match_requests")
        .select("id, status")
        .eq("post_id", post.id)
        .eq("requester_user_id", user.id)
        .eq("post_owner_user_id", post.user_id)
        .maybeSingle(),

      supabase
        .from("matches")
        .select("id, user_a, user_b, status")
        .eq("post_id", post.id)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .maybeSingle(),
    ]);

    const request = requestData as MatchRequestRow | null;
    const match = matchData as MatchRow | null;

    if (request?.status) {
      myRequestStatus = request.status;
      myRequestId = request.id;
    }

    if (match?.status) {
      myRequestStatus = "matched";
      matchedRecord = match;
    }
  }

  if (user && user.id === post.user_id) {
    const { data: ownerRequestData } = await supabase
      .from("match_requests")
      .select("id, requester_user_id, post_owner_user_id, status, created_at")
      .eq("post_id", post.id)
      .eq("post_owner_user_id", user.id)
      .order("created_at", { ascending: false });

    ownerRequests = (ownerRequestData || []) as MatchRequestRow[];
  }

  let hasNewChatMessage = false;
  if (isPostMatched && !matchedRecord) {
    const { data: matchRecordData } = await supabase
      .from("matches")
      .select("id, user_a, user_b, status")
      .eq("post_id", post.id)
      .maybeSingle();

    matchedRecord = (matchRecordData as MatchRow | null) || null;
  }

  const matchedGuestId = getMatchedGuestId(matchedRecord, post.user_id);

  const isViewerParticipant = !!user && !!matchedRecord && (user.id === post.user_id || user.id === matchedGuestId);

  if (matchedGuestId) {
    matchedGuestUserId = matchedGuestId;
  }

  if (matchedRecord?.id) {
    const { data: matchReviewData } = await supabase
      .from("match_reviews")
      .select(
        "id, rating, review_text, created_at, reviewer_user_id, reviewee_user_id"
      )
      .eq("match_id", matchedRecord.id)
      .order("created_at", { ascending: false });

    matchReviews = (matchReviewData || []) as MatchReviewRow[];

    if (user) {
      const { data: matchChatData } = await supabase
        .from("match_chats")
        .select(
          "last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, host_user_id, guest_user_id"
        )
        .eq("match_id", matchedRecord.id)
        .maybeSingle();

      if (matchChatData) {
        const viewerLastSeen =
          matchChatData.host_user_id === user.id
            ? matchChatData.last_seen_by_host_at
            : matchChatData.guest_user_id === user.id
            ? matchChatData.last_seen_by_guest_at
            : null;

        hasNewChatMessage = Boolean(
          matchChatData.last_chat_activity_at &&
            (!viewerLastSeen || matchChatData.last_chat_activity_at > viewerLastSeen)
        );
      }
    }
  }

  if (matchedGuestId) {
    const guestData = await fetchProfileShowcaseData(supabase, matchedGuestId);
    guestProfileData = guestData.profileCardData;
    if (guestProfileData) {
      matchedPartner = {
        userId: matchedGuestId,
        displayName: guestData.displayName,
        gender: guestData.gender,
        ageGroup: guestData.ageGroup,
      };
    }
  }

  const requesterIds = Array.from(
    new Set(ownerRequests.map((request) => request.requester_user_id).filter(Boolean))
  );
  const requesterProfileMap = await fetchRequesterProfileMap(supabase, requesterIds);

  const ownerProfileHref = post.user_id ? `/profile/${post.user_id}` : "#";
  const {
    mapUrl,
    targetLabel,
    hostIdentityLabel,
    meetupTimeLabel,
    meetupDurationLabel,
    meetupCountdown,
    meetupFinished,
    canLeaveReview,
    viewerHasReview,
    benefitExplanation,
    purposeTheme,
  } = buildDetailViewModel({
    post,
    userTimeZone,
    ownerGender,
    ownerAgeGroup,
    isViewerParticipant,
    matchedRecordId: matchedRecord?.id,
    userId: user?.id,
    matchReviews,
  });
  const ownerProfileData: ProfileCardData = {
    userId: post.user_id,
    displayName: ownerName,
    aboutMe: ownerAboutMe,
    gender: ownerGender,
    ageGroup: ownerAgeGroup,
    languages: ownerLanguages,
    meetingStyle: ownerMeetingStyle,
    interests: ownerInterests,
    responseNote: ownerResponseNote,
    averageRating: ownerAverageRating,
    reviewCount: ownerReviewCount,
    completedMeetups: ownerCompletedMeetups,
    recentReviews: ownerRecentReviews,
  };
  const ownerRequestItems = ownerRequests.map((request) => {
    const profile = requesterProfileMap.get(request.requester_user_id);

    return {
      id: request.id,
      requesterUserId: request.requester_user_id,
      requesterName: profile?.displayName || "Unknown",
      requesterGender: profile?.gender || "",
      requesterAgeGroup: profile?.ageGroup || "",
      createdAt: request.created_at,
      status: request.status,
    };
  });
  const getParticipantDisplayLabel = (userId: string) => {
    if (userId === post.user_id) return ownerName;
    if (matchedGuestId && userId === matchedGuestId) {
      return guestProfileData?.displayName || "Guest";
    }
    if (user && userId === user.id) return "You";
    return "Participant";
  };

  const getMatchReviewAuthorLabel = (review: MatchReviewRow) => {
    const reviewerLabel = getParticipantDisplayLabel(review.reviewer_user_id);
    const revieweeLabel = getParticipantDisplayLabel(review.reviewee_user_id);
    return `${reviewerLabel} reviewed ${revieweeLabel}`;
  };
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-3xl space-y-5">
        <UpcomingMeetupCard
          isPostMatched={isPostMatched}
          isViewerParticipant={isViewerParticipant}
          meetupFinished={meetupFinished}
          purposeTheme={purposeTheme}
          post={post}
          meetupTimeLabel={meetupTimeLabel}
          meetupCountdown={meetupCountdown}
        />

        <MeetupOverviewCard
          isPostMatched={isPostMatched}
          purposeTheme={purposeTheme}
          post={post}
          meetupDurationLabel={meetupDurationLabel}
          benefitExplanation={benefitExplanation}
          hostIdentityLabel={hostIdentityLabel}
          targetLabel={targetLabel}
          ownerName={ownerName}
          meetupTimeLabel={meetupTimeLabel}
          mapUrl={mapUrl}
        />

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <ProfileShowcaseCard
              title="Host"
              subtitle="Warm, low-pressure meetup host"
              profileHref={post.user_id ? ownerProfileHref : undefined}
              data={ownerProfileData}
              isCurrentUser={user?.id === post.user_id}
              summaryOnly
            />

            {isPostMatched && isViewerParticipant && guestProfileData && (
              <ProfileShowcaseCard
                title="Guest"
                subtitle="Confirmed guest for this meetup"
                profileHref={matchedGuestUserId ? `/profile/${matchedGuestUserId}` : undefined}
                data={guestProfileData}
                isCurrentUser={user?.id === matchedGuestUserId}
                summaryOnly
              />
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-36">
            {user && user.id === post.user_id ? (
              <OwnerMatchPanel
                postId={post.id}
                isMatched={isPostMatched}
                pendingRequestCount={pendingRequestCount}
                requests={ownerRequestItems}
                matchedPartner={matchedPartner}
              />
            ) : post.user_id ? (
              <MatchRequestBox
                postId={post.id}
                postOwnerUserId={post.user_id}
                requestCount={totalRequestCount}
                isPostMatched={isPostMatched}
                isViewerParticipant={isViewerParticipant}
                myRequestId={myRequestId}
                myRequestStatus={myRequestStatus}
              />
            ) : null}

            <MatchedChatPanel
              isPostMatched={isPostMatched}
              isViewerParticipant={isViewerParticipant}
              matchedRecordId={matchedRecord?.id}
              hasNewChatMessage={hasNewChatMessage}
            />

            <MatchReviewPanel
              isPostMatched={isPostMatched}
              isViewerParticipant={isViewerParticipant}
              matchedRecordId={matchedRecord?.id}
              canLeaveReview={canLeaveReview}
              meetupFinished={meetupFinished}
              viewerHasReview={viewerHasReview}
              matchReviews={matchReviews}
              getMatchReviewAuthorLabel={getMatchReviewAuthorLabel}
            />

            {user && user.id === post.user_id && !isPostMatched && !hasAnyRequests && (
              <div className="rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
                  Meetup actions
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/write/${post.id}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                  >
                    <Sparkles className="h-4 w-4" />
                    Edit Meetup
                  </Link>
                  <DeletePostButton postId={post.id} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-1 text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}

