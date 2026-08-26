import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ChevronDown, MessageSquare, Sparkles, Star } from "lucide-react";
import { createClient } from "../../../lib/supabase/server";
import { buildPostPath, extractPostIdParam } from "../../../lib/postUrl";
import { buildProfilePath } from "../../../lib/profileUrl";
import { getBlockedUserIdsForViewer } from "../../../lib/safety";
import { isConfirmedMatchStatus } from "../../../lib/matches/status";
import { OG_IMAGE_VERSION } from "../../../lib/socialPreview";
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
import CancelMeetupButton from "./CancelMeetupButton";
import PostDistanceNote from "./PostDistanceNote";
import ScrollReveal from "./ScrollReveal";
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
  CancellationFeedbackPanel,
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
  searchParams?: Record<string, string | string[] | undefined>;
};

const APP_URL = process.env.APP_BASE_URL?.trim() || "https://neonadri.net";
const SITE_URL = APP_URL.replace(/\/+$/, "");

function compactText(value: string | null | undefined) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function buildPostSeoTitle(post: {
  meeting_purpose: string | null;
  place_name: string | null;
  location: string | null;
}) {
  const purpose = compactText(post.meeting_purpose) || "Meetup";
  const place = compactText(post.place_name) || compactText(post.location);
  return place ? `${purpose} at ${place}` : purpose;
}

function buildPostSeoDescription(post: {
  meeting_purpose: string | null;
  place_name: string | null;
  location: string | null;
  benefit_amount?: string | null;
}) {
  const purpose = compactText(post.meeting_purpose) || "meetup";
  const place = compactText(post.place_name) || "a local spot";
  const location = compactText(post.location);
  const cityPhrase = location ? ` in ${location}` : " in Los Angeles";
  const benefit = compactText(post.benefit_amount);
  const benefitPhrase = benefit
    ? ` Host covers ${benefit}.`
    : " Host covers the listed activity cost.";

  return `Join a 1:1 ${purpose.toLowerCase()} at ${place}${cityPhrase}. Request to join and meet someone new.${benefitPhrase}`;
}

function buildEventJsonLd({
  post,
  title,
  description,
  url,
}: {
  post: {
    place_name: string | null;
    location: string | null;
    meeting_time: string | null;
    duration_minutes: number | null;
    benefit_amount: string | null;
    status: string | null;
  };
  title: string;
  description: string;
  url: string;
}) {
  const startDate = post.meeting_time || undefined;
  const endDate =
    post.meeting_time && post.duration_minutes
      ? new Date(
          new Date(post.meeting_time).getTime() + post.duration_minutes * 60 * 1000
        ).toISOString()
      : undefined;
  const placeName = compactText(post.place_name) || "Meetup location";
  const address = compactText(post.location) || "Los Angeles";
  const isCancelled = String(post.status || "open").toLowerCase() === "cancelled";

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: title,
    description,
    url,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: isCancelled
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    startDate,
    endDate,
    location: {
      "@type": "Place",
      name: placeName,
      address: {
        "@type": "PostalAddress",
        addressLocality: address,
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Neonadri",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: isCancelled
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
      url,
    },
  };
}

async function getPostMetadataRecord(id: string) {
  const postId = extractPostIdParam(id);
  if (!postId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      "id, place_name, location, meeting_purpose, meeting_time, duration_minutes, benefit_amount, target_gender, target_age_group, status, admin_hidden"
    )
    .eq("id", postId)
    .maybeSingle();

  if (data?.admin_hidden) return null;

  return data as
    | {
        id: number;
        place_name: string | null;
        location: string | null;
        meeting_purpose: string | null;
        meeting_time: string | null;
        duration_minutes: number | null;
        benefit_amount: string | null;
        target_gender: string | null;
        target_age_group: string | null;
        status: string | null;
        admin_hidden: boolean | null;
      }
    | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const post = await getPostMetadataRecord(params.id);

  if (!post) {
    return {
      title: "Meetup not found",
    };
  }

  const title = buildPostSeoTitle(post);
  const description = buildPostSeoDescription(post);
  const postPath = buildPostPath(
    post.id,
    post.meeting_purpose,
    post.place_name || post.location
  );
  const url = `${SITE_URL}${postPath}`;

  return {
    title,
    description,
    alternates: {
      canonical: postPath,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Neonadri",
      type: "article",
      images: [
        {
          url: `${postPath}/opengraph-image?${OG_IMAGE_VERSION}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${postPath}/opengraph-image?${OG_IMAGE_VERSION}`],
    },
  };
}
export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const cookieStore = cookies();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const id = extractPostIdParam(params.id);
  if (!id) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const blockedUserIds = await getBlockedUserIdsForViewer(supabase, user?.id);

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, duration_minutes, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude, status, cancelled_at, cancelled_by_user_id, admin_hidden"
    )
    .eq("id", id)
    .maybeSingle();

  if (postError || !postData) {
    notFound();
  }

  const post = postData as PostRow;
  const isCancelled = String(post.status || "open").toLowerCase() === "cancelled";

  if (post.admin_hidden) {
    let viewerIsAdmin = false;

    if (user?.id) {
      const { data: viewerProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();

      viewerIsAdmin = !!viewerProfile?.is_admin;
    }

    if (!viewerIsAdmin) {
      notFound();
    }
  }

  if (blockedUserIds.has(post.user_id)) {
    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
        <div className={`mx-auto max-w-2xl ${APP_SURFACE_CARD_CLASS} p-6`}>
          <div className={APP_EYEBROW_CLASS}>Unavailable</div>
          <div className="mt-3 text-2xl font-bold text-[#24323c]">
            This meetup is unavailable.
          </div>
          <p className={`mt-2 text-sm ${APP_SUBTLE_TEXT_CLASS}`}>
            This meetup is blocked.
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
  let ownerAvatarUrl: string | null = null;
  let ownerUsername = "";

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
    ownerAvatarUrl = ownerData.avatarUrl;
    ownerUsername = ownerData.username;
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
  let hasCancellationFeedback = false;
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

    if (isConfirmedMatchStatus(match?.status)) {
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

    const nextMatchedRecord = (matchRecordData as MatchRow | null) || null;
    matchedRecord = isConfirmedMatchStatus(nextMatchedRecord?.status)
      ? nextMatchedRecord
      : null;
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
      const { data: cancellationFeedbackData } = await supabase
        .from("meetup_cancellation_feedback")
        .select("id")
        .eq("match_id", matchedRecord.id)
        .eq("feedback_user_id", user.id)
        .maybeSingle();

      hasCancellationFeedback = !!cancellationFeedbackData;

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

  const ownerProfileHref = post.user_id
    ? buildProfilePath({ id: post.user_id, username: ownerUsername })
    : "#";
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
    placeDisplay,
    locationDisplay,
    locationHeading,
    locationPrivacyNote,
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
    avatarUrl: ownerAvatarUrl,
    username: ownerUsername,
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
      profileHref: buildProfilePath({
        id: request.requester_user_id,
        username: profile?.username,
      }),
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
  const canLeaveCancellationFeedback =
    isCancelled &&
    isViewerParticipant &&
    !!matchedRecord?.id &&
    !!user &&
    post.cancelled_by_user_id !== user.id &&
    !hasCancellationFeedback;

  const isViewerHost = user?.id === post.user_id;
  const matchedRecordId = matchedRecord?.id ?? null;
  const shouldShowHostProfileCard = !isViewerHost;
  const shouldShowUpcomingMeetupCard = !isViewerHost;
  const shouldShowMatchedSidePanels = !isViewerHost;
  const shouldShowHostMatchedSummary =
    isViewerHost &&
    isPostMatched &&
    isViewerParticipant &&
    !!matchedRecordId &&
    !isCancelled;
  const shouldUseFocusedRequestView = !isViewerHost && !isViewerParticipant;
  const titleLine = `${post.meeting_purpose || "Meetup"}${placeDisplay ? ` at ${placeDisplay}` : ""}`;
  const currentPostPath = buildPostPath(
    post.id,
    post.meeting_purpose,
    post.place_name || post.location
  );
  const canonicalUrl = `${SITE_URL}${currentPostPath}`;
  const seoTitle = buildPostSeoTitle(post);
  const seoDescription = buildPostSeoDescription(post);
  const eventJsonLd = buildEventJsonLd({
    post,
    title: seoTitle,
    description: seoDescription,
    url: canonicalUrl,
  });

  if (shouldUseFocusedRequestView) {
    return (
      <main className="min-h-screen bg-white px-4 py-5 text-[#111111] sm:px-6 sm:py-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <section className="rounded-[8px] border border-[#111111] bg-white p-5 sm:p-7">
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#111111]">
              Request this meetup?
            </div>
            <h1 className="mt-3 text-4xl font-black leading-[0.96] tracking-[-0.04em] text-[#111111] sm:text-6xl">
              {titleLine}
            </h1>

            <div className="mt-6 grid gap-2 text-base font-bold text-[#111111] sm:grid-cols-2">
              <div className="rounded-[8px] border border-[#111111] px-3 py-2">
                {meetupTimeLabel}
              </div>
              <div className="rounded-[8px] border border-[#111111] px-3 py-2">
                {meetupDurationLabel} · Host covers {post.benefit_amount || "costs"}
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-y border-[#111111] py-5 sm:grid-cols-2">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#666666]">
                  Host
                </div>
                <div className="mt-1 text-xl font-black text-[#111111]">
                  {ownerName} · {hostIdentityLabel}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#666666]">
                  Looking for
                </div>
                <div className="mt-1 text-xl font-black text-[#111111]">
                  {targetLabel}
                </div>
              </div>
            </div>

            {post.user_id ? (
              <MatchRequestBox
                postId={post.id}
                postOwnerUserId={post.user_id}
                benefitAmount={post.benefit_amount}
                requestCount={totalRequestCount}
                isPostMatched={isPostMatched}
                isCancelled={isCancelled}
                isViewerParticipant={isViewerParticipant}
                myRequestId={myRequestId}
                myRequestStatus={myRequestStatus}
                meetupFinished={meetupFinished}
                compact
              />
            ) : null}

            <p className="mt-5 text-sm font-medium leading-6 text-[#333333]">
              This is a platonic, non-romantic meetup.
            </p>
          </section>

          <details className="rounded-[8px] border border-[#111111] bg-white p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-black uppercase tracking-[0.12em] text-[#111111]">
              More details
              <ChevronDown className="h-4 w-4" />
            </summary>
            <div className="mt-5 space-y-5">
              <MeetupOverviewCard
                isPostMatched={isPostMatched}
                isCancelled={isCancelled}
                purposeTheme={purposeTheme}
                post={post}
                meetupDurationLabel={meetupDurationLabel}
                benefitExplanation={benefitExplanation}
                hostIdentityLabel={hostIdentityLabel}
                targetLabel={targetLabel}
                meetupTimeLabel={meetupTimeLabel}
                mapUrl={mapUrl}
                placeDisplay={placeDisplay}
                locationDisplay={locationDisplay}
                locationHeading={locationHeading}
                locationPrivacyNote={locationPrivacyNote}
                distanceNote={<PostDistanceNote latitude={post.latitude} longitude={post.longitude} />}
              />
              <ProfileShowcaseCard
                title="Host"
                subtitle="Host"
                profileHref={post.user_id ? ownerProfileHref : undefined}
                data={ownerProfileData}
                isCurrentUser={user?.id === post.user_id}
                summaryOnly
              />
            </div>
          </details>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
          />
        </div>
      </main>
    );
  }
  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)] lg:items-start">
          <div className="space-y-5">
            <ScrollReveal>
              <MeetupOverviewCard
                isPostMatched={isPostMatched}
                isCancelled={isCancelled}
                purposeTheme={purposeTheme}
                post={post}
                meetupDurationLabel={meetupDurationLabel}
                benefitExplanation={benefitExplanation}
                hostIdentityLabel={hostIdentityLabel}
                targetLabel={targetLabel}
                meetupTimeLabel={meetupTimeLabel}
                mapUrl={mapUrl}
                placeDisplay={placeDisplay}
                locationDisplay={locationDisplay}
                locationHeading={locationHeading}
                locationPrivacyNote={locationPrivacyNote}
                distanceNote={
                  <PostDistanceNote
                    latitude={post.latitude}
                    longitude={post.longitude}
                  />
                }
              />
            </ScrollReveal>
          </div>

          <div className="space-y-5 lg:sticky lg:top-36">
            {shouldShowUpcomingMeetupCard ? (
              <UpcomingMeetupCard
                isPostMatched={isPostMatched}
                isViewerParticipant={isViewerParticipant}
                meetupFinished={meetupFinished}
                isCancelled={isCancelled}
                purposeTheme={purposeTheme}
                post={post}
                meetupTimeLabel={meetupTimeLabel}
                meetupCountdown={meetupCountdown}
              />
            ) : null}

            {shouldShowHostProfileCard ? (
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
            ) : null}

            {isPostMatched && isViewerParticipant && guestProfileData && !isViewerHost && (
              <ScrollReveal>
                <ProfileShowcaseCard
                  title="Guest"
                  subtitle="Confirmed guest for this meetup"
                  profileHref={matchedGuestUserId
                    ? buildProfilePath({
                        id: matchedGuestUserId,
                        username: guestProfileData.username,
                      })
                    : undefined}
                  data={guestProfileData}
                  isCurrentUser={user?.id === matchedGuestUserId}
                  summaryOnly
                />
              </ScrollReveal>
            )}

            {user && user.id === post.user_id && !isPostMatched ? (
              <ScrollReveal>
                <OwnerMatchPanel
                  postId={post.id}
                  isMatched={isPostMatched}
                  isCancelled={isCancelled}
                  pendingRequestCount={pendingRequestCount}
                  requests={ownerRequestItems}
                  matchedPartner={matchedPartner}
                />
              </ScrollReveal>
            ) : !isViewerHost && post.user_id ? (
              <ScrollReveal>
                <MatchRequestBox
                  postId={post.id}
                  postOwnerUserId={post.user_id}
                  benefitAmount={post.benefit_amount}
                  requestCount={totalRequestCount}
                  isPostMatched={isPostMatched}
                  isCancelled={isCancelled}
                  isViewerParticipant={isViewerParticipant}
                  myRequestId={myRequestId}
                  myRequestStatus={myRequestStatus}
                  meetupFinished={meetupFinished}
                />
              </ScrollReveal>
            ) : null}

            {shouldShowHostMatchedSummary ? (
              <ScrollReveal>
                <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                  <div className={APP_EYEBROW_CLASS}>Matched meetup</div>
                  <h2 className="mt-2 text-[1.55rem] font-black tracking-[-0.04em] text-[#111111]">
                    {matchedPartner
                      ? `Matched with ${matchedPartner.displayName}`
                      : "This meetup is matched"}
                  </h2>
                  {matchedPartner ? (
                    <div className="mt-1 text-sm leading-6 text-[#66727a]">
                      {matchedPartner.ageGroup || "Guest"} / {matchedPartner.gender || "Guest"}
                    </div>
                  ) : null}

                  <div className="mt-5 space-y-4">
                    <div className="rounded-[8px] border border-[#111111] bg-white px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className={APP_EYEBROW_CLASS}>Chat</div>
                          <div className="mt-1 text-base font-black text-[#111111]">
                            {chatClosed ? "Chat closed" : "Confirm details in chat"}
                          </div>
                        </div>
                        <Link
                          href={`/matches/${matchedRecordId}/chat`}
                          className={`inline-flex items-center gap-2 rounded-[8px] ${APP_BUTTON_SECONDARY_CLASS} px-4 py-2 text-sm font-medium transition`}
                        >
                          <MessageSquare className="h-4 w-4 text-[#444444]" />
                          {chatClosed ? "Read Chat" : "Open Chat"}
                          {!chatClosed && hasNewChatMessage ? (
                            <span className="rounded-[8px] border border-[#111111] bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f7480]">
                              New
                            </span>
                          ) : null}
                        </Link>
                      </div>
                    </div>

                    <div className="rounded-[8px] border border-[#111111] bg-white px-4 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className={APP_EYEBROW_CLASS}>Review</div>
                          <div className="mt-1 text-sm leading-6 text-[#66727a]">
                            {meetupFinished
                              ? viewerHasReview
                                ? "Review submitted."
                                : "Review this match."
                              : "Reviews open after meetup."}
                          </div>
                        </div>
                        {canLeaveReview ? (
                          <Link
                            href={`/reviews/write/${matchedRecordId}`}
                            className={`inline-flex items-center gap-2 rounded-[8px] ${APP_BUTTON_SECONDARY_CLASS} px-4 py-2 text-sm font-medium transition`}
                          >
                            <Star className="h-4 w-4 text-[#444444]" />
                            Leave Review
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="rounded-[8px] border border-[#111111] bg-white px-4 py-4">
                      <div className={APP_EYEBROW_CLASS}>Need a change?</div>
                      <div className="mt-2 text-sm leading-6 text-[#66727a]">
                        Need a new time or place? Cancel and recreate.
                      </div>
                      <div className="mt-3">
                        <CancelMeetupButton
                          postId={post.id}
                          meetingTime={post.meeting_time}
                          userTimeZone={userTimeZone}
                          hasMatchedParticipant={isPostMatched}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ) : null}

            {shouldShowMatchedSidePanels ? (
              <ScrollReveal>
                <MatchedChatPanel
                  isPostMatched={isPostMatched}
                  isViewerParticipant={isViewerParticipant}
                  matchedRecordId={matchedRecord?.id}
                  hasNewChatMessage={hasNewChatMessage}
                  meetupFinished={meetupFinished}
                  chatClosed={chatClosed}
                  isCancelled={isCancelled}
                />
              </ScrollReveal>
            ) : null}

            {shouldShowMatchedSidePanels ? (
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
                  isCancelled={isCancelled}
                />
              </ScrollReveal>
            ) : null}

            {shouldShowMatchedSidePanels ? (
              <ScrollReveal>
                <CancellationFeedbackPanel
                  isCancelled={isCancelled}
                  isViewerParticipant={isViewerParticipant}
                  matchedRecordId={matchedRecord?.id}
                  canLeaveCancellationFeedback={canLeaveCancellationFeedback}
                  hasCancellationFeedback={hasCancellationFeedback}
                />
              </ScrollReveal>
            ) : null}

            {user && user.id === post.user_id && !isCancelled && !isPostMatched && !hasAnyRequests && (
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

            {user &&
              user.id === post.user_id &&
              !isCancelled &&
              !shouldShowHostMatchedSummary &&
              (isPostMatched || hasAnyRequests) && (
                <ScrollReveal>
                  <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                    <div className={APP_EYEBROW_CLASS}>
                      Meetup actions
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[#66727a]">
                      Need a new time or place? Cancel and recreate.
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <CancelMeetupButton
                        postId={post.id}
                        meetingTime={post.meeting_time}
                        userTimeZone={userTimeZone}
                        hasMatchedParticipant={isPostMatched}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              )}

            {isCancelled && (
              <ScrollReveal>
                <div className={`${APP_SURFACE_CARD_CLASS} p-5`}>
                  <div className={APP_EYEBROW_CLASS}>
                    Meetup status
                  </div>
                  <div className="mt-2 text-lg font-bold tracking-[-0.03em] text-[#24323f]">
                    This meetup was cancelled.
                  </div>
                  <div className="mt-2 text-sm leading-6 text-[#66727a]">
                    {user?.id === post.user_id
                      ? "Create a new meetup for updated plans."
                      : "Cancelled by host. Chat is read-only."}
                  </div>
                </div>
              </ScrollReveal>
            )}

          </div>
        </div>

        <div className={`px-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}

