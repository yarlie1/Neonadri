import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase, user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return { supabase, user, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, user, error: null as NextResponse | null };
}

export async function GET() {
  try {
    const { supabase, error } = await assertAdmin();
    if (error) return error;

    const { data: reports, error: reportsError } = await supabase
      .from("reports")
      .select("id, reporter_user_id, target_type, target_id, reason, detail, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (reportsError) {
      console.error("Admin reports load failed", reportsError);
      return NextResponse.json({ error: "Failed to load reports." }, { status: 500 });
    }

    return NextResponse.json({ items: reports || [] }, { status: 200 });
  } catch (error) {
    console.error("Admin reports route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase, error } = await assertAdmin();
    if (error) return error;

    const body = await req.json();
    const reportId = Number(body.reportId);
    const status = String(body.status || "");

    if (!Number.isFinite(reportId) || !["open", "reviewing", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid report update." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("reports")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", reportId);

    if (updateError) {
      console.error("Admin report update failed", updateError);
      return NextResponse.json({ error: "Failed to update report." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Admin reports patch unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
