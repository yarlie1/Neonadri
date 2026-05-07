import webPush from "web-push";
import { createAdminClient } from "./supabase/admin";

type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type PushNotificationPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

let vapidConfigured = false;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getVapidPublicKey() {
  return getRequiredEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
}

export function isPushSendConfigured() {
  return Boolean(getVapidPublicKey() && getRequiredEnv("VAPID_PRIVATE_KEY"));
}

function configureWebPush() {
  if (vapidConfigured) return true;

  const publicKey = getVapidPublicKey();
  const privateKey = getRequiredEnv("VAPID_PRIVATE_KEY");
  const subject = getRequiredEnv("VAPID_SUBJECT") || "mailto:hello@neonadri.net";

  if (!publicKey || !privateKey) {
    return false;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
) {
  if (!configureWebPush()) {
    return { ok: false, skipped: true, reason: "missing-vapid-config" };
  }

  const adminSupabase = createAdminClient() as any;
  const { data: subscriptions, error } = await adminSupabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error("[push] subscription lookup failed", error);
    return { ok: false, skipped: false, reason: "subscription-lookup-failed" };
  }

  const rows = (subscriptions || []) as PushSubscriptionRow[];
  if (rows.length === 0) {
    return { ok: true, skipped: true, reason: "no-subscriptions" };
  }

  const body = JSON.stringify(payload);
  const failureDetails: string[] = [];
  const results = await Promise.allSettled(
    rows.map(async (subscription) => {
      try {
        await webPush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          body
        );
      } catch (error) {
        const statusCode =
          typeof error === "object" && error && "statusCode" in error
            ? Number((error as { statusCode?: unknown }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await adminSupabase
            .from("push_subscriptions")
            .delete()
            .eq("id", subscription.id);
          return;
        }

        await adminSupabase
          .from("push_subscriptions")
          .update({ last_error_at: new Date().toISOString() })
          .eq("id", subscription.id);

        failureDetails.push(
          error instanceof Error ? error.message : "Unknown push provider error"
        );
        throw error;
      }
    })
  );

  const failedCount = results.filter((result) => result.status === "rejected").length;
  if (failedCount > 0) {
    console.error("[push] send failed for some subscriptions", {
      failedCount,
      userId,
      failureDetails,
    });
  }

  return {
    ok: failedCount === 0,
    skipped: false,
    sentCount: rows.length - failedCount,
    failedCount,
    reason: failedCount > 0 ? failureDetails[0] || "push-send-failed" : undefined,
  };
}
