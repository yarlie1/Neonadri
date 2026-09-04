import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import { buildPostPath } from "../../../../lib/postUrl";

const LAUNCH_REWARD_CLAIM_EMAIL = "hello@neonadri.net";

function buildRewardClaimMailto({
  userId,
  postId,
  postUrl,
  claimId,
}: {
  userId: string;
  postId: number;
  postUrl: string;
  claimId: number;
}) {
  const subject = "Neonadri $10 Launch Reward Claim";
  const body = [
    "Hi Neonadri,",
    "",
    "I posted my first meetup and would like to claim my $10 Launch Reward.",
    "",
    `Launch Reward claim ID: ${claimId}`,
    `Neonadri user ID: ${userId}`,
    `Post ID: ${postId}`,
    `Post URL: ${postUrl}`,
    "",
    "Optional - We'd love to hear what you think about Neonadri.",
    "What did you like, find confusing, or think we could improve?",
    "",
    "Feedback:",
  ].join("\n");

  return `mailto:${LAUNCH_REWARD_CLAIM_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const postId = Number(body?.postId);

    if (!Number.isFinite(postId)) {
      return NextResponse.json({ error: "Missing meetup." }, { status: 400 });
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: claimRows, error: claimError } = await supabase.rpc(
      "reserve_launch_reward_claim",
      {
        input_post_id: postId,
        input_claim_email: user.email || null,
      }
    );

    const claim = Array.isArray(claimRows) ? claimRows[0] : claimRows;

    if (claimError || !claim) {
      console.error("Launch reward claim failed", claimError);
      return NextResponse.json(
        { error: "Could not claim this Launch Reward right now." },
        { status: 500 }
      );
    }

    if (!claim.accepted) {
      const status = claim.reason === "full" ? 409 : 400;
      const error =
        claim.reason === "full"
          ? "All 100 Launch Reward spots are currently claimed. You can still post meetups, but this $10 Launch Reward is no longer accepting new campaign participants."
          : "This meetup is not eligible for a Launch Reward claim.";

      return NextResponse.json(
        {
          error,
          reason: claim.reason,
          activeClaimCount: claim.active_claim_count,
          maxClaims: claim.max_claims,
          isFull: claim.reason === "full",
        },
        { status }
      );
    }

    const { data: post } = await supabase
      .from("posts")
      .select("id, meeting_purpose, place_name, location")
      .eq("id", postId)
      .single();

    const origin = (process.env.APP_BASE_URL || new URL(req.url).origin).replace(/\/+$/, "");
    const postPath = post
      ? buildPostPath(post.id, post.meeting_purpose, post.place_name || post.location)
      : `/posts/${postId}`;
    const mailto = buildRewardClaimMailto({
      userId: user.id,
      postId,
      postUrl: `${origin}${postPath}`,
      claimId: Number(claim.claim_id),
    });

    return NextResponse.json(
      {
        accepted: true,
        reason: claim.reason,
        mailto,
        activeClaimCount: claim.active_claim_count,
        maxClaims: claim.max_claims,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Launch reward claim route unexpected error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}