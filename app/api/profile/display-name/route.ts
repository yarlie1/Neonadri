import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

const DISPLAY_NAME_MAX_LENGTH = 24;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const displayName =
      typeof body.display_name === "string" ? body.display_name.trim() : "";

    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required." },
        { status: 400 }
      );
    }

    if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.` },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient() as any;
    const { data, error } = await adminSupabase
      .from("profiles")
      .select("id")
      .ilike("display_name", displayName)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Display name availability lookup failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "We couldn't check that display name right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ available: !data }, { status: 200 });
  } catch (error) {
    console.error("Display name availability route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}