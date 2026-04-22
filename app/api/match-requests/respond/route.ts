import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isAdultConfirmedUser } from "../../../../lib/adultGate";

function normalizeMatchRequestError(message: string, action: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("request not found")) {
    return "This request could not be found anymore.";
  }

  if (normalized.includes("already") && normalized.includes("matched")) {
    return "This meetup has already been matched with someone else.";
  }

  if (normalized.includes("not authorized") || normalized.includes("not your")) {
    return "You can no longer update this request.";
  }

  if (normalized.includes("pending")) {
    return "This request is no longer pending.";
  }

  return action === "accepted"
    ? "We couldn't accept this request right now."
    : "We couldn't decline this request right now.";
}

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

    if (!isAdultConfirmedUser(user)) {
      return NextResponse.json(
        { error: "Please confirm that you are 18 or older before managing requests." },
        { status: 403 }
      );
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
        { error: normalizeMatchRequestError(error.message || "", action) },
        { status: 500 }
      );
    }

    const result = data as { ok?: boolean; error?: string } | null;

    if (!result?.ok) {
      return NextResponse.json(
        { error: normalizeMatchRequestError(result?.error || "", action) },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, result }, { status: 200 });
  } catch (error) {
    console.error("Match request respond route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
