import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { isPostingBetaRequired } from "../../../../lib/postingAccess";

const VALID_AGE_GROUPS = ["20s", "30s", "40s", "50s+"] as const;
const VALID_GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;
const VALID_REGIONS = ["la_nearby", "other_region"] as const;

type BetaRegion = (typeof VALID_REGIONS)[number];
type ExistingBetaApplication = {
  id: number;
  status: string | null;
} | null;

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

async function saveBetaApplication({
  email,
  region,
  fullName,
  ageGroup,
  gender,
  motivation,
  meetupInterests,
}: {
  email: string;
  region: BetaRegion;
  fullName: string | null;
  ageGroup: string | null;
  gender: string | null;
  motivation: string;
  meetupInterests: string[];
}) {
  const admin = createAdminClient();

  const { data, error: existingApplicationError } = await admin
    .from("beta_applications")
    .select("id, status")
    .eq("email_normalized", email)
    .maybeSingle();
  const existingApplication = data as ExistingBetaApplication;

  if (existingApplicationError) {
    throw existingApplicationError;
  }

  if (existingApplication && existingApplication.status === "approved") {
    return { status: "approved" as const };
  }

  const { error: upsertError } = await admin.from("beta_applications").upsert(
    {
      email,
      full_name: fullName,
      city: toApplicationCity(region),
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

    const result = await saveBetaApplication({
      email,
      region,
      fullName: sanitizeOptionalText(body.fullName),
      ageGroup: sanitizeOptionalChoice(body.ageGroup, VALID_AGE_GROUPS),
      gender: sanitizeOptionalChoice(body.gender, VALID_GENDERS),
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
