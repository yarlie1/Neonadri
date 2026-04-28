import { NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_APP_URL = "https://www.neonadri.net";
const DEFAULT_FROM_EMAIL = "hello@neonadri.net";

type EmailActionType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "reauthentication"
  | "email"
  | "password_changed_notification"
  | "email_changed_notification"
  | "phone_changed_notification"
  | "mfa_factor_enrolled_notification"
  | "mfa_factor_unenrolled_notification"
  | "identity_linked_notification"
  | "identity_unlinked_notification";

type HookPayload = {
  user: {
    email?: string | null;
    new_email?: string | null;
  };
  email_data: {
    token?: string | null;
    token_hash?: string | null;
    token_new?: string | null;
    token_hash_new?: string | null;
    redirect_to?: string | null;
    email_action_type?: EmailActionType | null;
    old_email?: string | null;
    old_phone?: string | null;
    provider?: string | null;
    factor_type?: string | null;
  };
};

type EmailJob = {
  to: string;
  subject: string;
  html: string;
};

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getAppBaseUrl() {
  return (getRequiredEnv("APP_BASE_URL") || DEFAULT_APP_URL).replace(/\/+$/, "");
}

function toSafePath(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;

  const trimmed = value.trim();
  if (!trimmed) return fallback;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  try {
    const target = new URL(trimmed);
    const base = new URL(getAppBaseUrl());
    if (target.origin !== base.origin) {
      return fallback;
    }

    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

function buildConfirmUrl({
  tokenHash,
  type,
  nextPath,
}: {
  tokenHash: string;
  type: string;
  nextPath: string;
}) {
  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    next: nextPath,
  });

  return `${getAppBaseUrl()}/auth/confirm?${params.toString()}`;
}

function buildPrimaryActionContent({
  headline,
  body,
  buttonLabel,
  buttonHref,
  fallbackCode,
}: {
  headline: string;
  body: string;
  buttonLabel?: string;
  buttonHref?: string;
  fallbackCode?: string | null;
}) {
  const actionButton =
    buttonLabel && buttonHref
      ? `
        <p style="margin: 24px 0;">
          <a
            href="${buttonHref}"
            style="display:inline-block;padding:12px 20px;border-radius:999px;background:#eef3f6;border:1px solid #d6dee4;color:#24323c;text-decoration:none;font-weight:600;"
          >
            ${buttonLabel}
          </a>
        </p>
      `
      : "";

  const codeBlock = fallbackCode
    ? `
      <div style="margin-top: 16px; padding: 16px; border-radius: 20px; border: 1px solid #d7dfe5; background: linear-gradient(180deg,#ffffff 0%,#edf3f6 100%);">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #849099;">
          One-time code
        </div>
        <div style="margin-top: 8px; font-size: 24px; font-weight: 800; letter-spacing: 0.08em; color: #24323c;">
          ${fallbackCode}
        </div>
      </div>
    `
    : "";

  return `
    <div style="font-family: Arial, sans-serif; color: #24323c; line-height: 1.6;">
      <p style="margin: 0 0 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #7f8990;">
        Neonadri
      </p>
      <h2 style="margin: 0 0 14px; font-size: 28px; line-height: 1.1;">
        ${headline}
      </h2>
      <p style="margin: 0; color: #5a6670;">
        ${body}
      </p>
      ${actionButton}
      ${codeBlock}
      <p style="margin-top: 24px; color: #7c8891; font-size: 13px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;
}

function buildEmailJobs(payload: HookPayload): EmailJob[] {
  const emailActionType = payload.email_data.email_action_type || "email";
  const userEmail = payload.user.email?.trim() || "";
  const newEmail = payload.user.new_email?.trim() || "";
  const redirectPath = toSafePath(payload.email_data.redirect_to, "/");

  switch (emailActionType) {
    case "recovery": {
      if (!userEmail || !payload.email_data.token_hash) return [];
      const href = buildConfirmUrl({
        tokenHash: payload.email_data.token_hash,
        type: "recovery",
        nextPath: "/reset-password",
      });

      return [
        {
          to: userEmail,
          subject: "Reset your Neonadri password",
          html: buildPrimaryActionContent({
            headline: "Reset your password",
            body: "Use the secure link below to choose a new password for your Neonadri account.",
            buttonLabel: "Reset password",
            buttonHref: href,
            fallbackCode: payload.email_data.token,
          }),
        },
      ];
    }

    case "magiclink": {
      if (!userEmail || !payload.email_data.token_hash) return [];
      const href = buildConfirmUrl({
        tokenHash: payload.email_data.token_hash,
        type: "magiclink",
        nextPath: redirectPath,
      });

      return [
        {
          to: userEmail,
          subject: "Your Neonadri sign-in link",
          html: buildPrimaryActionContent({
            headline: "Log in to Neonadri",
            body: "Use this secure link to sign in and continue where you left off.",
            buttonLabel: "Log in",
            buttonHref: href,
            fallbackCode: payload.email_data.token,
          }),
        },
      ];
    }

    case "invite": {
      if (!userEmail || !payload.email_data.token_hash) return [];
      const href = buildConfirmUrl({
        tokenHash: payload.email_data.token_hash,
        type: "invite",
        nextPath: redirectPath || "/signup",
      });

      return [
        {
          to: userEmail,
          subject: "Your Neonadri invite is ready",
          html: buildPrimaryActionContent({
            headline: "You've been invited",
            body: "Use the link below to accept your invitation and continue into Neonadri.",
            buttonLabel: "Accept invite",
            buttonHref: href,
            fallbackCode: payload.email_data.token,
          }),
        },
      ];
    }

    case "email_change": {
      const jobs: EmailJob[] = [];

      if (userEmail && payload.email_data.token_hash_new) {
        jobs.push({
          to: userEmail,
          subject: "Confirm your Neonadri email change",
          html: buildPrimaryActionContent({
            headline: "Confirm this email change",
            body: "We received a request to change the email address on your Neonadri account. Confirm from your current email first.",
            buttonLabel: "Confirm current email",
            buttonHref: buildConfirmUrl({
              tokenHash: payload.email_data.token_hash_new,
              type: "email_change",
              nextPath: "/account",
            }),
            fallbackCode: payload.email_data.token,
          }),
        });
      }

      if (newEmail && payload.email_data.token_hash) {
        jobs.push({
          to: newEmail,
          subject: "Confirm your new Neonadri email",
          html: buildPrimaryActionContent({
            headline: "Confirm your new email",
            body: "Confirm this email address to finish updating your Neonadri account.",
            buttonLabel: "Confirm new email",
            buttonHref: buildConfirmUrl({
              tokenHash: payload.email_data.token_hash,
              type: "email_change",
              nextPath: "/account",
            }),
            fallbackCode: payload.email_data.token_new || payload.email_data.token,
          }),
        });
      }

      return jobs;
    }

    case "reauthentication": {
      if (!userEmail) return [];
      return [
        {
          to: userEmail,
          subject: "Confirm your Neonadri reauthentication",
          html: buildPrimaryActionContent({
            headline: "Confirm it's really you",
            body: "Use the code below to finish your Neonadri security check.",
            fallbackCode: payload.email_data.token,
          }),
        },
      ];
    }

    case "password_changed_notification": {
      if (!userEmail) return [];
      return [
        {
          to: userEmail,
          subject: "Your Neonadri password was changed",
          html: buildPrimaryActionContent({
            headline: "Your password was changed",
            body: "This is a confirmation that your Neonadri account password was updated successfully.",
          }),
        },
      ];
    }

    case "email_changed_notification": {
      if (!userEmail) return [];
      return [
        {
          to: userEmail,
          subject: "Your Neonadri email was changed",
          html: buildPrimaryActionContent({
            headline: "Your email address was changed",
            body: "This is a confirmation that the email address on your Neonadri account was updated.",
          }),
        },
      ];
    }

    default: {
      if (!userEmail || !payload.email_data.token_hash) return [];
      const href = buildConfirmUrl({
        tokenHash: payload.email_data.token_hash,
        type: emailActionType === "email" ? "email" : emailActionType,
        nextPath: redirectPath,
      });

      return [
        {
          to: userEmail,
          subject:
            emailActionType === "signup" || emailActionType === "email"
              ? "Confirm your Neonadri email"
              : "Continue with Neonadri",
          html: buildPrimaryActionContent({
            headline:
              emailActionType === "signup" || emailActionType === "email"
                ? "Confirm your email"
                : "Continue with Neonadri",
            body:
              emailActionType === "signup" || emailActionType === "email"
                ? "Use the secure link below to confirm this email for your Neonadri account."
                : "Use the secure link below to continue your Neonadri request.",
            buttonLabel:
              emailActionType === "signup" || emailActionType === "email"
                ? "Confirm email"
                : "Continue",
            buttonHref: href,
            fallbackCode: payload.email_data.token,
          }),
        },
      ];
    }
  }
}

async function sendWithResend(job: EmailJob) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = `Neonadri <${DEFAULT_FROM_EMAIL}>`;

  if (!apiKey) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [job.to],
      subject: job.subject,
      html: job.html,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    throw new Error(`Resend request failed: ${details || response.status}`);
  }
}

export async function POST(request: Request) {
  const hookSecret = getRequiredEnv("SUPABASE_SEND_EMAIL_HOOK_SECRET");

  if (!hookSecret) {
    return NextResponse.json(
      { error: "Missing SUPABASE_SEND_EMAIL_HOOK_SECRET" },
      { status: 500 }
    );
  }

  try {
    const payloadText = await request.text();
    const headers = Object.fromEntries(request.headers.entries());
    const webhook = new Webhook(hookSecret.replace("v1,whsec_", ""));
    const payload = webhook.verify(payloadText, headers) as HookPayload;
    const jobs = buildEmailJobs(payload);

    if (jobs.length === 0) {
      return NextResponse.json(
        { error: "No email job could be created for this payload." },
        { status: 400 }
      );
    }

    for (const job of jobs) {
      await sendWithResend(job);
    }

    return NextResponse.json({});
  } catch (error) {
    console.error("Send email hook failed", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Could not send auth email.",
        },
      },
      { status: 401 }
    );
  }
}
