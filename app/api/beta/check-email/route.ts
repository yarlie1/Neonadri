import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

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

    const { data, error } = await supabase.rpc("is_beta_email_allowed", {
      check_email: email,
    });

    if (error) {
      console.error("Beta email check failed", error);
      return NextResponse.json(
        { error: "Could not check beta access right now." },
        { status: 500 }
      );
    }

    return NextResponse.json({ allowed: !!data }, { status: 200 });
  } catch (error) {
    console.error("Beta check route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
