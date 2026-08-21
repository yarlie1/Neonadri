import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";
import { generateUniqueProfileUsername } from "../../../../lib/profileUsername";

const VALID_GENDERS = ["Male", "Female", "Other", "Prefer not to say"] as const;
const VALID_AGE_GROUPS = ["20s", "30s", "40s", "50s+"] as const;

function sanitizeAllowedValue(value: unknown, allowedValues: readonly string[]) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return allowedValues.includes(normalized) ? normalized : null;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const gender = sanitizeAllowedValue(body.gender, VALID_GENDERS);
    const ageGroup = sanitizeAllowedValue(body.age_group, VALID_AGE_GROUPS);

    if (!gender) {
      return NextResponse.json({ error: "Please select a gender." }, { status: 400 });
    }

    if (!ageGroup) {
      return NextResponse.json({ error: "Please select an age group." }, { status: 400 });
    }

    if (body.is_adult_confirmed !== true) {
      return NextResponse.json(
        { error: "Please confirm that you are 18 or older." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient() as any;
    const { data: existingProfile, error: existingProfileError } = await adminSupabase
      .from("profiles")
      .select("id, display_name, username")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfileError) {
      console.error("Profile completion lookup failed", {
        message: existingProfileError.message,
        details: existingProfileError.details,
        hint: existingProfileError.hint,
        code: existingProfileError.code,
        userId: user.id,
      });
      return NextResponse.json({ error: "Failed to check your profile." }, { status: 500 });
    }

    const displayName =
      existingProfile?.display_name ||
      (typeof user.user_metadata?.display_name === "string"
        ? user.user_metadata.display_name.trim()
        : "") ||
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name.trim()
        : "") ||
      null;

    if (!existingProfile) {
      const username = await generateUniqueProfileUsername(
        adminSupabase,
        displayName,
        user.id
      );
      const { error } = await adminSupabase.from("profiles").insert({
        id: user.id,
        display_name: displayName,
        username,
        gender,
        age_group: ageGroup,
        is_adult_confirmed: true,
        age_gate_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Profile completion insert failed", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          userId: user.id,
        });
        return NextResponse.json({ error: "Failed to complete your profile." }, { status: 500 });
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const { error } = await adminSupabase
      .from("profiles")
      .update({
        gender,
        age_group: ageGroup,
        is_adult_confirmed: true,
        age_gate_confirmed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Profile completion update failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId: user.id,
      });
      return NextResponse.json({ error: "Failed to complete your profile." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Profile completion route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
