export const LAUNCH_REWARD_CAMPAIGN_CODE = "launch10";
export const LAUNCH_REWARD_MAX_CLAIMS = 100;

export function buildLaunchRewardStatus(activeClaimCount: number, finalizedClaimCount: number) {
  const remaining = Math.max(0, LAUNCH_REWARD_MAX_CLAIMS - activeClaimCount);
  const isFinalized = finalizedClaimCount >= LAUNCH_REWARD_MAX_CLAIMS;
  const isFull = activeClaimCount >= LAUNCH_REWARD_MAX_CLAIMS || isFinalized;
  const displayMessage = isFinalized
    ? "All 100 Launch Rewards Have Been Claimed!"
    : isFull
      ? "All 100 Launch Reward spots are currently claimed."
      : activeClaimCount >= 90
        ? `Only ${remaining} ${remaining === 1 ? "reward" : "rewards"} left!`
        : activeClaimCount >= 70
          ? "Over 70 rewards claimed — limited spots remaining."
          : "First 100 eligible participants.";
  return { activeClaimCount, finalizedClaimCount, maxClaims: LAUNCH_REWARD_MAX_CLAIMS,
    remaining, isFull, isFinalized, displayMessage };
}

export type LaunchRewardStatus = ReturnType<typeof buildLaunchRewardStatus>;
