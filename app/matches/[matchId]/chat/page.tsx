import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../../lib/chat/matchChats";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../lib/userTimeZone";
import { formatMeetingTime } from "../../../../lib/meetingTime";
import ChatRoomClient from "../ChatRoomClient";

type PageProps = {
  params: {
    matchId: string;
  };
};

function MatchChatErrorState({ code }: { code: string }) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-2xl rounded-[24px] border border-[#eadfd3] bg-white/92 p-5 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9d7362]">
          Chat unavailable
        </div>
        <div className="mt-2 text-xl font-bold tracking-[-0.03em] text-[#2f2a26]">
          We could not open this match chat yet.
        </div>
        <p className="mt-3 text-sm leading-6 text-[#6a5e54]">
          Debug code: <span className="font-semibold text-[#4f443b]">{code}</span>
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard?tab=matches"
            className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            Back to Matches
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function MatchChatPage({ params }: PageProps) {
  const matchId = Number(params.matchId);
  if (!Number.isFinite(matchId)) {
    notFound();
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
    redirect("/login");
  }

  let matchChat;
  try {
    matchChat = await getOrCreateAuthorizedMatchChat(supabase, {
      matchId,
      userId: user.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "MATCH_CHAT_FAILED";
    console.error("[match-chat]", { matchId, userId: user.id, message });
    return <MatchChatErrorState code={message} />;
  }

  const { data: postData } = await supabase
    .from("posts")
    .select("meeting_purpose, meeting_time, place_name, location")
    .eq("id", matchChat.match.post_id)
    .maybeSingle();

  const { data: otherProfileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", matchChat.otherUserId)
    .maybeSingle();

  const { data: currentProfileData } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const purposeLabel = postData?.meeting_purpose || "Meetup";
  const meetingTimeLabel = formatMeetingTime(postData?.meeting_time || null, userTimeZone);
  const placeLabel = postData?.place_name || postData?.location || "Selected place";
  const otherUserName = otherProfileData?.display_name || "Participant";
  const currentUserName = currentProfileData?.display_name || "You";
  const isProviderConfigured = Boolean(
    process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY &&
      process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY
  );

  return (
    <ChatRoomClient
      matchId={matchId}
      otherUserName={otherUserName}
      initialOtherUserLastSeenAt={
        matchChat.participantRole === "host"
          ? matchChat.chat.last_seen_by_guest_at
          : matchChat.chat.last_seen_by_host_at
      }
      purposeLabel={purposeLabel}
      meetingTimeLabel={meetingTimeLabel}
      placeLabel={placeLabel}
      provider={matchChat.chat.provider}
      roomId={matchChat.chat.external_room_id}
      isProviderConfigured={isProviderConfigured}
      currentUserId={user.id}
      currentUserName={currentUserName}
    />
  );
}
