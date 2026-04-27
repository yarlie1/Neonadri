import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { getPostingAccessStateForEmail } from "../../../../lib/postingAccess";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    const accessState = await getPostingAccessStateForEmail(supabase, email);

    return NextResponse.json(
      {
        allowed: accessState.postingAccessAllowed,
        postingBetaRequired: accessState.postingBetaRequired,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Beta email check failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
