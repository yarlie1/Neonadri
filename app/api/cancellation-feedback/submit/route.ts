import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { VALID_CANCELLATION_FEEDBACK_TYPES } from "../../../../lib/cancellationFeedback";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  post_id: number;
};

type PostRow = {
  id: number;
  status: string | null;
  cancelled_by_user_id: string | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const matchId = Number(body.match_id);
    const feedbackType =
      typeof body.feedback_type === "string" ? body.feedback_type.trim() : "";
    const note =
      typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;

    if (Number.isNaN(matchId) || !VALID_CANCELLATION_FEEDBACK_TYPES.has(feedbackType)) {
      return NextResponse.json(
        { error: "Invalid cancellation feedback." },
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

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, status, cancelled_by_user_id")
      .eq("id", match.post_id)
      .single();

    if (postError || !postData) {
      return NextResponse.json({ error: "Meetup not found." }, { status: 404 });
    }

    const post = postData as PostRow;

    if (String(post.status || "open").toLowerCase() !== "cancelled") {
      return NextResponse.json(
        { error: "Cancellation feedback is only available for cancelled meetups." },
        { status: 403 }
      );
    }

    if (!post.cancelled_by_user_id) {
      return NextResponse.json(
        { error: "Cancellation details are unavailable for this meetup." },
        { status: 409 }
      );
    }

    if (post.cancelled_by_user_id === user.id) {
      return NextResponse.json(
        { error: "The person who cancelled this meetup cannot leave cancellation feedback." },
        { status: 403 }
      );
    }

    const { data: existingFeedback } = await supabase
      .from("meetup_cancellation_feedback")
      .select("id")
      .eq("match_id", match.id)
      .eq("feedback_user_id", user.id)
      .maybeSingle();

    if (existingFeedback) {
      return NextResponse.json(
        { error: "You already submitted cancellation feedback for this meetup." },
        { status: 409 }
      );
    }

    const { error: insertError } = await supabase
      .from("meetup_cancellation_feedback")
      .insert({
        match_id: match.id,
        post_id: post.id,
        cancelled_by_user_id: post.cancelled_by_user_id,
        feedback_user_id: user.id,
        feedback_type: feedbackType,
        note,
      });

    if (insertError) {
      console.error("Cancellation feedback submit failed", {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
      });
      return NextResponse.json(
        { error: "Failed to submit cancellation feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Cancellation feedback submit route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
