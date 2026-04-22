import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";
import { REPORT_REASON_OPTIONS } from "../../../lib/safety";

const VALID_TARGET_TYPES = new Set<string>(["user", "post", "chat"]);
const VALID_REASONS = new Set<string>(
  REPORT_REASON_OPTIONS.map((option) => option.value)
);

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

    const targetType = String(body.targetType || "");
    const targetId = String(body.targetId || "").trim();
    const reason = String(body.reason || "");
    const detail =
      typeof body.detail === "string" && body.detail.trim()
        ? body.detail.trim().slice(0, 1000)
        : null;

    if (!VALID_TARGET_TYPES.has(targetType) || !targetId || !VALID_REASONS.has(reason)) {
      return NextResponse.json({ error: "Invalid report." }, { status: 400 });
    }

    const { error } = await supabase.from("reports").insert({
      reporter_user_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason,
      detail,
    });

    if (error) {
      console.error("Report create failed", error);
      return NextResponse.json({ error: "Failed to submit report." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Reports route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
