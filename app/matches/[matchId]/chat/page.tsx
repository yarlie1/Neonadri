import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/server";
import {
  getChatWindowState,
  MATCH_CHAT_CLOSED_MESSAGE,
} from "../../../../lib/chat/chatWindow";
import { getOrCreateAuthorizedMatchChat } from "../../../../lib/chat/matchChats";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../lib/userTimeZone";
import { formatMeetingTime, parseMeetingTime } from "../../../../lib/meetingTime";
import ChatRoomClient from "../ChatRoomClient";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../../designSystem";

type PageProps = {
  params: {
    matchId: string;
  };
};

function formatShortMeetingTime(
  meetingTime: string | null,
  timeZone: string
) {
  const parsed = parseMeetingTime(meetingTime, timeZone);
  if (!parsed) return formatMeetingTime(meetingTime, timeZone);

  const dateLabel = parsed.toLocaleDateString(undefined, {
    timeZone,
    month: "short",
    day: "numeric",
  });

  const timeLabel = parsed.toLocaleTimeString([], {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel} / ${timeLabel}`;
}

function MatchChatErrorState({ code }: { code: string }) {
  const body =
    code === "MATCH_BLOCKED"
      ? "This chat is unavailable because one participant has blocked the other."
      : "We could not open this match chat yet.";

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className={`mx-auto max-w-2xl rounded-[24px] p-5 backdrop-blur ${APP_SURFACE_CARD_CLASS}`}>
        <div className={APP_EYEBROW_CLASS}>
          Chat unavailable
        </div>
        <div className="mt-2 text-xl font-bold tracking-[-0.03em] text-[#24323c]">
          {body}
        </div>
        <p className={`mt-3 text-sm leading-6 ${APP_BODY_TEXT_CLASS}`}>
          Debug code: <span className="font-semibold text-[#34424b]">{code}</span>
        </p>
        <div className="mt-5">
          <Link
            href="/dashboard?tab=matches"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
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

  const meetingTimeLabel = formatShortMeetingTime(
    postData?.meeting_time || null,
    userTimeZone
  );
  const { chatClosed } = getChatWindowState(postData?.meeting_time || null, userTimeZone);
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
      meetingTimeLabel={meetingTimeLabel}
      placeLabel={placeLabel}
      roomId={matchChat.chat.external_room_id}
      isProviderConfigured={isProviderConfigured}
      chatClosed={chatClosed}
      chatClosedMessage={MATCH_CHAT_CLOSED_MESSAGE}
      currentUserId={user.id}
      currentUserName={currentUserName}
      otherUserId={matchChat.otherUserId}
    />
  );
}

