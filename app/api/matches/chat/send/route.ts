import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "../../../../../lib/supabase/server";
import {
  getChatWindowState,
  MATCH_CHAT_CLOSED_MESSAGE,
} from "../../../../../lib/chat/chatWindow";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import { isAdultConfirmedUser } from "../../../../../lib/adultGate";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../../lib/userTimeZone";
import {
  checkRateLimit,
  getRateLimitKey,
  rateLimitResponse,
} from "../../../../../lib/rateLimit";
import { sendPushNotificationToUser } from "../../../../../lib/pushNotifications";
import { sendEmailNotificationToUser } from "../../../../../lib/emailNotifications";

const PUBNUB_PUBLISH_ORIGIN = "https://ps.pndsn.com";
const MATCH_CHAT_CANCELLED_MESSAGE =
  "This meetup was cancelled by the host. This chat is read-only now.";
const MESSAGE_MAX_LENGTH = 1000;

type PubNubPublishResponse = [number, string, string] | { timetoken?: string };

function sanitizeMessage(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, MESSAGE_MAX_LENGTH);
}

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

async function publishPubNubMessage({
  channel,
  message,
  uuid,
}: {
  channel: string;
  message: {
    text: string;
    senderId: string;
    senderName: string;
    createdAt: string;
  };
  uuid: string;
}) {
  const publishKey =
    getRequiredEnv("PUBNUB_PUBLISH_KEY") ||
    getRequiredEnv("NEXT_PUBLIC_PUBNUB_PUBLISH_KEY");
  const subscribeKey = getRequiredEnv("NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY");

  if (!publishKey || !subscribeKey) {
    throw new Error("CHAT_PROVIDER_NOT_CONFIGURED");
  }

  const url = new URL(
    `/publish/${encodeURIComponent(publishKey)}/${encodeURIComponent(
      subscribeKey
    )}/0/${encodeURIComponent(channel)}/0/${encodeURIComponent(
      JSON.stringify(message)
    )}`,
    PUBNUB_PUBLISH_ORIGIN
  );
  url.searchParams.set("store", "1");
  url.searchParams.set("uuid", uuid);

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`PUBNUB_PUBLISH_FAILED:${details || response.status}`);
  }

  const payload = (await response.json()) as PubNubPublishResponse;
  if (Array.isArray(payload)) {
    return String(payload[2] || "");
  }

  return String(payload.timetoken || "");
}

export async function POST(request: Request) {
  const rateLimit = checkRateLimit({
    key: getRateLimitKey(request, "match-chat-send"),
    limit: 30,
    windowMs: 60 * 1000,
  });

  if (rateLimit.limited) {
    return rateLimitResponse(rateLimit.resetAt);
  }

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

  if (!isAdultConfirmedUser(user)) {
    return NextResponse.json(
      { error: "Please confirm that you are 18 or older before using match chat." },
      { status: 403 }
    );
  }

  let body: { matchId?: number; text?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const matchId = Number(body.matchId);
  const text = sanitizeMessage(body.text);

  if (!Number.isFinite(matchId) || !text) {
    return NextResponse.json({ error: "Invalid message." }, { status: 400 });
  }

  let matchChat;
  try {
    matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });
  } catch (error) {
    console.error("[match-chat-send] access error", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: postData } = await supabase
    .from("posts")
    .select("meeting_time, status")
    .eq("id", matchChat.match.post_id)
    .maybeSingle();

  const { chatClosed } = getChatWindowState(
    postData?.meeting_time || null,
    userTimeZone
  );
  const chatCancelled =
    String(postData?.status || "open").toLowerCase() === "cancelled";

  if (chatCancelled) {
    return NextResponse.json({ error: MATCH_CHAT_CANCELLED_MESSAGE }, { status: 403 });
  }

  if (chatClosed) {
    return NextResponse.json({ error: MATCH_CHAT_CLOSED_MESSAGE }, { status: 403 });
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  const now = new Date().toISOString();
  const message = {
    text,
    senderId: user.id,
    senderName: profileData?.display_name || "Participant",
    createdAt: now,
  };

  let timetoken = "";
  try {
    timetoken = await publishPubNubMessage({
      channel: matchChat.chat.external_room_id,
      message,
      uuid: user.id,
    });
  } catch (error) {
    console.error("[match-chat-send] publish failed", error);
    return NextResponse.json(
      { error: "Message could not be sent. Please try again." },
      { status: 502 }
    );
  }

  const updatePayload: Record<string, string> = {
    updated_at: now,
    last_chat_activity_at: now,
  };

  if (matchChat.participantRole === "host") {
    updatePayload.last_seen_by_host_at = now;
  } else {
    updatePayload.last_seen_by_guest_at = now;
  }

  const { error: updateError } = await supabase
    .from("match_chats")
    .update(updatePayload)
    .eq("id", matchChat.chat.id);

  if (updateError) {
    console.error("[match-chat-send] activity update failed", updateError);
  }

  const notificationBody = `${message.senderName}: ${
    text.length > 80 ? `${text.slice(0, 77)}...` : text
  }`;

  await Promise.all([
    sendPushNotificationToUser(matchChat.otherUserId, {
      title: "New chat message",
      body: notificationBody,
      url: `/matches/${matchId}/chat`,
      tag: `match-chat-${matchId}`,
    }).catch((pushError) => {
      console.error("[match-chat-send] push notification failed", pushError);
    }),
    sendEmailNotificationToUser(matchChat.otherUserId, {
      subject: "New Neonadri chat message",
      headline: "New chat message",
      body: notificationBody,
      url: `/matches/${matchId}/chat`,
      buttonLabel: "Open chat",
    }).catch((emailError) => {
      console.error("[match-chat-send] email notification failed", emailError);
    }),
  ]);

  return NextResponse.json({
    ok: true,
    message: {
      id: timetoken || `${user.id}-${now}`,
      ...message,
    },
  });
}
