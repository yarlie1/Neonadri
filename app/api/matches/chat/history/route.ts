import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import { isAdultConfirmedUser } from "../../../../../lib/adultGate";

type PubNubHistoryEnvelope = {
  entry?: {
    text?: string;
    senderId?: string;
    senderName?: string;
    createdAt?: string;
  };
  timetoken?: number | string;
};

type HistoryMessage = {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
};

function parsePubNubHistoryPayload(payload: unknown): HistoryMessage[] {
  const entries = Array.isArray(payload) ? payload[0] : null;
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries
    .map((entry) => {
      const historyEntry = entry as PubNubHistoryEnvelope;
      const message = historyEntry.entry;
      const text = String(message?.text || "").trim();

      if (!text) {
        return null;
      }

      return {
        id:
          String(historyEntry.timetoken || "").trim() ||
          `${message?.senderId || "unknown"}-${message?.createdAt || Date.now()}`,
        text,
        senderId: String(message?.senderId || "unknown"),
        senderName: String(message?.senderName || "Participant"),
        createdAt: String(message?.createdAt || new Date().toISOString()),
      } satisfies HistoryMessage;
    })
    .filter((message): message is HistoryMessage => Boolean(message));
}

export async function GET(request: Request) {
  const supabase = await createClient();
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

  const { searchParams } = new URL(request.url);
  const matchId = Number(searchParams.get("matchId"));
  const requestedCount = Number(searchParams.get("count") || "50");
  const count = Number.isFinite(requestedCount)
    ? Math.max(1, Math.min(100, requestedCount))
    : 50;

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;
  if (!subscribeKey) {
    return NextResponse.json({ error: "Chat provider is not configured." }, { status: 500 });
  }

  try {
    const matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });

    const channel = matchChat.chat.external_room_id;
    const historyUrl = new URL(
      `https://ps.pndsn.com/v2/history/sub-key/${subscribeKey}/channel/${encodeURIComponent(
        channel
      )}`
    );
    historyUrl.searchParams.set("count", String(count));
    historyUrl.searchParams.set("reverse", "false");
    historyUrl.searchParams.set("include_token", "true");

    const response = await fetch(historyUrl.toString(), {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("[match-chat-history] pubnub history failed", {
        status: response.status,
        body,
        channel,
      });
      return NextResponse.json(
        { error: "Past messages could not be loaded right now." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as unknown;
    const messages = parsePubNubHistoryPayload(payload);

    return NextResponse.json({
      ok: true,
      roomId: channel,
      messages,
    });
  } catch (error) {
    console.error("[match-chat-history] access error", error);
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
