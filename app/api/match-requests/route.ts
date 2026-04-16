import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

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

    const postId = Number(body.postId);
    const postOwnerUserId = String(body.postOwnerUserId || "");

    if (!Number.isFinite(postId) || !postOwnerUserId) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    if (user.id === postOwnerUserId) {
      return NextResponse.json(
        { error: "You cannot request your own meetup." },
        { status: 400 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("match_requests")
      .select("id, status")
      .eq("post_id", postId)
      .eq("requester_user_id", user.id)
      .eq("post_owner_user_id", postOwnerUserId)
      .maybeSingle();

    if (existingError) {
      console.error("Match request lookup failed", {
        message: existingError.message,
        details: existingError.details,
        hint: existingError.hint,
        code: existingError.code,
      });
      return NextResponse.json(
        { error: "Failed to check existing request." },
        { status: 500 }
      );
    }

    if (existing) {
      const status = String(existing.status || "").toLowerCase();
      const error =
        status === "pending"
          ? "Your request has already been sent."
          : status === "accepted"
          ? "Your request was already accepted."
          : status === "rejected"
          ? "This request was previously declined."
          : `Request already exists: ${existing.status}`;

      return NextResponse.json({ error }, { status: 409 });
    }

    const { error } = await supabase.from("match_requests").insert({
      post_id: postId,
      requester_user_id: user.id,
      post_owner_user_id: postOwnerUserId,
      status: "pending",
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Your request has already been sent." },
          { status: 409 }
        );
      }

      console.error("Match request create failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to send match request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Match request route unexpected error", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
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

    const requestId = Number(body.requestId);

    if (!Number.isFinite(requestId)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const { error } = await supabase
      .from("match_requests")
      .delete()
      .eq("id", requestId)
      .eq("requester_user_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("Match request delete failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to cancel request." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Match request delete route unexpected error", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
