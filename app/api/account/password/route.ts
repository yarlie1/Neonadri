import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const password = String(body.password || "").trim();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Use at least 8 characters for the new password." },
        { status: 400 }
      );
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      console.error("Password update failed", error);
      return NextResponse.json(
        { error: error.message || "Could not change password." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Password route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
