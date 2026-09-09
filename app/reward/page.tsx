import Link from "next/link";
import { getLaunchRewardStatus } from "../../lib/launchReward";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const campaignWriteHref = "/write?campaign=launch10";
const regularWriteHref = "/write";

const steps = [
  {
    title: "Post a Meetup",
    body: "Sign up and create your first qualifying meetup in Los Angeles.",
  },
  {
    title: "Claim Your $10",
    body: "After posting, use the claim button to reserve an available spot, then send the claim email for eligibility review.",
  },
  {
    title: "Get Your $10",
    body: "Once we verify your post, we'll send your $10 digital reward through Tango.",
  },
];

export default async function RewardPage() {
  const rewardStatus = await getLaunchRewardStatus();

  if (rewardStatus.isFull) {
    return (
      <main className="min-h-screen bg-white px-5 py-11 text-[#111111] sm:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="text-[13px] font-black uppercase tracking-[0.16em]">
            Los Angeles Launch Campaign
          </div>

          <h1 className="mt-5 max-w-2xl text-[42px] font-black leading-[0.98] tracking-[-0.03em] sm:text-[76px]">
            {rewardStatus.displayMessage}
          </h1>

          <p className="mt-6 max-w-2xl text-[22px] font-bold leading-[1.35] text-[#333333]">
            Thank you for helping launch the Neonadri community.
          </p>

          <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-[#555555]">
            The $10 Launch Reward is no longer accepting new campaign participants. You can still post a meetup and meet someone new.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={regularWriteHref}
              style={{ color: "#ffffff" }}
              className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-[#111111] px-7 py-4 text-base font-black transition hover:bg-[#333333]"
            >
              Post a Meetup
            </Link>

            <Link
              href="/reward/rules"
              className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-white px-7 py-4 text-base font-black text-[#111111] transition hover:bg-[#f5f5f5]"
            >
              Official Rules
            </Link>
          </div>

          <section className="mt-16 border-y border-[#111111] py-6">
            <p className="text-base font-semibold leading-7 text-[#555555]">
              {rewardStatus.isFinalized ? "All 100 rewards have been approved. Thank you for participating." : "If a reserved claim is rejected during review, a spot may become available again."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-5 py-11 text-[#111111] sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="text-[13px] font-black uppercase tracking-[0.16em]">
          Los Angeles Launch Campaign
        </div>

        <h1 className="mt-5 max-w-2xl text-[44px] font-black leading-[0.98] tracking-[-0.03em] sm:text-[82px] sm:leading-[0.94] sm:tracking-[-0.05em]">
          <span className="block whitespace-nowrap">Post a Meetup.</span>
          <span className="block whitespace-nowrap">Get $10.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-[22px] font-bold leading-[1.35] text-[#333333]">
          Help launch small social meetups in Los Angeles.
        </p>

        <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-[#555555]">
          Post your first qualifying meetup in Los Angeles County and claim a $10 digital reward through Tango after eligibility review.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={campaignWriteHref}
            style={{ color: "#ffffff" }}
            className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-[#111111] px-7 py-4 text-base font-black transition hover:bg-[#333333]"
          >
            Post a Meetup & Get $10
          </Link>

          <Link
            href="/reward/rules"
            className="inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-white px-7 py-4 text-base font-black text-[#111111] transition hover:bg-[#f5f5f5]"
          >
            Official Rules
          </Link>
        </div>

        <section className="mt-16 border-t border-[#111111] pt-10">
          <h2 className="text-[32px] font-black tracking-[-0.04em]">How It Works</h2>

          <div className="mt-5 divide-y divide-[#111111] border-y border-[#111111]">
            {steps.map((step, index) => (
              <div key={step.title} className="grid gap-3 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                <div className="text-[40px] font-black leading-none tracking-[-0.05em]">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-[26px] font-black tracking-[-0.04em]">{step.title}</h3>
                  <p className="mt-2 text-base font-semibold leading-7 text-[#555555]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-[#111111] p-6">
          <h2 className="text-[26px] font-black tracking-[-0.04em]">Meetup ideas</h2>
          <p className="mt-3 text-base font-semibold leading-7 text-[#555555]">
            Coffee. Dinner. Hiking. Museums. Activities.
          </p>
        </section>

        <section className="mt-5 border border-[#111111] p-6">
          <p className="text-base font-semibold leading-7 text-[#555555]">
            {rewardStatus.displayMessage} U.S. residents 18+ only. One reward per person. No purchase necessary. Terms apply.
          </p>
          <p className="mt-3 text-base font-semibold leading-7 text-[#555555]">
            Starts September 15, 2026 at 12:00 a.m. Pacific Time. Ends October 15, 2026 at 11:59 p.m. Pacific Time, or earlier if all 100 rewards are approved. Qualifying posts and claim emails must be submitted during this period.
          </p>
          <p className="mt-3 text-base font-semibold leading-7 text-[#555555]">
            Spots are allocated in reservation order, up to 100 eligible participants. A reserved spot counts even before the claim email is sent and does not automatically expire. Email your claim during the promotion period for review; a reservation does not guarantee a reward.
          </p>
          <p className="mt-3 text-base font-semibold leading-7 text-[#555555]">
            Feedback is completely optional and does not affect your eligibility for the reward.
          </p>
        </section>

        <div className="mt-8">
          <Link
            href={campaignWriteHref}
            style={{ color: "#ffffff" }}
            className="inline-flex w-full items-center justify-center rounded-[10px] border border-[#111111] bg-[#111111] px-7 py-4 text-base font-black transition hover:bg-[#333333] sm:w-auto"
          >
            Post a Meetup & Get $10
          </Link>
        </div>
      </div>
    </main>
  );
}
