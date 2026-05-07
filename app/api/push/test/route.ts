import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { sendPushNotificationToUser } from "../../../../lib/pushNotifications";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendPushNotificationToUser(user.id, {
    title: "Neonadri alerts are on",
    body: "This is a test notification from Neonadri.",
    url: "/dashboard",
    tag: "neonadri-test-alert",
  });

  if (!result.ok && !result.skipped) {
    return NextResponse.json(
      { error: "Test notification could not be sent.", result },
      { status: 500 }
    );
  }

  if (result.skipped) {
    return NextResponse.json(
      { error: "No active push subscription or server push config is missing.", result },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, result });
}
