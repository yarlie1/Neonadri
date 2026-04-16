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

    const payload = {
      user_id: user.id,
      place_name: body.place_name,
      location: body.location,
      meeting_time: body.meeting_time,
      duration_minutes: body.duration_minutes,
      target_gender: body.target_gender,
      target_age_group: body.target_age_group,
      meeting_purpose: body.meeting_purpose,
      benefit_amount: body.benefit_amount,
      latitude: body.latitude,
      longitude: body.longitude,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select();

    if (error) {
      console.error("Post create failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to create meetup." },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    console.error("Post create route unexpected error", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
