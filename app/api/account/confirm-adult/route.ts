import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

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

    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        is_adult_confirmed: true,
        age_gate_confirmed_at: new Date().toISOString(),
      },
    });

    if (error) {
      console.error("Adult confirmation update failed", {
        message: error.message,
        details: error,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "We couldn't update your age confirmation right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Adult confirmation route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
