import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

const VISITOR_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizePath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return "/";
  }

  return value.slice(0, 240);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const visitorId =
      typeof body.visitorId === "string" && VISITOR_ID_PATTERN.test(body.visitorId)
        ? body.visitorId
        : null;

    if (!visitorId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("site_visits").insert({
      visitor_id: visitorId,
      user_id: user?.id ?? null,
      path: normalizePath(body.path),
    });

    if (error) {
      console.error("Site visit track failed", error);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("Site visit route failed", error);
    return NextResponse.json({ ok: true }, { status: 200 });
  }
}
