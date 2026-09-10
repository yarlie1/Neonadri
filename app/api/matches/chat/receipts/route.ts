import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../../lib/chat/matchChats";
import { isAdultConfirmedUser } from "../../../../../lib/adultGate";

function parseIds(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length > 100 ||
      value.some((id) => typeof id !== "string" || !/^[0-9]{15,20}$/.test(id))) return null;
  return Array.from(new Set(value)) as string[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!(await isAdultConfirmedUser(supabase, user.id))) {
    return NextResponse.json({ error: "Adult confirmation required" }, { status: 403 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }
  const matchId = body?.matchId;
  const readIds = parseIds(body?.readMessageIds);
  const sentIds = parseIds(body?.sentMessageIds);
  if (!Number.isSafeInteger(matchId) || matchId <= 0 || !readIds || !sentIds) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  let matchChat;
  try { matchChat = await getOrCreateAuthorizedMatchChat(supabase, { matchId, userId: user.id }); }
  catch { return NextResponse.json({ error: "Forbidden" }, { status: 403 }); }

  // Reader identity comes only from the authenticated session. The participant
  // policies also prevent one person from marking messages read for the other.
  if (readIds.length) {
    const { error } = await supabase.from("chat_message_reads").upsert(
      readIds.map((message_id) => ({ chat_id: matchChat.chat.id, reader_id: user.id, message_id })),
      { onConflict: "chat_id,reader_id,message_id", ignoreDuplicates: true }
    );
    if (error) return NextResponse.json({ error: "Could not save read receipts" }, { status: 500 });
  }
  let readMessageIds: string[] = [];
  if (sentIds.length) {
    const { data, error } = await supabase.from("chat_message_reads")
      .select("message_id").eq("chat_id", matchChat.chat.id)
      .eq("reader_id", matchChat.otherUserId).in("message_id", sentIds);
    if (error) return NextResponse.json({ error: "Could not load read receipts" }, { status: 500 });
    readMessageIds = (data || []).map((row) => row.message_id);
  }
  return NextResponse.json({ readMessageIds }, { headers: { "Cache-Control": "no-store" } });
}
