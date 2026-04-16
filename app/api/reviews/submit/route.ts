import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isMeetingFinished } from "../../../../lib/meetingTime";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../lib/userTimeZone";
import { cookies } from "next/headers";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  post_id: number;
};

type PostRow = {
  meeting_time: string | null;
  user_id: string;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const cookieStore = await cookies();
    const userTimeZone = normalizeUserTimeZone(
      cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
    );
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matchId = Number(body.match_id);
    const rating = Number(body.rating);
    const showedUp =
      typeof body.showed_up === "boolean" ? body.showed_up : null;
    const hostPaidBenefit =
      typeof body.host_paid_benefit === "boolean" ? body.host_paid_benefit : null;

    if (Number.isNaN(matchId) || Number.isNaN(rating)) {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }

    if (showedUp === null) {
      return NextResponse.json(
        { error: "Please confirm whether they showed up for the meetup." },
        { status: 400 }
      );
    }

    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("id, user_a, user_b, post_id")
      .eq("id", matchId)
      .single();

    if (matchError || !matchData) {
      return NextResponse.json({ error: "Match not found." }, { status: 404 });
    }

    const match = matchData as MatchRow;

    if (match.user_a !== user.id && match.user_b !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const revieweeUserId = match.user_a === user.id ? match.user_b : match.user_a;

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("meeting_time, user_id")
      .eq("id", match.post_id)
      .single();

    if (postError || !postData) {
      return NextResponse.json({ error: "Meetup not found." }, { status: 404 });
    }

    const post = postData as PostRow;
    const revieweeIsHost = post.user_id === revieweeUserId;

    if (!isMeetingFinished(post.meeting_time, userTimeZone)) {
      return NextResponse.json(
        { error: "Review is available only after the meetup is finished." },
        { status: 403 }
      );
    }

    const { data: existingReview } = await supabase
      .from("match_reviews")
      .select("id")
      .eq("match_id", matchId)
      .eq("reviewer_user_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return NextResponse.json(
        { error: "You already submitted a review for this meetup." },
        { status: 409 }
      );
    }

    if (revieweeIsHost && hostPaidBenefit === null) {
      return NextResponse.json(
        { error: "Please confirm whether the host paid the promised benefit." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("match_reviews").insert({
      match_id: matchId,
      reviewer_user_id: user.id,
      reviewee_user_id: revieweeUserId,
      rating,
      showed_up: showedUp,
      host_paid_benefit: revieweeIsHost ? hostPaidBenefit : null,
      reviewee_is_host: revieweeIsHost,
      review_text:
        typeof body.review_text === "string" && body.review_text.trim()
          ? body.review_text.trim()
          : null,
    });

    if (error) {
      console.error("Review submit failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to submit review." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Review submit route unexpected error", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
