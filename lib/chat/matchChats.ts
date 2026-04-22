import { isBlockedBetween } from "../safety";

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

  if (await isBlockedBetween(supabase as unknown as SupabaseLikeClient, userId, otherUserId)) {
    throw new Error("MATCH_BLOCKED");
  }

  const rpcClient = supabase as SupabaseLikeClient & {
    rpc: (fn: string, args: Record<string, unknown>) => Promise<{
      data: unknown;
      error: { message?: string } | null;
    }>;
  };

  const { data: rpcData, error: rpcError } = await rpcClient.rpc(
    "get_or_create_match_chat_for_viewer",
    {
      p_match_id: match.id,
    }
  );

  if (rpcError || !rpcData) {
    throw new Error(rpcError?.message || "MATCH_CHAT_RPC_FAILED");
  }

  const chat = rpcData as MatchChatRow;

  return {
    match,
    chat,
    participantRole,
    otherUserId,
  };
}
