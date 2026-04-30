const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_APP_URL = "https://neonadri.net";
const BETA_APPLICATION_RECIPIENT = "hello@neonadri.net";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export async function sendBetaApplicationNotificationEmail({
  applicantEmail,
  fullName,
  ageGroup,
  gender,
  region,
  meetupInterests,
  motivation,
}: {
  applicantEmail: string;
  fullName?: string | null;
  ageGroup?: string | null;
  gender?: string | null;
  region: string;
  meetupInterests: string[];
  motivation: string;
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

  const adminUrl = `${appUrl.replace(/\/+$/, "")}/account/beta`;
  const interestsLabel =
    meetupInterests.length > 0 ? meetupInterests.join(", ") : "Not provided";

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [BETA_APPLICATION_RECIPIENT],
      subject: "New Neonadri beta application received",
      html: `
        <div style="font-family: Arial, sans-serif; color: #24323c; line-height: 1.6;">
          <p>A new posting beta application was submitted.</p>
          <p><strong>Name:</strong> ${fullName?.trim() || "Not provided"}</p>
          <p><strong>Email:</strong> ${applicantEmail}</p>
          <p><strong>Region:</strong> ${region}</p>
          <p><strong>Age group:</strong> ${ageGroup?.trim() || "Not provided"}</p>
          <p><strong>Gender:</strong> ${gender?.trim() || "Not provided"}</p>
          <p><strong>Meetup interests:</strong> ${interestsLabel}</p>
          <p><strong>Why they want in:</strong><br/>${motivation || "Not provided"}</p>
          <p>
            <a href="${adminUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#eef3f6;border:1px solid #d6dee4;color:#24323c;text-decoration:none;font-weight:600;">
              Open beta applications
            </a>
          </p>
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
