import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: blockedRows, error } = await supabase
      .from("blocked_users")
      .select("blocked_user_id, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Blocked users load failed", error);
      return NextResponse.json({ error: "Failed to load blocked users." }, { status: 500 });
    }

    const blockedIds = (blockedRows || []).map((row) => row.blocked_user_id);
    let profileMap = new Map<string, string>();

    if (blockedIds.length > 0) {
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", blockedIds);

      profileMap = new Map(
        ((profilesData || []) as Array<{ id: string; display_name: string | null }>).map(
          (profile) => [profile.id, profile.display_name || "Unknown"]
        )
      );
    }

    return NextResponse.json({
      items: (blockedRows || []).map((row) => ({
        blockedUserId: row.blocked_user_id,
        displayName: profileMap.get(row.blocked_user_id) || "Unknown",
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Blocked users route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const blockedUserId = String(body.blockedUserId || "");

    if (!blockedUserId || blockedUserId === user.id) {
      return NextResponse.json({ error: "Invalid block request." }, { status: 400 });
    }

    const { error } = await supabase.from("blocked_users").insert({
      user_id: user.id,
      blocked_user_id: blockedUserId,
    });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ ok: true }, { status: 200 });
      }

      console.error("Blocked user create failed", error);
      return NextResponse.json({ error: "Failed to block user." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Block create route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const blockedUserId = String(body.blockedUserId || "");

    if (!blockedUserId) {
      return NextResponse.json({ error: "Missing blocked user." }, { status: 400 });
    }

    const { error } = await supabase
      .from("blocked_users")
      .delete()
      .eq("user_id", user.id)
      .eq("blocked_user_id", blockedUserId);

    if (error) {
      console.error("Blocked user delete failed", error);
      return NextResponse.json({ error: "Failed to unblock user." }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Block delete route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
