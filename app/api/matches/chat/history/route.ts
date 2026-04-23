import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import { isAdultConfirmedUser } from "../../../../../lib/adultGate";

type PubNubHistoryEntry = {
  message?:
    | string
    | {
        text?: string;
        senderId?: string;
        senderName?: string;
        createdAt?: string;
      };
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

type PubNubHistoryResponse =
  | {
      channels?: Record<string, PubNubHistoryEntry[]>;
    }
  | [PubNubHistoryEntry[], unknown, unknown];

function resolveHistoryEntries(
  payload: unknown,
  channel: string
): PubNubHistoryEntry[] {
  if (Array.isArray(payload)) {
    return Array.isArray(payload[0]) ? payload[0] : [];
  }

  const response = payload as PubNubHistoryResponse;
  const channels = "channels" in response ? response.channels : undefined;
  if (!channels || typeof channels !== "object") {
    return [];
  }

  return (
    channels[channel] ||
    channels[encodeURIComponent(channel)] ||
    channels[decodeURIComponent(channel)] ||
    []
  );
}

function parsePubNubHistoryPayload(payload: unknown, channel: string): HistoryMessage[] {
  const entries = resolveHistoryEntries(payload, channel);

  return entries
    .map((entry) => {
      const historyEntry = entry as PubNubHistoryEntry;
      const message =
        typeof historyEntry.message === "string"
          ? { text: historyEntry.message }
          : historyEntry.message || historyEntry.entry;
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
    historyUrl.searchParams.set("include_uuid", "false");
    historyUrl.searchParams.set("encode_channels", "false");

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
    const messages = parsePubNubHistoryPayload(payload, channel);

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
