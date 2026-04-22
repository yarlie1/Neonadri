import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import {
  ABOUT_ME_RESTRICTION_MESSAGE,
  validateAboutMeContent,
} from "../../../../lib/profileContent";

const DISPLAY_NAME_MAX_LENGTH = 24;
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

    if (body.id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const aboutMeValue =
      typeof body.about_me === "string" && body.about_me.trim()
        ? body.about_me.trim()
        : "";
    const aboutMeValidation = validateAboutMeContent(aboutMeValue);
    const displayNameValue =
      typeof body.display_name === "string" ? body.display_name.trim() : "";

    if (!aboutMeValidation.ok) {
      return NextResponse.json(
        { error: ABOUT_ME_RESTRICTION_MESSAGE },
        { status: 400 }
      );
    }

    if (displayNameValue.length > DISPLAY_NAME_MAX_LENGTH) {
      return NextResponse.json(
        {
          error: `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`,
        },
        { status: 400 }
      );
    }

    const ageGroupValue = sanitizeAllowedValue(body.age_group, VALID_AGE_GROUPS);

    if (!ageGroupValue) {
      return NextResponse.json(
        { error: "Please select an age group." },
        { status: 400 }
      );
    }

    const payload = {
      id: user.id,
      display_name: displayNameValue || null,
      bio:
        typeof body.bio === "string" && body.bio.trim() ? body.bio.trim() : null,
      about_me: aboutMeValue || null,
      gender: sanitizeAllowedValue(body.gender, VALID_GENDERS),
      age_group: ageGroupValue,
      preferred_area:
        typeof body.preferred_area === "string" && body.preferred_area.trim()
          ? body.preferred_area.trim()
          : null,
      languages:
        Array.isArray(body.languages) && body.languages.length > 0
          ? body.languages
          : null,
      meeting_style:
        typeof body.meeting_style === "string" && body.meeting_style.trim()
          ? body.meeting_style.trim()
          : null,
      interests:
        Array.isArray(body.interests) && body.interests.length > 0
          ? body.interests
          : null,
      response_time_note:
        typeof body.response_time_note === "string" &&
        body.response_time_note.trim()
          ? body.response_time_note.trim()
          : null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(payload);

    if (error) {
      console.error("Profile save failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to save profile." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Profile save route unexpected error", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
