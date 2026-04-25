const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_APP_URL = "https://neonadri.net";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export async function sendBetaApprovalEmail({
  to,
  fullName,
}: {
  to: string;
  fullName?: string | null;
}) {
  const apiKey = getRequiredEnv("RESEND_API_KEY");
  const from = getRequiredEnv("RESEND_FROM_EMAIL");
  const appUrl = getRequiredEnv("APP_BASE_URL") || DEFAULT_APP_URL;

  if (!apiKey || !from) {
    return {
      ok: false as const,
      skipped: true as const,
      reason: "missing_email_config",
    };
  }

  const firstName = fullName?.trim() || "there";
  const signupUrl = `${appUrl.replace(/\/+$/, "")}/signup?email=${encodeURIComponent(
    to
  )}`;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Neonadri beta access is approved",
      html: `
        <div style="font-family: Arial, sans-serif; color: #24323c; line-height: 1.6;">
          <p>Hi ${firstName},</p>
          <p>Your Neonadri beta access has been approved.</p>
          <p>You can now sign up with the same email address you used for your beta application.</p>
          <p>
            <a href="${signupUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#eef3f6;border:1px solid #d6dee4;color:#24323c;text-decoration:none;font-weight:600;">
              Continue to signup
            </a>
          </p>
          <p>See you inside Neonadri.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const details = await response.text().catch(() => "");
    return {
      ok: false as const,
      skipped: false as const,
      reason: "resend_request_failed",
      details,
    };
  }

  return {
    ok: true as const,
    skipped: false as const,
  };
}
