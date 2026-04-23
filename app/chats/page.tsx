import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "../../lib/supabase/server";
import { normalizeUserTimeZone, USER_TIME_ZONE_COOKIE } from "../../lib/userTimeZone";
import { isConfirmedMatchStatus } from "../../lib/matches/status";
import { getPublicLocationLabel } from "../../lib/locationPrivacy";
import ChatsPageClient, { type ChatListItem } from "./ChatsPageClient";

export default async function ChatsPage() {
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

  const { data: matchesData } = await supabase
    .from("matches")
    .select("id, post_id, user_a, user_b, status, created_at")
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const matches = (matchesData || []).filter((item) =>
    isConfirmedMatchStatus(String(item.status || ""))
  );

  const relatedPostIds = Array.from(new Set(matches.map((item) => item.post_id)));
  const relatedUserIds = Array.from(
    new Set(
      matches
        .map((item) => (item.user_a === user.id ? item.user_b : item.user_a))
        .filter(Boolean)
    )
  );

  const [postsRes, profilesRes, chatMetaRes] = await Promise.all([
    relatedPostIds.length > 0
      ? supabase
          .from("posts")
          .select("id, meeting_purpose, meeting_time, place_name, location, status")
          .in("id", relatedPostIds)
      : Promise.resolve({ data: [] as never[] }),
    relatedUserIds.length > 0
      ? supabase.from("profiles").select("id, display_name").in("id", relatedUserIds)
      : Promise.resolve({ data: [] as never[] }),
    matches.length > 0
      ? supabase
          .from("match_chats")
          .select(
            "match_id, last_chat_activity_at, last_seen_by_host_at, last_seen_by_guest_at, host_user_id, guest_user_id"
          )
          .in(
            "match_id",
            matches.map((item) => item.id)
          )
      : Promise.resolve({ data: [] as never[] }),
  ]);

  const postMap = Object.fromEntries((postsRes.data || []).map((post) => [post.id, post]));
  const profileMap = Object.fromEntries(
    (profilesRes.data || []).map((profile) => [profile.id, profile.display_name || "Unknown"])
  );
  const chatMetaMap = Object.fromEntries(
    (chatMetaRes.data || []).map((item) => [item.match_id, item])
  );

  const chats: ChatListItem[] = matches
    .map((item) => {
      const post = postMap[item.post_id];
      if (!post) return null;

      const otherUserId = item.user_a === user.id ? item.user_b : item.user_a;
      const chatMeta = chatMetaMap[item.id];
      const viewerLastSeen =
        chatMeta?.host_user_id === user.id
          ? chatMeta.last_seen_by_host_at
          : chatMeta?.guest_user_id === user.id
          ? chatMeta.last_seen_by_guest_at
          : null;
      const hasNewMessage = Boolean(
        chatMeta?.last_chat_activity_at &&
          (!viewerLastSeen || chatMeta.last_chat_activity_at > viewerLastSeen)
      );

      return {
        matchId: item.id,
        otherUserName: profileMap[otherUserId] || "Unknown",
        meetingPurpose: post.meeting_purpose || "Meetup",
        meetingTime: post.meeting_time,
        placeLabel:
          post.place_name ||
          getPublicLocationLabel(post.place_name, post.location) ||
          "Selected place",
        hasNewMessage,
        lastActivityAt: chatMeta?.last_chat_activity_at || null,
        createdAt: item.created_at,
        postStatus: post.status,
      } satisfies ChatListItem;
    })
    .filter((item): item is ChatListItem => Boolean(item))
    .sort((a, b) => {
      const aTime = new Date(a.lastActivityAt || a.createdAt).getTime();
      const bTime = new Date(b.lastActivityAt || b.createdAt).getTime();
      return bTime - aTime;
    });

  return <ChatsPageClient chats={chats} userTimeZone={userTimeZone} />;
}
