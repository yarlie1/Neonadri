import { NextResponse } from "next/server";
import { createClient } from "../../../../../../lib/supabase/server";

type RouteContext = {
  params: {
    id: string;
  };
};

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

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const postId = Number(params.id);

    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: "Invalid post id." }, { status: 400 });
    }

    const { supabase, user, error } = await assertAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const hidden = body.hidden === true;
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";

    const payload = hidden
      ? {
          admin_hidden: true,
          admin_hidden_at: new Date().toISOString(),
          admin_hidden_by: user!.id,
          admin_hidden_reason: reason || "Admin hidden",
        }
      : {
          admin_hidden: false,
          admin_hidden_at: null,
          admin_hidden_by: null,
          admin_hidden_reason: null,
        };

    const { data, error: updateError } = await supabase
      .from("posts")
      .update(payload)
      .eq("id", postId)
      .select("id, admin_hidden")
      .maybeSingle();

    if (updateError) {
      console.error("Admin post visibility update failed", updateError);
      return NextResponse.json(
        { error: "Failed to update meetup visibility." },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json({ error: "Meetup not found." }, { status: 404 });
    }

    return NextResponse.json({ post: data }, { status: 200 });
  } catch (error) {
    console.error("Admin post visibility route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
