import { NextResponse } from "next/server";
import { createClient } from "../../../../../lib/supabase/server";
import { cookies } from "next/headers";
import { hasMeetingStarted } from "../../../../../lib/meetingTime";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../../../../lib/userTimeZone";
import { sendPushNotificationToUser } from "../../../../../lib/pushNotifications";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(_req: Request, { params }: RouteContext) {
  try {
    const postId = Number(params.id);
    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: "Invalid meetup." }, { status: 400 });
    }

    const supabase = await createClient();
    const cookieStore = await cookies();
    const userTimeZone = normalizeUserTimeZone(
      cookieStore.get(USER_TIME_ZONE_COOKIE)?.value
    );
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, status, meeting_time, meeting_purpose, place_name, location")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !postData) {
      return NextResponse.json({ error: "Meetup not found." }, { status: 404 });
    }

    if (postData.user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the host can cancel this meetup." },
        { status: 403 }
      );
    }

    if (String(postData.status || "open").toLowerCase() === "cancelled") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (hasMeetingStarted(postData.meeting_time, userTimeZone)) {
      return NextResponse.json(
        {
          error:
            "This meetup has already started, so it can no longer be cancelled here.",
        },
        { status: 403 }
      );
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        status: "cancelled",
        cancelled_at: now,
        cancelled_by_user_id: user.id,
      })
      .eq("id", postId)
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Cancel meetup update failed", {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code,
        postId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "We couldn't cancel this meetup right now." },
        { status: 500 }
      );
    }

    const [{ data: requestRows }, { data: matchRows }] = await Promise.all([
      supabase
        .from("match_requests")
        .select("requester_user_id")
        .eq("post_id", postId)
        .in("status", ["pending", "accepted"]),
      supabase
        .from("matches")
        .select("user_a, user_b")
        .eq("post_id", postId),
    ]);

    const recipientIds = new Set<string>();
    for (const row of requestRows || []) {
      if (row.requester_user_id && row.requester_user_id !== user.id) {
        recipientIds.add(row.requester_user_id);
      }
    }
    for (const row of matchRows || []) {
      if (row.user_a && row.user_a !== user.id) recipientIds.add(row.user_a);
      if (row.user_b && row.user_b !== user.id) recipientIds.add(row.user_b);
    }

    const meetupLabel =
      postData.meeting_purpose ||
      postData.place_name ||
      postData.location ||
      "a meetup";

    await Promise.all(
      Array.from(recipientIds).map((recipientId) =>
        sendPushNotificationToUser(recipientId, {
          title: "Meetup cancelled",
          body: `${meetupLabel} was cancelled by the host.`,
          url: "/dashboard?tab=matches",
          tag: `meetup-cancelled-${postId}`,
        }).catch((pushError) => {
          console.error("Cancel meetup push notification failed", {
            pushError,
            recipientId,
            postId,
          });
        })
      )
    );

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Cancel meetup route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
