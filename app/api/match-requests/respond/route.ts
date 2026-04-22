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

    const requestId = Number(body.requestId);
    const action = String(body.action || "").trim().toLowerCase();

    if (!Number.isFinite(requestId) || !["accepted", "rejected"].includes(action)) {
      return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }

    const rpcName =
      action === "accepted" ? "accept_match_request" : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      console.error("Match request respond RPC failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        rpcName,
        requestId,
        userId: user.id,
      });

      return NextResponse.json(
        { error: error.message || "Failed to update request." },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; error?: string } | null;

    if (!result?.ok) {
      return NextResponse.json(
        { error: result?.error || "Failed to update request." },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    console.error("Match request respond route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
