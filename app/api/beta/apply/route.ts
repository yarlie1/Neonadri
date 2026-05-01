import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isPostingBetaRequired } from "../../../../lib/postingAccess";
import { sendBetaApplicationNotificationEmail } from "../../../../lib/betaApplicationNotificationEmail";

const VALID_AGE_GROUPS = ["20s", "30s", "40s", "50s+"] as const;
const VALID_GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;
const VALID_REGIONS = ["la_nearby", "other_region"] as const;

type BetaRegion = (typeof VALID_REGIONS)[number];

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

function toApplicationCity(region: BetaRegion) {
  return region === "la_nearby" ? "LA or nearby" : "Other region";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const motivation =
      typeof body.motivation === "string" ? body.motivation.trim() : "";
    const region = sanitizeOptionalChoice(body.region, VALID_REGIONS) as BetaRegion | null;
    const meetupInterests = Array.isArray(body.meetupInterests)
      ? (body.meetupInterests as unknown[])
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

    if (!region) {
      return NextResponse.json(
        { error: "Please choose whether you're in LA or nearby, or in another region." },
        { status: 400 }
      );
    }

    const postingBetaRequired = await isPostingBetaRequired(supabase);

    if (!postingBetaRequired) {
      return NextResponse.json(
        {
          ok: true,
          status: "approved",
          message:
            "Posting beta applications are currently off. You can sign up and post right away.",
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabase.rpc("submit_beta_application", {
      p_email: email,
      p_full_name: sanitizeOptionalText(body.fullName),
      p_city: toApplicationCity(region),
      p_age_group: sanitizeOptionalChoice(body.ageGroup, VALID_AGE_GROUPS),
      p_gender: sanitizeOptionalChoice(body.gender, VALID_GENDERS),
      p_motivation: motivation,
      p_meetup_interests: meetupInterests,
      p_availability: null,
    });

    if (error) {
      console.error("Beta application submit failed", error);
      return NextResponse.json(
        { error: "Could not submit your posting access application right now." },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : null;
    const applicationStatus = row?.application_status || "pending";

    if (applicationStatus === "approved") {
      return NextResponse.json(
        {
          ok: true,
          status: "approved",
          message:
            "This email is already approved for posting access. You can continue with signup now.",
        },
        { status: 200 }
      );
    }

    const notificationResult = await sendBetaApplicationNotificationEmail({
      applicantEmail: email,
      fullName: sanitizeOptionalText(body.fullName),
      ageGroup: sanitizeOptionalChoice(body.ageGroup, VALID_AGE_GROUPS),
      gender: sanitizeOptionalChoice(body.gender, VALID_GENDERS),
      region: toApplicationCity(region),
      meetupInterests,
      motivation,
    });

    if (!notificationResult.ok && !notificationResult.skipped) {
      console.error(
        "Beta application notification email failed",
        notificationResult.details
      );
    }

    return NextResponse.json(
      {
        ok: true,
        status: "pending",
        message:
          region === "other_region"
            ? "Thanks for your interest. During beta, posting approvals are only opening for LA or nearby, so other regions are not being approved yet."
            : "Your posting access application has been received. We'll review it and email you if you're approved.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Beta application route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
