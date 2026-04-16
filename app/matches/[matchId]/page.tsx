import { redirect, notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../../../lib/supabase/server";
import { getOrCreateAuthorizedMatchChat } from "../../../lib/chat/matchChats";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../lib/userTimeZone";
import { formatMeetingTime } from "../../../lib/meetingTime";
import ChatRoomClient from "./ChatRoomClient";

type PageProps = {
  params: {
    matchId: string;
  };
};

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
    if (message === "MATCH_FORBIDDEN" || message === "MATCH_NOT_READY") {
      redirect("/dashboard?tab=matches");
    }
    notFound();
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

  const purposeLabel = postData?.meeting_purpose || "Meetup";
  const meetingTimeLabel = formatMeetingTime(postData?.meeting_time || null, userTimeZone);
  const placeLabel = postData?.place_name || postData?.location || "Selected place";
  const otherUserName = otherProfileData?.display_name || "Participant";
  const isProviderConfigured = Boolean(
    process.env.NEXT_PUBLIC_PUBNUB_PUBLISH_KEY &&
      process.env.NEXT_PUBLIC_PUBNUB_SUBSCRIBE_KEY
  );

  return (
    <ChatRoomClient
      otherUserName={otherUserName}
      purposeLabel={purposeLabel}
      meetingTimeLabel={meetingTimeLabel}
      placeLabel={placeLabel}
      provider={matchChat.chat.provider}
      roomId={matchChat.chat.external_room_id}
      isProviderConfigured={isProviderConfigured}
    />
  );
}
