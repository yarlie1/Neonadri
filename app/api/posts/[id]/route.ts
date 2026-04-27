import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

type RouteContext = {
  params: {
    id: string;
  };
};

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const postId = Number(params.id);
    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: "Invalid meetup." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .maybeSingle();

    if (postError || !postData) {
      return NextResponse.json({ error: "Meetup not found." }, { status: 404 });
    }

    if (postData.user_id !== user.id) {
      return NextResponse.json(
        { error: "Only the host can delete this meetup." },
        { status: 403 }
      );
    }

    const [{ count: requestCount, error: requestError }, { count: matchCount, error: matchError }] =
      await Promise.all([
        supabase
          .from("match_requests")
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId),
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId),
      ]);

    if (requestError || matchError) {
      console.error("Delete meetup dependency check failed", {
        requestError,
        matchError,
        postId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "We couldn't verify this meetup right now." },
        { status: 500 }
      );
    }

    if ((requestCount || 0) > 0 || (matchCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "This meetup already has requests or a match, so it can no longer be deleted. Cancel it instead.",
        },
        { status: 409 }
      );
    }

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Delete meetup failed", {
        message: deleteError.message,
        details: deleteError.details,
        hint: deleteError.hint,
        code: deleteError.code,
        postId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "We couldn't delete this meetup right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Delete meetup route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
