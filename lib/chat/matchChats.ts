type SupabaseLikeClient = {
  from: (table: string) => {
    select: (columns: string) => any;
    insert: (values: Record<string, unknown>) => any;
    update: (values: Record<string, unknown>) => any;
  };
};

export type MatchChatRow = {
  id: string;
  match_id: number;
  provider: string;
  external_room_id: string;
  host_user_id: string;
  guest_user_id: string;
  created_at: string;
  updated_at: string;
  last_chat_activity_at: string | null;
  last_seen_by_host_at: string | null;
  last_seen_by_guest_at: string | null;
  closed_at: string | null;
};

export type AuthorizedMatchChatResult = {
  match: {
    id: number;
    post_id: number;
    user_a: string;
    user_b: string;
    status: string;
  };
  chat: MatchChatRow;
  participantRole: "host" | "guest";
  otherUserId: string;
};

function buildOpaqueRoomId(matchId: number) {
  const randomPart = `${Math.random().toString(36).slice(2, 10)}${Date.now()
    .toString(36)
    .slice(-6)}`;
  return `match-chat-${matchId}-${randomPart}`;
}

export async function getOrCreateAuthorizedMatchChat(
  supabase: SupabaseLikeClient,
  {
    matchId,
    userId,
  }: {
    matchId: number;
    userId: string;
  }
): Promise<AuthorizedMatchChatResult> {
  const { data: matchData, error: matchError } = await supabase
    .from("matches")
    .select("id, post_id, user_a, user_b, status")
    .eq("id", matchId)
    .maybeSingle();

  if (matchError || !matchData) {
    throw new Error("MATCH_NOT_FOUND");
  }

  const match = matchData as {
    id: number;
    post_id: number;
    user_a: string;
    user_b: string;
    status: string;
  };

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", match.post_id)
    .maybeSingle();

  if (postError || !postData?.user_id) {
    throw new Error("POST_NOT_FOUND");
  }

  if (match.status !== "matched") {
    throw new Error("MATCH_NOT_READY");
  }

  const hostUserId = postData.user_id as string;
  const guestUserId = hostUserId === match.user_a ? match.user_b : match.user_a;

  if (userId !== hostUserId && userId !== guestUserId) {
    throw new Error("MATCH_FORBIDDEN");
  }

  const participantRole = userId === hostUserId ? "host" : "guest";
  const otherUserId = participantRole === "host" ? guestUserId : hostUserId;

  const { data: existingChatData, error: existingChatError } = await supabase
    .from("match_chats")
    .select(
      "id, match_id, provider, external_room_id, host_user_id, guest_user_id, created_at, updated_at, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, closed_at"
    )
    .eq("match_id", match.id)
    .maybeSingle();

  if (existingChatError) {
    throw new Error("MATCH_CHAT_LOOKUP_FAILED");
  }

  let chat = existingChatData as MatchChatRow | null;

  if (!chat) {
    const { data: insertedChatData, error: insertError } = await supabase
      .from("match_chats")
      .insert({
        match_id: match.id,
        provider: "pubnub",
        external_room_id: buildOpaqueRoomId(match.id),
        host_user_id: hostUserId,
        guest_user_id: guestUserId,
      })
      .select(
        "id, match_id, provider, external_room_id, host_user_id, guest_user_id, created_at, updated_at, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, closed_at"
      )
      .single();

    if (insertError || !insertedChatData) {
      throw new Error("MATCH_CHAT_CREATE_FAILED");
    }

    chat = insertedChatData as MatchChatRow;
  }

  const seenColumn =
    participantRole === "host" ? "last_seen_by_host_at" : "last_seen_by_guest_at";
  const seenAt = new Date().toISOString();

  const { data: updatedChatData, error: updateError } = await supabase
    .from("match_chats")
    .update({
      [seenColumn]: seenAt,
      updated_at: seenAt,
    })
    .eq("id", chat.id)
    .select(
      "id, match_id, provider, external_room_id, host_user_id, guest_user_id, created_at, updated_at, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, closed_at"
    )
    .single();

  if (updateError || !updatedChatData) {
    throw new Error("MATCH_CHAT_UPDATE_FAILED");
  }

  return {
    match,
    chat: updatedChatData as MatchChatRow,
    participantRole,
    otherUserId,
  };
}
