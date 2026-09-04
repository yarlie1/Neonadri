import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import {
  getAdultGateRedirectPath,
  isAdultConfirmedUser,
} from "../../lib/adultGate";
import { getLaunchRewardStatus } from "../../lib/launchReward";
import WriteForm from "./WriteForm";

export default async function WritePage({
  searchParams,
}: {
  searchParams?: { submit?: string; campaign?: string };
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const campaign = searchParams?.campaign === "launch10" ? "launch10" : "";
  const writeParams = new URLSearchParams();
  if (searchParams?.submit === "1") writeParams.set("submit", "1");
  if (campaign) writeParams.set("campaign", campaign);
  const writePath = `/write${writeParams.toString() ? `?${writeParams.toString()}` : ""}`;

  if (campaign) {
    const rewardStatus = await getLaunchRewardStatus();

    if (rewardStatus.isFull) {
      return (
        <main className="min-h-screen bg-white px-5 py-11 text-[#111111] sm:py-14">
          <div className="mx-auto max-w-3xl">
            <div className="text-[13px] font-black uppercase tracking-[0.16em]">
              Launch Reward
            </div>
            <h1 className="mt-5 max-w-2xl text-[46px] font-black leading-[0.98] tracking-[-0.05em] sm:text-[64px]">
              All 100 Launch Reward spots are currently claimed.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-[#555555]">
              This campaign is no longer accepting new $10 Launch Reward participants. You can still create a regular meetup on Neonadri.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/write"
                style={{ color: "#ffffff" }}
                className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-[#111111] px-7 py-4 text-base font-black transition hover:bg-[#333333]"
              >
                Create a Regular Meetup
              </Link>
              <Link
                href="/reward"
                className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-white px-7 py-4 text-base font-black text-[#111111] transition hover:bg-[#f5f5f5]"
              >
                Back to Reward Page
              </Link>
            </div>
          </div>
        </main>
      );
    }
  }

  if (user && !(await isAdultConfirmedUser(supabase, user.id))) {
    redirect(getAdultGateRedirectPath(writePath));
  }

  return <WriteForm userId={user?.id ?? null} campaign={campaign} />;
}
