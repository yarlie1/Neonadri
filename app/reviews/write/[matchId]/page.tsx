import { redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import ReviewWriteForm from "./ReviewWriteForm";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  post_id: number;
};

type PostRow = {
  id: number;
  meeting_time: string | null;
  place_name: string | null;
  location: string | null;
  meeting_purpose: string | null;
};

type ProfileRow = {
  display_name: string | null;
};

type PageProps = {
  params: {
    matchId: string;
  };
};

const isMeetupExpired = (meetingTime: string | null) => {
  if (!meetingTime) return false;
  return new Date(meetingTime).getTime() < Date.now();
};

export default async function WriteReviewPage({ params }: PageProps) {
  const supabase = await createClient();
  const matchId = Number(params.matchId);

  if (Number.isNaN(matchId)) {
    return (
      <ReviewWriteForm
        matchId={params.matchId}
        initialCanReview={false}
        initialMessage="Match not found."
        initialPostInfo={null}
        initialRevieweeUserId=""
        initialRevieweeName=""
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
      <ReviewWriteForm
        matchId={params.matchId}
        initialCanReview={false}
        initialMessage="Match not found."
        initialPostInfo={null}
        initialRevieweeUserId=""
        initialRevieweeName=""
      />
    );
  }

  const match = matchData as MatchRow;

  if (match.user_a !== user.id && match.user_b !== user.id) {
    return (
      <ReviewWriteForm
        matchId={params.matchId}
        initialCanReview={false}
        initialMessage="You do not have access to this review."
        initialPostInfo={null}
        initialRevieweeUserId=""
        initialRevieweeName=""
      />
    );
  }

  const revieweeUserId = match.user_a === user.id ? match.user_b : match.user_a;
  const { data: revieweeProfileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", revieweeUserId)
    .maybeSingle();
  const revieweeName =
    (revieweeProfileData as ProfileRow | null)?.display_name || "your match";

  const { data: postData } = await supabase
    .from("posts")
    .select("id, meeting_time, place_name, location, meeting_purpose")
    .eq("id", match.post_id)
    .maybeSingle();

  const postInfo = (postData as PostRow | null) || null;

  if (!postInfo || !isMeetupExpired(postInfo.meeting_time)) {
    return (
      <ReviewWriteForm
        matchId={params.matchId}
        initialCanReview={false}
        initialMessage="Review is available only after the meetup is finished."
        initialPostInfo={postInfo}
        initialRevieweeUserId={revieweeUserId}
        initialRevieweeName={revieweeName}
      />
    );
  }

  const { data: existingReview } = await supabase
    .from("match_reviews")
    .select("id")
    .eq("match_id", match.id)
    .eq("reviewer_user_id", user.id)
    .maybeSingle();

  if (existingReview) {
    return (
      <ReviewWriteForm
        matchId={params.matchId}
        initialCanReview={false}
        initialMessage="You already submitted a review for this meetup."
        initialPostInfo={postInfo}
        initialRevieweeUserId={revieweeUserId}
        initialRevieweeName={revieweeName}
      />
    );
  }

  return (
    <ReviewWriteForm
      matchId={params.matchId}
      initialCanReview
      initialMessage=""
      initialPostInfo={postInfo}
      initialRevieweeUserId={revieweeUserId}
      initialRevieweeName={revieweeName}
    />
  );
}
