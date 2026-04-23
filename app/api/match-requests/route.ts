import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { isBlockedBetween } from "../../../lib/safety";
import { isAdultConfirmedUser } from "../../../lib/adultGate";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const targetMismatchMessage =
      "You cannot send a request because this meetup is set for a different gender or age group.";

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isAdultConfirmedUser(user)) {
      return NextResponse.json(
        { error: "Please confirm that you are 18 or older before using meetup requests." },
        { status: 403 }
      );
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

    if (await isBlockedBetween(supabase, user.id, postOwnerUserId)) {
      return NextResponse.json(
        { error: "You cannot interact with this user." },
        { status: 403 }
      );
    }

    const [{ data: postData, error: postError }, { data: profileData, error: profileError }] =
      await Promise.all([
        supabase
          .from("posts")
          .select("user_id, target_gender, target_age_group, meeting_time")
          .eq("id", postId)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("gender, age_group")
          .eq("id", user.id)
          .maybeSingle(),
      ]);

    if (postError || !postData) {
      console.error("Match request post lookup failed", {
        message: postError?.message,
        details: postError?.details,
        hint: postError?.hint,
        code: postError?.code,
        postId,
      });
      return NextResponse.json(
        { error: "Failed to check meetup details." },
        { status: 500 }
      );
    }

    if (String(postData.user_id || "") !== postOwnerUserId) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const meetingTimeValue = String(postData.meeting_time || "").trim();
    if (meetingTimeValue) {
      const meetingTime = new Date(meetingTimeValue).getTime();
      if (!Number.isNaN(meetingTime) && meetingTime < Date.now()) {
        return NextResponse.json(
          { error: "This meetup has already expired." },
          { status: 409 }
        );
      }
    }

    if (profileError) {
      console.error("Match request profile lookup failed", {
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
        code: profileError.code,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to check your profile." },
        { status: 500 }
      );
    }

    const targetGender = String(postData.target_gender || "").trim();
    const targetAgeGroup = String(postData.target_age_group || "").trim();
    const requesterGender = String(profileData?.gender || "").trim();
    const requesterAgeGroup = String(profileData?.age_group || "").trim();

    const genderMismatch =
      targetGender &&
      targetGender !== "Any" &&
      requesterGender !== targetGender;

    const ageGroupMismatch =
      targetAgeGroup &&
      targetAgeGroup !== "Any" &&
      requesterAgeGroup !== targetAgeGroup;

    if (genderMismatch || ageGroupMismatch) {
      return NextResponse.json(
        { error: targetMismatchMessage },
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
          : "A request for this meetup already exists.";

      if (!["pending", "accepted", "rejected"].includes(status)) {
        console.warn("Unexpected existing match request status", {
          requestId: existing.id,
          status: existing.status,
          postId,
          requesterUserId: user.id,
          postOwnerUserId,
        });
      }

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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    if (!isAdultConfirmedUser(user)) {
      return NextResponse.json(
        { error: "Please confirm that you are 18 or older before using meetup requests." },
        { status: 403 }
      );
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
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
