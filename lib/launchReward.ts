import { createAdminClient } from "./supabase/admin";
import { buildLaunchRewardStatus, LAUNCH_REWARD_CAMPAIGN_CODE, type LaunchRewardStatus } from "./launchRewardStatus";
export { LAUNCH_REWARD_CAMPAIGN_CODE, LAUNCH_REWARD_MAX_CLAIMS } from "./launchRewardStatus";
export type { LaunchRewardStatus } from "./launchRewardStatus";

export async function getLaunchRewardStatus(): Promise<LaunchRewardStatus> {
  try {
    // Read both counts from one snapshot. The reservation RPC caps active rows at 100.
    const admin = createAdminClient() as any;
    const { data, error } = await admin.from("launch_reward_claims")
      .select("status")
      .eq("campaign_code", LAUNCH_REWARD_CAMPAIGN_CODE)
      .in("status", ["reserved", "approved", "reward_sent"]);
    if (error || !data) throw error || new Error("Missing reward status");
    return buildLaunchRewardStatus(data.length,
      data.filter((claim: { status: string }) => claim.status === "approved" || claim.status === "reward_sent").length);
  } catch (error) {
    console.error("Launch reward status lookup failed", error);
    // Do not advertise a fabricated remaining count if the lookup fails.
    return { ...buildLaunchRewardStatus(0, 0), isFull: true,
      displayMessage: "Reward availability is temporarily unavailable. Please try again later." };
  }
}
