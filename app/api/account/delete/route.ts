import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let error: { message?: string } | null = null;

    try {
      const adminSupabase = createAdminClient();
      const deleteResult = await adminSupabase.auth.admin.deleteUser(user.id, false);
      error = deleteResult.error;
    } catch (adminError) {
      console.warn("Delete account admin fallback engaged", adminError);
      const fallbackResult = await supabase.rpc("delete_my_account");
      error = fallbackResult.error;
    }

    if (error) {
      console.error("Delete account failed", error);
      return NextResponse.json(
        { error: "Could not delete account." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Delete account route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
