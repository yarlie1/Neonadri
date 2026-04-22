import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Sparkles } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { getBlockedUserIdsForViewer } from "../../../lib/safety";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../lib/userTimeZone";
import { getChatWindowState } from "../../../lib/chat/chatWindow";
import MatchRequestBox from "./MatchRequestBox";
import OwnerMatchPanel from "./OwnerMatchPanel";
import DeletePostButton from "./DeletePostButton";
import PostDistanceNote from "./PostDistanceNote";
import ScrollReveal from "./ScrollReveal";
import SafetyActions from "../../components/SafetyActions";
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
  const blockedUserIds = await getBlockedUserIdsForViewer(supabase, user?.id);

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

  if (blockedUserIds.has(post.user_id)) {
    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
        <div className={`mx-auto max-w-2xl ${APP_SURFACE_CARD_CLASS} p-6`}>
          <div className={APP_EYEBROW_CLASS}>Unavailable</div>
          <div className="mt-3 text-2xl font-bold text-[#24323c]">
            This meetup is unavailable.
          </div>
          <p className={`mt-2 text-sm ${APP_SUBTLE_TEXT_CLASS}`}>
            You cannot view this meetup because one participant has blocked the other.
          </p>
          <div className="mt-4">
            <Link
              href="/"
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
  let ownerAttendanceRate: number | null = null;
  let ownerAttendanceCount = 0;
  let ownerHostReliabilityRate: number | null = null;
  let ownerHostReliabilityCount = 0;
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
    ownerAttendanceRate = ownerData.attendanceRate;
    ownerAttendanceCount = ownerData.attendanceCount;
    ownerHostReliabilityRate = ownerData.hostReliabilityRate;
    ownerHostReliabilityCount = ownerData.hostReliabilityCount;
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
  const { chatClosed } = getChatWindowState(post.meeting_time, userTimeZone);
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
    attendanceRate: ownerAttendanceRate,
    attendanceCount: ownerAttendanceCount,
    hostReliabilityRate: ownerHostReliabilityRate,
    hostReliabilityCount: ownerHostReliabilityCount,
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
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
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
          distanceNote={
            <PostDistanceNote
              latitude={post.latitude}
              longitude={post.longitude}
            />
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-5">
            <ScrollReveal>
              <ProfileShowcaseCard
                title="Host"
                subtitle="Warm, low-pressure meetup host"
                profileHref={post.user_id ? ownerProfileHref : undefined}
                data={ownerProfileData}
                isCurrentUser={user?.id === post.user_id}
                summaryOnly
              />
            </ScrollReveal>

            {isPostMatched && isViewerParticipant && guestProfileData && (
              <ScrollReveal>
                <ProfileShowcaseCard
                  title="Guest"
                  subtitle="Confirmed guest for this meetup"
                  profileHref={matchedGuestUserId ? `/profile/${matchedGuestUserId}` : undefined}
                  data={guestProfileData}
                  isCurrentUser={user?.id === matchedGuestUserId}
                  summaryOnly
                />
              </ScrollReveal>
            )}
          </div>

          <div className="space-y-5 lg:sticky lg:top-36">
            {user && user.id === post.user_id ? (
              <ScrollReveal>
                <OwnerMatchPanel
                  postId={post.id}
                  isMatched={isPostMatched}
                  pendingRequestCount={pendingRequestCount}
                  requests={ownerRequestItems}
                  matchedPartner={matchedPartner}
                />
              </ScrollReveal>
            ) : post.user_id ? (
              <ScrollReveal>
                <MatchRequestBox
                  postId={post.id}
                  postOwnerUserId={post.user_id}
                  benefitAmount={post.benefit_amount}
                  requestCount={totalRequestCount}
                  isPostMatched={isPostMatched}
                  isViewerParticipant={isViewerParticipant}
                  myRequestId={myRequestId}
                  myRequestStatus={myRequestStatus}
                />
              </ScrollReveal>
            ) : null}

            <ScrollReveal>
              <MatchedChatPanel
                isPostMatched={isPostMatched}
                isViewerParticipant={isViewerParticipant}
                matchedRecordId={matchedRecord?.id}
                hasNewChatMessage={hasNewChatMessage}
                meetupFinished={meetupFinished}
                chatClosed={chatClosed}
              />
            </ScrollReveal>

            <ScrollReveal>
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
            </ScrollReveal>

            {user && user.id === post.user_id && !isPostMatched && !hasAnyRequests && (
              <ScrollReveal>
                <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                  <div className={APP_EYEBROW_CLASS}>
                    Meetup actions
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/write/${post.id}`}
                      className={`inline-flex items-center gap-2 rounded-full ${APP_BUTTON_SECONDARY_CLASS} px-4 py-2 text-sm font-medium transition`}
                    >
                      <Sparkles className="h-4 w-4" />
                      Edit Meetup
                    </Link>
                    <DeletePostButton postId={post.id} />
                  </div>
                </div>
              </ScrollReveal>
            )}

            {user && user.id !== post.user_id ? (
              <ScrollReveal>
                <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                  <div className={APP_EYEBROW_CLASS}>
                    Safety
                  </div>
                  <div className="mt-2 text-sm text-[#6c7880]">
                    Report this meetup or block the host if you no longer want to interact.
                  </div>
                  <div className="mt-4">
                    <SafetyActions
                      currentUserId={user.id}
                      targetUserId={post.user_id}
                      reportConfig={{
                        targetType: "post",
                        targetId: String(post.id),
                        label: "Meetup",
                      }}
                    />
                  </div>
                </div>
              </ScrollReveal>
            ) : null}
          </div>
        </div>

        <div className={`px-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}

