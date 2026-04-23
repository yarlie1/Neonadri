import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../../../../lib/supabase/server";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../lib/userTimeZone";
import CancellationFeedbackForm from "./CancellationFeedbackForm";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  post_id: number;
};

type PostRow = {
  id: number;
  user_id: string;
  meeting_time: string | null;
  place_name: string | null;
  location: string | null;
  meeting_purpose: string | null;
  status: string | null;
  cancelled_by_user_id: string | null;
};

type ProfileRow = {
  display_name: string | null;
};

type PageProps = {
  params: {
    matchId: string;
  };
};

export default async function WriteCancellationFeedbackPage({
  params,
}: PageProps) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const matchId = Number(params.matchId);

  if (Number.isNaN(matchId)) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="Match not found."
        initialPostInfo={null}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, user_a, user_b, post_id")
    .eq("id", matchId)
    .single();

  if (matchError || !matchData) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="Match not found."
        initialPostInfo={null}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  const match = matchData as MatchRow;

  if (match.user_a !== user.id && match.user_b !== user.id) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="You do not have access to this feedback."
        initialPostInfo={null}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  const { data: postData } = await supabase
    .from("posts")
    .select(
      "id, user_id, meeting_time, place_name, location, meeting_purpose, status, cancelled_by_user_id"
    )
    .eq("id", match.post_id)
    .maybeSingle();

  const postInfo = (postData as PostRow | null) || null;

  if (!postInfo || String(postInfo.status || "open").toLowerCase() !== "cancelled") {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="Cancellation feedback is only available for cancelled meetups."
        initialPostInfo={postInfo}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  if (!postInfo.cancelled_by_user_id) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="Cancellation details are unavailable for this meetup."
        initialPostInfo={postInfo}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  if (postInfo.cancelled_by_user_id === user.id) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="The person who cancelled this meetup cannot leave cancellation feedback."
        initialPostInfo={postInfo}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  const { data: existingFeedback } = await supabase
    .from("meetup_cancellation_feedback")
    .select("id")
    .eq("match_id", match.id)
    .eq("feedback_user_id", user.id)
    .maybeSingle();

  if (existingFeedback) {
    return (
      <CancellationFeedbackForm
        matchId={params.matchId}
        initialCanSubmit={false}
        initialMessage="You already submitted cancellation feedback for this meetup."
        initialPostInfo={postInfo}
        initialCancelledByName=""
        initialUserTimeZone={userTimeZone}
      />
    );
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", postInfo.cancelled_by_user_id)
    .maybeSingle();

  const cancelledByName =
    (profileData as ProfileRow | null)?.display_name || "Host";

  return (
    <CancellationFeedbackForm
      matchId={params.matchId}
      initialCanSubmit
      initialMessage=""
      initialPostInfo={postInfo}
      initialCancelledByName={cancelledByName}
      initialUserTimeZone={userTimeZone}
    />
  );
}
