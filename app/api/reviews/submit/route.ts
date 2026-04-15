import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
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
    const rating = Number(body.rating);

    if (Number.isNaN(matchId) || Number.isNaN(rating)) {
      return NextResponse.json({ error: "Invalid review payload." }, { status: 400 });
    }

    const { data: matchData, error: matchError } = await supabase
      .from("matches")
      .select("id, user_a, user_b")
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

    const { error } = await supabase.from("match_reviews").insert({
      match_id: matchId,
      reviewer_user_id: user.id,
      reviewee_user_id: revieweeUserId,
      rating,
      review_text:
        typeof body.review_text === "string" && body.review_text.trim()
          ? body.review_text.trim()
          : null,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Server error",
      },
      { status: 500 }
    );
  }
}
