import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { sendBetaApprovalEmail } from "../../../../lib/betaApprovalEmail";

const VALID_AGE_GROUPS = ["20s", "30s", "40s", "50s+"] as const;
const VALID_GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;

function sanitizeOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function sanitizeOptionalChoice(value: unknown, allowed: readonly string[]) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return allowed.includes(normalized) ? normalized : null;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const motivation =
      typeof body.motivation === "string" ? body.motivation.trim() : "";
    const meetupInterests = Array.isArray(body.meetupInterests)
      ? body.meetupInterests
          .filter((value): value is string => typeof value === "string")
          .map((value) => value.trim())
          .filter(Boolean)
      : [];

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.rpc("submit_beta_application", {
      p_email: email,
      p_full_name: sanitizeOptionalText(body.fullName),
      p_city: null,
      p_age_group: sanitizeOptionalChoice(body.ageGroup, VALID_AGE_GROUPS),
      p_gender: sanitizeOptionalChoice(body.gender, VALID_GENDERS),
      p_motivation: motivation,
      p_meetup_interests: meetupInterests,
      p_availability: null,
    });

    if (error) {
      console.error("Beta application submit failed", error);
      return NextResponse.json(
        { error: "Could not submit your beta application right now." },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : null;
    const applicationStatus = row?.application_status || "pending";

    if (applicationStatus === "daily_full") {
      return NextResponse.json(
        {
          ok: false,
          status: "daily_full",
          error: "Today’s beta tester spots are full. Please try again tomorrow.",
        },
        { status: 429 }
      );
    }

    if (applicationStatus === "approved") {
      const shouldSendApprovalEmail = !!row?.send_approval_email;

      if (shouldSendApprovalEmail) {
        const emailResult = await sendBetaApprovalEmail({
          to: email,
          fullName: sanitizeOptionalText(body.fullName),
        });

        if (!emailResult.ok && !emailResult.skipped) {
          console.error("Beta auto-approval email failed", emailResult.details);
        }

        return NextResponse.json(
          {
            ok: true,
            status: "approved",
            emailSent: emailResult.ok,
            emailSkipped: emailResult.skipped,
            message:
              "You’re approved for beta access. Check your email for the signup link.",
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        {
          ok: true,
          status: "approved",
          message:
            "This email is already approved for beta access. You can continue to signup now.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: applicationStatus,
        message: "Your beta application has been received.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Beta application route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
