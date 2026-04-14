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

    if (body.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = {
      id: user.id,
      display_name:
        typeof body.display_name === "string" && body.display_name.trim()
          ? body.display_name.trim()
          : null,
      bio:
        typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null,
      about_me:
        typeof body.about_me === "string" && body.about_me.trim()
          ? body.about_me.trim()
          : null,
      gender:
        typeof body.gender === "string" && body.gender.trim()
          ? body.gender.trim()
          : null,
      age_group:
        typeof body.age_group === "string" && body.age_group.trim()
          ? body.age_group.trim()
          : null,
      preferred_area:
        typeof body.preferred_area === "string" && body.preferred_area.trim()
          ? body.preferred_area.trim()
          : null,
      languages:
        Array.isArray(body.languages) && body.languages.length > 0
          ? body.languages
          : null,
      meeting_style:
        typeof body.meeting_style === "string" && body.meeting_style.trim()
          ? body.meeting_style.trim()
          : null,
      interests:
        Array.isArray(body.interests) && body.interests.length > 0
          ? body.interests
          : null,
      response_time_note:
        typeof body.response_time_note === "string" &&
        body.response_time_note.trim()
          ? body.response_time_note.trim()
          : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

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
