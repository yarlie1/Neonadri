import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import { isAdultConfirmedUser } from "../../../../../lib/adultGate";

const PUBNUB_HISTORY_BASE_URL = "https://ps.pndsn.com";

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

  if (!Number.isFinite(matchId)) {
    return NextResponse.json({ error: "Invalid match id." }, { status: 400 });
  }

  const subscribeKey = process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY;
  if (!subscribeKey) {
    return NextResponse.json({ error: "PubNub subscribe key missing." }, { status: 500 });
  }

  try {
    const matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });

    const roomId = matchChat.chat.external_room_id;
    const url = new URL(
      `${PUBNUB_HISTORY_BASE_URL}/v3/history/sub-key/${encodeURIComponent(
        subscribeKey
      )}/channel/${encodeURIComponent(roomId)}`
    );
    url.searchParams.set("count", "10");
    url.searchParams.set("include_uuid", "true");

    const response = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          status?: number;
          error?: boolean;
          error_message?: string;
          channels?: Record<string, Array<{ message?: unknown; timetoken?: string }>>;
        }
      | null;

    const messages = payload?.channels?.[roomId] || [];

    return NextResponse.json(
      {
        ok: response.ok,
        roomId,
        status: payload?.status ?? response.status,
        error: payload?.error ?? !response.ok,
        errorMessage: payload?.error_message ?? null,
        messageCount: messages.length,
      },
      { status: response.ok ? 200 : response.status }
    );
  } catch (error) {
    console.error("[match-chat-history-debug]", { matchId, userId: user.id, error });
    return NextResponse.json(
      { error: "Could not inspect chat history right now." },
      { status: 500 }
    );
  }
}
