import { createAdminClient } from "./supabase/admin";

export const LAUNCH_REWARD_CAMPAIGN_CODE = "launch10";
export const LAUNCH_REWARD_MAX_CLAIMS = 100;

export type LaunchRewardStatus = {
  activeClaimCount: number;
  maxClaims: number;
  isFull: boolean;
};

export async function getLaunchRewardStatus(): Promise<LaunchRewardStatus> {
  try {
    const admin = createAdminClient() as any;
    const { data, error } = await admin.rpc("launch_reward_active_claim_count");

    if (error) {
      console.error("Launch reward status lookup failed", error);
      return {
        activeClaimCount: 0,
        maxClaims: LAUNCH_REWARD_MAX_CLAIMS,
        isFull: false,
      };
    }

    const activeClaimCount = Number(data || 0);

    return {
      activeClaimCount,
      maxClaims: LAUNCH_REWARD_MAX_CLAIMS,
      isFull: activeClaimCount >= LAUNCH_REWARD_MAX_CLAIMS,
    };
  } catch (error) {
    console.error("Launch reward status lookup errored", error);
    return {
      activeClaimCount: 0,
      maxClaims: LAUNCH_REWARD_MAX_CLAIMS,
      isFull: false,
    };
  }
}