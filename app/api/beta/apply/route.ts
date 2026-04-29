import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { sendBetaApprovalEmail } from "../../../../lib/betaApprovalEmail";
import { isPostingBetaRequired } from "../../../../lib/postingAccess";

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

async function savePendingNonLocalApplication({
  email,
  fullName,
  ageGroup,
  gender,
  motivation,
  meetupInterests,
}: {
  email: string;
  fullName: string | null;
  ageGroup: string | null;
  gender: string | null;
  motivation: string;
  meetupInterests: string[];
}) {
  const admin = createAdminClient();

  const { data: existingApplication, error: existingApplicationError } = await admin
    .from("beta_applications")
    .select("id, status")
    .eq("email_normalized", email)
    .maybeSingle();

  if (existingApplicationError) {
    throw existingApplicationError;
  }

  if (existingApplication?.status === "approved") {
    return { status: "approved" as const };
  }

  const { error: upsertError } = await admin.from("beta_applications").upsert(
    {
      email,
      full_name: fullName,
      city: toApplicationCity("other_region"),
      age_group: ageGroup,
      gender,
      motivation,
      meetup_interests: meetupInterests,
      availability: null,
      status: "pending",
      reviewed_at: null,
      reviewed_by_user_id: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email_normalized" }
  );

  if (upsertError) {
    throw upsertError;
  }

  return { status: "pending" as const };
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

    if (region === "other_region") {
      const fullName = sanitizeOptionalText(body.fullName);
      const ageGroup = sanitizeOptionalChoice(body.ageGroup, VALID_AGE_GROUPS);
      const gender = sanitizeOptionalChoice(body.gender, VALID_GENDERS);
      const result = await savePendingNonLocalApplication({
        email,
        fullName,
        ageGroup,
        gender,
        motivation,
        meetupInterests,
      });

      if (result.status === "approved") {
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

      return NextResponse.json(
        {
          ok: true,
          status: "pending",
          message:
            "Thanks for your interest. During beta, posting approvals are only opening for LA or nearby, so other regions are not being approved yet.",
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

    if (applicationStatus === "daily_full") {
      return NextResponse.json(
        {
          ok: false,
          status: "daily_full",
          error:
            "Today's posting beta tester spots are full. Please try again tomorrow.",
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
              "You're approved for posting access. Check your email for the signup link.",
          },
          { status: 200 }
        );
      }

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

    return NextResponse.json(
      {
        ok: true,
        status: applicationStatus,
        message: "Your posting access application has been received.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Beta application route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
