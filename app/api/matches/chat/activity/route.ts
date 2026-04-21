import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../../lib/supabase/server";
import {
  getChatWindowState,
  MATCH_CHAT_CLOSED_MESSAGE,
} from "../../../../../lib/chat/chatWindow";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../../lib/userTimeZone";

type ActivityAction = "seen" | "message";

export async function GET(request: Request) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const matchId = Number(searchParams.get("matchId"));

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });
    const { data: postData } = await supabase
      .from("posts")
      .select("meeting_time")
      .eq("id", matchChat.match.post_id)
      .maybeSingle();
    const { chatClosed } = getChatWindowState(
      postData?.meeting_time || null,
      userTimeZone
    );

    const otherUserLastSeenAt =
      matchChat.participantRole === "host"
        ? matchChat.chat.last_seen_by_guest_at
        : matchChat.chat.last_seen_by_host_at;

    return NextResponse.json({
      ok: true,
      chatClosed,
      otherUserLastSeenAt,
      lastChatActivityAt: matchChat.chat.last_chat_activity_at,
    });
  } catch (error) {
    console.error("[match-chat-activity:get] access error", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const userTimeZone = normalizeUserTimeZone(
    cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
  );
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
    console.error("[match-chat-activity:post] access error", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: postData } = await supabase
    .from("posts")
    .select("meeting_time")
    .eq("id", matchChat.match.post_id)
    .maybeSingle();

  const { chatClosed } = getChatWindowState(
    postData?.meeting_time || null,
    userTimeZone
  );

  if (action === "message" && chatClosed) {
    return NextResponse.json({ error: MATCH_CHAT_CLOSED_MESSAGE }, { status: 403 });
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
