import { createAdminClient } from "./supabase/admin";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_APP_URL = "https://neonadri.net";
const DEFAULT_FROM_EMAIL = "hello@neonadri.net";

export type EmailNotificationPayload = {
  subject: string;
  headline: string;
  body: string;
  url: string;
  buttonLabel?: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getAppBaseUrl() {
  return (getRequiredEnv("APP_BASE_URL") || DEFAULT_APP_URL).replace(/\/+$/, "");
}

function getFromEmail() {
  return getRequiredEnv("RESEND_FROM_EMAIL") || `Neonadri <${DEFAULT_FROM_EMAIL}>`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toAbsoluteUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${getAppBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function buildNotificationHtml(payload: EmailNotificationPayload) {
  const href = toAbsoluteUrl(payload.url);
  const buttonLabel = payload.buttonLabel || "Open Neonadri";

  return `
    <div style="font-family: Arial, sans-serif; color: #24323c; line-height: 1.6;">
      <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #7f8990;">
        Neonadri
      </p>
      <h2 style="margin: 0 0 14px; font-size: 28px; line-height: 1.1;">
        ${escapeHtml(payload.headline)}
      </h2>
      <p style="margin: 0; color: #5a6670;">
        ${escapeHtml(payload.body)}
      </p>
      <p style="margin: 24px 0;">
        <a
          href="${escapeHtml(href)}"
          style="display:inline-block;padding:12px 20px;border-radius:999px;background:#eef3f6;border:1px solid #d6dee4;color:#24323c;text-decoration:none;font-weight:600;"
        >
          ${escapeHtml(buttonLabel)}
        </a>
      </p>
      <p style="margin-top: 24px; color: #7c8891; font-size: 13px;">
        You can turn email notifications on or off from Account settings.
      </p>
    </div>
  `;
}

export async function sendEmailNotificationToUser(
  userId: string,
  payload: EmailNotificationPayload
) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "missing-resend-config" };
  }

  const adminSupabase = createAdminClient() as any;
  const { data: profile, error: profileError } = await adminSupabase
    .from("profiles")
    .select("email_notifications_enabled")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error("[email-notification] profile lookup failed", profileError);
    return { ok: false, skipped: false, reason: "profile-lookup-failed" };
  }

  if (profile?.email_notifications_enabled === false) {
    return { ok: true, skipped: true, reason: "email-notifications-disabled" };
  }

  const { data: userData, error: userError } =
    await adminSupabase.auth.admin.getUserById(userId);
  const email = userData?.user?.email?.trim();

  if (userError || !email) {
    console.error("[email-notification] user email lookup failed", userError);
    return { ok: false, skipped: false, reason: "user-email-lookup-failed" };
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [email],
      subject: payload.subject,
      html: buildNotificationHtml(payload),
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    console.error("[email-notification] resend request failed", {
      userId,
      details: details || response.status,
    });
    return { ok: false, skipped: false, reason: "resend-request-failed" };
  }

  return { ok: true, skipped: false };
}
