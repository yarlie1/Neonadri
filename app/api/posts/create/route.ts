import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";
import {
  ADULT_MEETUP_MUTATION_REQUIRED_MESSAGE,
  isAdultConfirmedUser,
} from "../../../../lib/adultGate";
import {
  isPostingAccessAllowedForEmail,
  POSTING_ACCESS_ERROR_MESSAGE,
} from "../../../../lib/postingAccess";
import { buildPostPath } from "../../../../lib/postUrl";
import { getLaunchRewardStatus } from "../../../../lib/launchReward";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isAdultConfirmedUser(supabase, user.id))) {
      return NextResponse.json(
        { error: ADULT_MEETUP_MUTATION_REQUIRED_MESSAGE },
        { status: 403 }
      );
    }

    const postingAccessAllowed = await isPostingAccessAllowedForEmail(
      supabase,
      user.email
    );

    if (!postingAccessAllowed) {
      return NextResponse.json(
        { error: POSTING_ACCESS_ERROR_MESSAGE },
        { status: 403 }
      );
    }

    if (body.campaign_code === "launch10") {
      const rewardStatus = await getLaunchRewardStatus();

      if (rewardStatus.isFull) {
        return NextResponse.json(
          {
            error: "All 100 Launch Reward spots are currently claimed. You can still create a regular meetup, but this $10 Launch Reward is no longer accepting new campaign participants.",
            reason: "launch_reward_full",
          },
          { status: 409 }
        );
      }
    }

    const payload = {
      user_id: user.id,
      place_name: body.place_name,
      location: body.location,
      meeting_time: body.meeting_time,
      duration_minutes: body.duration_minutes,
      target_gender: body.target_gender,
      target_age_group: body.target_age_group,
      meeting_purpose: body.meeting_purpose,
      benefit_amount: body.benefit_amount,
      latitude: body.latitude,
      longitude: body.longitude,
      campaign_code: body.campaign_code === "launch10" ? "launch10" : null,
    };

    const { data, error } = await supabase
      .from("posts")
      .insert(payload)
      .select();

    if (error) {
      console.error("Post create failed", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return NextResponse.json(
        { error: "Failed to create meetup." },
        { status: 500 }
      );
    }

    const createdPost = Array.isArray(data) ? data[0] : data;
    const postUrl = createdPost
      ? buildPostPath(
          createdPost.id,
          createdPost.meeting_purpose,
          createdPost.place_name || createdPost.location
        )
      : null;

    return NextResponse.json({ data, postUrl }, { status: 200 });
  } catch (e) {
    console.error("Post create route unexpected error", e);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
