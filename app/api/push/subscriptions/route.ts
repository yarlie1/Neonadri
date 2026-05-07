import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function normalizeSubscription(value: unknown) {
  const subscription = value as PushSubscriptionPayload;
  const endpoint =
    typeof subscription?.endpoint === "string"
      ? subscription.endpoint.trim().slice(0, 2000)
      : "";
  const p256dh =
    typeof subscription?.keys?.p256dh === "string"
      ? subscription.keys.p256dh.trim().slice(0, 500)
      : "";
  const auth =
    typeof subscription?.keys?.auth === "string"
      ? subscription.keys.auth.trim().slice(0, 500)
      : "";

  if (!endpoint || !p256dh || !auth) {
    return null;
  }

  return { endpoint, p256dh, auth };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { subscription?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const subscription = normalizeSubscription(body.subscription);
  if (!subscription) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.p256dh,
        auth: subscription.auth,
        user_agent: request.headers.get("user-agent")?.slice(0, 500) || null,
        updated_at: now,
        last_error_at: null,
      },
      { onConflict: "endpoint" }
    );

  if (error) {
    console.error("[push-subscription] save failed", error);
    return NextResponse.json(
      { error: "Could not save notification subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { endpoint?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const endpoint = typeof body.endpoint === "string" ? body.endpoint.trim() : "";
  if (!endpoint) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[push-subscription] delete failed", error);
    return NextResponse.json(
      { error: "Could not remove notification subscription." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
