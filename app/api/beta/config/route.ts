import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { isPostingBetaRequired } from "../../../../lib/postingAccess";

export async function GET() {
  let postingBetaRequired = true;

  try {
    const supabase = await createClient();
    postingBetaRequired = await isPostingBetaRequired(supabase);
  } catch (error) {
    console.error("Beta config route unexpected error", error);
  }

  return NextResponse.json({ postingBetaRequired }, { status: 200 });
}
