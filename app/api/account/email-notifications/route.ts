import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const enabled = Boolean(body.enabled);

    const { error } = await supabase
      .from("profiles")
      .update({
        email_notifications_enabled: enabled,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Email notification preference update failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Could not update email notifications." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, enabled }, { status: 200 });
  } catch (error) {
    console.error("Email notification preference route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
