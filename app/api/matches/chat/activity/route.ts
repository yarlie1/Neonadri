import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";

type ActivityAction = "seen" | "message";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: { matchId?: number; action?: ActivityAction } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const matchId = Number(body.matchId);
  const action = body.action;

  if (!Number.isFinite(matchId) || (action !== "seen" && action !== "message")) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let matchChat;
  try {
    matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MATCH_CHAT_ACCESS_FAILED";
    return NextResponse.json({ error: message }, { status: 403 });
  }

  const now = new Date().toISOString();
  const updatePayload: Record<string, string> = {
    updated_at: now,
  };

  if (matchChat.participantRole === "host") {
    updatePayload.last_seen_by_host_at = now;
  } else {
    updatePayload.last_seen_by_guest_at = now;
  }

  if (action === "message") {
    updatePayload.last_chat_activity_at = now;
  }

  const { error } = await supabase
    .from("match_chats")
    .update(updatePayload)
    .eq("id", matchChat.chat.id);

  if (error) {
    console.error("[match-chat-activity]", error);
    return NextResponse.json({ error: "Could not update chat activity" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
