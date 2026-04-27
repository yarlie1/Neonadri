import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { sendBetaApprovalEmail } from "../../../../lib/betaApprovalEmail";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      supabase,
      user: null,
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    return {
      supabase,
      user,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { supabase, user, error: null as NextResponse | null };
}

export async function GET() {
  try {
    const { supabase, error } = await assertAdmin();
    if (error) return error;

    const { data: settingsRow, error: settingsError } = await supabase
      .from("app_settings")
      .select("bool_value")
      .eq("setting_key", "posting_beta_required")
      .maybeSingle();

    if (settingsError) {
      console.error("Admin beta settings load failed", settingsError);
      return NextResponse.json(
        { error: "Failed to load beta settings." },
        { status: 500 }
      );
    }

    const { data: applications, error: applicationsError } = await supabase
      .from("beta_applications")
      .select(
        "id, email, full_name, city, age_group, gender, motivation, meetup_interests, availability, status, notes, reviewed_at, created_at"
      )
      .order("created_at", { ascending: false });

    if (applicationsError) {
      console.error("Admin beta load failed", applicationsError);
      return NextResponse.json(
        { error: "Failed to load beta applications." },
        { status: 500 }
      );
    }

    const { data: allowlistRows, error: allowlistError } = await supabase
      .from("beta_allowlist")
      .select("email, active, approved_at, source_application_id")
      .order("approved_at", { ascending: false });

    if (allowlistError) {
      console.error("Admin beta allowlist load failed", allowlistError);
      return NextResponse.json(
        { error: "Failed to load beta allowlist." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        items: applications || [],
        allowlist: allowlistRows || [],
        postingBetaRequired: settingsRow?.bool_value ?? true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin beta route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { supabase, user, error } = await assertAdmin();
    if (error || !user) return error!;

    const body = await req.json();

    if (typeof body.postingBetaRequired === "boolean") {
      const updatedAt = new Date().toISOString();

      const { error: settingsUpdateError } = await supabase
        .from("app_settings")
        .upsert(
          {
            setting_key: "posting_beta_required",
            bool_value: body.postingBetaRequired,
            updated_at: updatedAt,
            updated_by_user_id: user.id,
          },
          { onConflict: "setting_key" }
        );

      if (settingsUpdateError) {
        console.error("Admin beta settings update failed", settingsUpdateError);
        return NextResponse.json(
          { error: "Failed to update beta setting." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const applicationId = Number(body.applicationId);
    const status = String(body.status || "");
    const notes =
      typeof body.notes === "string" && body.notes.trim()
        ? body.notes.trim()
        : null;

    if (
      !Number.isFinite(applicationId) ||
      !["pending", "approved", "waitlisted", "rejected"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid beta application update." },
        { status: 400 }
      );
    }

    const { data: application, error: applicationError } = await supabase
      .from("beta_applications")
      .select("id, email, full_name")
      .eq("id", applicationId)
      .maybeSingle();

    if (applicationError || !application) {
      return NextResponse.json(
        { error: "Beta application not found." },
        { status: 404 }
      );
    }

    const reviewedAt = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("beta_applications")
      .update({
        status,
        notes,
        reviewed_at: reviewedAt,
        reviewed_by_user_id: user.id,
        updated_at: reviewedAt,
      })
      .eq("id", applicationId);

    if (updateError) {
      console.error("Admin beta application update failed", updateError);
      return NextResponse.json(
        { error: "Failed to update beta application." },
        { status: 500 }
      );
    }

    if (status === "approved") {
      const { error: allowlistUpsertError } = await supabase
        .from("beta_allowlist")
        .upsert(
          {
            email: application.email.toLowerCase(),
            source_application_id: applicationId,
            approved_by_user_id: user.id,
            approved_at: reviewedAt,
            updated_at: reviewedAt,
            active: true,
            notes,
          },
          { onConflict: "email_normalized" }
        );

      if (allowlistUpsertError) {
        console.error("Admin beta allowlist upsert failed", allowlistUpsertError);
        return NextResponse.json(
          { error: "Failed to approve beta access." },
          { status: 500 }
        );
      }

      const emailResult = await sendBetaApprovalEmail({
        to: application.email.toLowerCase(),
        fullName: application.full_name,
      });

      if (!emailResult.ok && !emailResult.skipped) {
        console.error("Admin beta approval email failed", emailResult.details);
      }

      return NextResponse.json(
        {
          ok: true,
          emailSent: emailResult.ok,
          emailSkipped: emailResult.skipped,
        },
        { status: 200 }
      );
    } else {
      const { error: allowlistDeactivateError } = await supabase
        .from("beta_allowlist")
        .update({
          active: false,
          updated_at: reviewedAt,
          notes,
        })
        .eq("email_normalized", application.email.toLowerCase());

      if (
        allowlistDeactivateError &&
        allowlistDeactivateError.code !== "PGRST116"
      ) {
        console.error(
          "Admin beta allowlist deactivate failed",
          allowlistDeactivateError
        );
        return NextResponse.json(
          { error: "Failed to update beta access state." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Admin beta patch unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
