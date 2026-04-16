import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

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

    if (typeof body.post_id !== "string" || !body.post_id.trim()) {
      return NextResponse.json(
        { error: "Missing post id" },
        { status: 400 }
      );
    }

    const payload = {
      meeting_purpose:
        typeof body.meeting_purpose === "string" && body.meeting_purpose.trim()
          ? body.meeting_purpose.trim()
          : null,
      meeting_time:
        typeof body.meeting_time === "string" && body.meeting_time.trim()
          ? body.meeting_time.trim()
          : null,
      duration_minutes:
        typeof body.duration_minutes === "number"
          ? body.duration_minutes
          : null,
      location:
        typeof body.location === "string" && body.location.trim()
          ? body.location.trim()
          : null,
      place_name:
        typeof body.place_name === "string" && body.place_name.trim()
          ? body.place_name.trim()
          : null,
      latitude:
        typeof body.latitude === "number" && Number.isFinite(body.latitude)
          ? body.latitude
          : null,
      longitude:
        typeof body.longitude === "number" && Number.isFinite(body.longitude)
          ? body.longitude
          : null,
      target_gender:
        typeof body.target_gender === "string" && body.target_gender.trim()
          ? body.target_gender.trim()
          : null,
      target_age_group:
        typeof body.target_age_group === "string" && body.target_age_group.trim()
          ? body.target_age_group.trim()
          : null,
      benefit_amount:
        typeof body.benefit_amount === "string" && body.benefit_amount.trim()
          ? body.benefit_amount.trim()
          : null,
    };

    const { error } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", body.post_id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Post update failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to update meetup." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Post update route unexpected error", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
