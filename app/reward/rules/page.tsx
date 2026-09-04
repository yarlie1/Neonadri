import Link from "next/link";

const rules = [
  "Participants must be 18 years of age or older.",
  "This promotion is intended for Los Angeles-area participants.",
  "Limit one Launch Reward per person and one Launch Reward per account.",
  "The meetup must be the participant's first qualifying meetup on Neonadri.",
  "A qualifying meetup must be a normal post intended for a real in-person meetup with another person.",
  "Spam, advertisements, duplicate posts, fake posts, abusive content, and misleading claims are not eligible.",
  "Participants must submit a valid reward claim email to hello@neonadri.net after posting their qualifying meetup.",
  "Rewards are available to the first 100 eligible participants who submit a valid reward claim after posting a qualifying meetup.",
  "Claim order is based on the time Neonadri receives the reward claim email, not the time the meetup was posted.",
  "Neonadri may review account, email, claim email, post content, IP, device, and related activity patterns to help prevent abuse.",
  "Shared IP address or device signals do not automatically make a participant ineligible, but suspicious or duplicate activity may require review.",
  "Feedback is completely optional and does not affect reward eligibility.",
  "Approved rewards are expected to be delivered through Tremendous.",
  "This promotion is not sponsored, endorsed, administered by, or associated with Reddit, Nextdoor, or any other third-party platform where this promotion may appear.",
  "Neonadri may end, pause, or update this campaign if the reward spots are filled, abuse is detected, or operational issues require it.",
];

export default function RewardRulesPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-11 text-[#111111] sm:py-14">
      <div className="mx-auto max-w-3xl">
        <Link href="/reward" className="text-base font-black text-[#111111] underline underline-offset-4">
          Back to Launch Reward
        </Link>

        <div className="mt-8 text-[13px] font-black uppercase tracking-[0.16em]">
          Official Rules
        </div>

        <h1 className="mt-5 max-w-2xl text-[48px] font-black leading-[0.98] tracking-[-0.05em] sm:text-[70px]">
          Neonadri $10 Launch Reward
        </h1>

        <p className="mt-6 text-lg font-semibold leading-8 text-[#555555]">
          Post a Meetup. Get $10. First 100 eligible participants in Los Angeles.
        </p>

        <div className="mt-8 divide-y divide-[#111111] border-y border-[#111111]">
          {rules.map((rule, index) => (
            <div key={rule} className="grid gap-3 py-5 sm:grid-cols-[48px_1fr] sm:gap-5">
              <div className="text-[24px] font-black leading-none tracking-[-0.04em]">
                {index + 1}
              </div>
              <p className="text-base font-semibold leading-7 text-[#333333]">{rule}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 border border-[#111111] p-5 text-base font-semibold leading-7 text-[#555555]">
          This page is an operational campaign rules draft and should be reviewed before paid advertising begins.
        </p>
      </div>
    </main>
  );
}
