import { NextResponse } from "next/server";
import { getLaunchRewardStatus } from "../../../../lib/launchReward";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getLaunchRewardStatus();

  return NextResponse.json(status, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}