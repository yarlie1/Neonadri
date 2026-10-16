import Link from "next/link";
import HostRewardPanel from "./HostRewardPanel";

export const metadata = {
  title: "$100 Host Reward",
  description: "Host a meetup in LA County, complete both reviews, and share your honest experience. First 10 eligible hosts get $100.",
};

const steps = [
  { title: "Host a Meetup", body: "Post on Neonadri, accept a guest, and meet in person in a public place in LA County." },
  { title: "Complete Both Reviews", body: "You and your guest each leave a review and truthfully confirm that the other person attended." },
  { title: "Share & Claim $100", body: "Share your honest experience on Discussion using the reward form. Your post and claim are submitted together." },
];

const questions = [
  ["Who can participate?", "Hosts only. You must be a U.S. resident age 18+ and host a qualifying meetup in Los Angeles County. One $100 reward per person."],
  ["How are the first 10 chosen?", "Complete claims are reviewed in submission order. Up to 10 pending or approved spots are held at once. A pending claim does not guarantee a reward; declined or withdrawn claims reopen a spot while the event is open."],
  ["When will I receive the reward?", "We review claims within 7 business days and send approved $100 digital rewards through Tango within 7 business days of approval. Business days exclude weekends and U.S. federal holidays. Track your claim in your Dashboard."],
  ["Does my experience need to be positive?", "No. Honest criticism is welcome. Ratings and opinions do not affect eligibility. Your public experience will include a reward-program disclosure. Photos and your guest’s name are not required."],
  ["What if I delete my experience?", "Deleting it before approval withdraws your pending claim. There is no required posting-retention period after approval."],
];

const primary = "inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-[#111111] px-7 py-4 text-base font-black transition hover:bg-[#333333]";
const secondary = "inline-flex items-center justify-center rounded-[10px] border border-[#111111] bg-white px-7 py-4 text-base font-black transition hover:bg-[#f5f5f5]";

export default function HostRewardPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-11 text-[#111111] sm:py-14">
      <div className="mx-auto max-w-3xl">
        <p className="text-[13px] font-black uppercase tracking-[0.16em]">Los Angeles Host Reward</p>
        <h1 className="mt-5 text-[44px] font-black leading-[0.98] tracking-[-0.03em] sm:text-[82px] sm:leading-[0.94] sm:tracking-[-0.05em]">
          <span className="block">Host a Meetup.</span>
          <span className="block">Get $100.</span>
        </h1>
        <p className="mt-6 text-[22px] font-bold leading-[1.35] text-[#333333]">Meet in person. Share your honest experience.</p>
        <p className="mt-3 max-w-2xl text-lg font-semibold leading-8 text-[#555555]">Complete a meetup, finish both participant reviews, and post your experience on Discussion to claim your reward.</p>

        <div className="mt-7 grid grid-cols-3 divide-x divide-[#cccccc] border-y border-[#111111] py-5">
          {[["10 hosts", "First eligible claims"], ["$100", "Per approved host"], ["Oct 20–Nov 30", "2026 · Pacific Time"]].map(([value, label]) => (
            <div key={value} className="px-2 first:pl-0 last:pr-0 sm:px-5">
              <p className="text-base font-black sm:text-xl">{value}</p>
              <p className="mt-1 text-xs font-medium leading-5 text-[#555555] sm:text-sm">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/write" className={primary} style={{ color: "#ffffff" }}>Post a Meetup</Link>
          <a href="#host-reward-claim" className={secondary}>Check My Eligibility</a>
        </div>

        <section className="mt-14 border-t border-[#111111] pt-9">
          <h2 className="text-[32px] font-black tracking-[-0.04em]">How It Works</h2>
          <div className="mt-5 divide-y divide-[#111111] border-y border-[#111111]">
            {steps.map((step, index) => (
              <div key={step.title} className="grid grid-cols-[40px_1fr] gap-4 py-6 sm:grid-cols-[72px_1fr] sm:gap-6">
                <div className="text-[40px] font-black leading-none tracking-[-0.05em]">{index + 1}</div>
                <div>
                  <h3 className="text-[24px] font-black tracking-[-0.04em] sm:text-[26px]">{step.title}</h3>
                  <p className="mt-2 text-base font-semibold leading-7 text-[#555555]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-[#555555]">Both reviews must answer Yes to “Did your match show up?” Positive ratings or feedback are never required.</p>
        </section>

        <section className="mt-8 border border-[#111111] p-6">
          <p className="text-[11px] font-black uppercase tracking-[0.16em]">Two rewards. One meetup.</p>
          <h2 className="mt-2 text-[28px] font-black tracking-[-0.04em]">Earn up to $110.</h2>
          <p className="mt-2 text-base font-semibold leading-7 text-[#555555]">You can combine this $100 reward with the $10 Launch Reward when you meet both events’ requirements.</p>
          <Link href="/reward" className="mt-3 inline-block text-sm font-bold underline underline-offset-4">See the $10 Launch Reward →</Link>
        </section>

        <div className="mt-8"><HostRewardPanel /></div>

        <section className="mt-10">
          <h2 className="text-[28px] font-black tracking-[-0.04em]">A Few Details</h2>
          <div className="mt-4 divide-y divide-[#cccccc] border-y border-[#cccccc]">
            {questions.map(([question, answer]) => (
              <details key={question} className="group py-4">
                <summary className="cursor-pointer text-base font-bold">{question}</summary>
                <p className="mt-3 text-sm leading-7 text-[#555555]">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-[#cccccc] bg-[#fafafa] p-5 text-sm leading-6 text-[#555555]">
          <p className="font-semibold">U.S. residents 18+ · LA County meetups · Hosts only · No purchase necessary.</p>
          <p className="mt-3">October 20, 2026 at 12:00 a.m.–November 30, 2026 at 11:59 p.m. Pacific Time, or earlier if all 10 rewards are approved. The meetup, both reviews, experience post and claim must be completed during this period.</p>
          <p className="mt-3">Agreed activity costs are separate. Prioritize your safety; never continue an uncomfortable meetup to earn a reward.</p>
          <Link href="/host-reward/rules" className="mt-3 inline-block font-bold text-[#111111] underline underline-offset-4">Read the Official Rules →</Link>
        </section>
        <div className="mt-8"><Link href="/write" className={primary + " w-full sm:w-auto"} style={{ color: "#ffffff" }}>Post a Meetup</Link></div>
      </div>
    </main>
  );
}
