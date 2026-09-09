import Link from "next/link";

type RuleSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

const sections: RuleSection[] = [
  {
    title: "1. Sponsor",
    paragraphs: [
      "The Neonadri $10 Launch Reward (\"Promotion\") is offered and administered by the individual operator of Neonadri (\"Neonadri,\" \"Sponsor,\" \"we,\" \"our,\" or \"us\").",
      "Questions regarding the Promotion may be directed to Neonadri at hello@neonadri.net.",
    ],
  },
  {
    title: "2. Promotion Period",
    paragraphs: [
      "The Promotion begins on September 15, 2026 at 12:00 a.m. Pacific Time and ends when 100 eligible participants have been approved to receive the Launch Reward or at October 15, 2026 at 11:59 p.m. Pacific Time, whichever occurs first.",
    ],
  },
  {
    title: "3. Eligibility",
    paragraphs: ["To participate, you must:"],
    bullets: [
      "be 18 years of age or older;",
      "reside in the United States;",
      "have a valid Neonadri account; and",
      "comply with these Official Rules and Neonadri's applicable Terms of Service.",
      "Individuals involved in operating or administering Neonadri or this Promotion, and members of their immediate households, are not eligible to participate.",
      "No purchase or payment is necessary to participate.",
    ],
  },
  {
    title: "4. Los Angeles Meetup Requirement",
    paragraphs: [
      "The qualifying meetup must be intended to take place within Los Angeles County, California.",
      "Participants do not need to reside in Los Angeles County, provided they otherwise meet the eligibility requirements above.",
    ],
  },
  {
    title: "5. How to Participate",
    paragraphs: ["To participate:"],
    bullets: [
      "Create or sign in to your Neonadri account.",
      "Post your first qualifying meetup on Neonadri during the Promotion Period.",
      "After posting, use the reward claim button on your meetup page during the Promotion Period to reserve an available spot. Then send the claim email to hello@neonadri.net during the Promotion Period so Neonadri can review your eligibility.",
      "Posting a meetup alone does not reserve a spot. A successful reservation counts toward the 100-spot limit even if you have not yet sent the claim email. Reservations do not automatically expire. A reservation does not guarantee payment; a valid claim email and eligibility review are required.",
    ],
  },
  {
    title: "6. Qualifying Meetup",
    paragraphs: ["A qualifying meetup must:"],
    bullets: [
      "be the participant's first qualifying meetup posted on Neonadri;",
      "represent a genuine attempt to organize an in-person social meetup with another person;",
      "contain sufficient information for another user to reasonably understand the proposed activity; and",
      "comply with Neonadri's Terms of Service and applicable community rules.",
      "Examples may include coffee, dinner, hiking, museums, sports, or other lawful social activities.",
      "Spam, advertisements, commercial solicitations, duplicate posts, fake or misleading posts, abusive content, or posts created primarily to obtain multiple rewards are not eligible.",
    ],
  },
  {
    title: "7. One Reward Per Person",
    paragraphs: [
      "Limit one $10 Launch Reward per person and one per Neonadri account.",
      "Creating or using multiple accounts, email addresses, identities, or other methods for the purpose of obtaining more than one Launch Reward is prohibited and may result in disqualification.",
    ],
  },
  {
    title: "8. First 100 Eligible Participants",
    paragraphs: [
      "A total of 100 Launch Rewards are available.",
      "Available reward spots are reserved in the order successful reservations are recorded by Neonadri.",
      "Spot order is determined by the reservation timestamp recorded by Neonadri, not by when the claim email is received or the meetup is posted.",
      "If a claim is rejected as ineligible, its reservation no longer counts toward the 100-spot limit. A spot may become available for a new reservation while the Promotion remains open.",
      "Submitting a claim does not guarantee a reward until eligibility has been verified.",
    ],
  },
  {
    title: "9. Reward",
    paragraphs: [
      "Each approved participant will receive one $10 digital reward.",
      "Rewards will be delivered electronically to the email address associated with the participant's valid reward claim or Neonadri account.",
      "Neonadri may use a third-party reward provider, such as Tango, to fulfill rewards. Redemption options may be subject to the reward provider's applicable terms and availability.",
      "Rewards are generally expected to be sent within 3-5 business days after eligibility is verified.",
      "No participant will be required to pay Neonadri a fee to receive the $10 Launch Reward.",
    ],
  },
  {
    title: "10. Verification and Abuse Prevention",
    paragraphs: [
      "Neonadri may review account information, submission information, and technical or activity signals reasonably necessary to verify eligibility and detect duplicate, fraudulent, automated, or abusive participation, consistent with Neonadri's Privacy Policy.",
      "A shared IP address or similar technical signal alone will not automatically make a participant ineligible.",
      "Neonadri may request reasonable additional information when necessary to verify eligibility or investigate suspected abuse.",
    ],
  },
  {
    title: "11. Optional Feedback",
    paragraphs: [
      "Participants may voluntarily provide feedback about their experience with Neonadri.",
      "Providing feedback is completely optional and does not affect eligibility for the Launch Reward.",
      "Positive feedback is not required or preferred. Participants are welcome to provide positive, negative, or neutral feedback.",
      "Unless separately agreed, feedback submitted as part of this Promotion is intended for product improvement and will not automatically be treated as permission for Neonadri to use the participant's name, likeness, or comments in advertising or promotional materials.",
    ],
  },
  {
    title: "12. Reward Availability",
    paragraphs: [
      "The Promotion is limited to 100 eligible reward recipients.",
      "Displayed availability counts reserved claims, including reservations without a claim email, approved claims, and rewards already sent. Rejected claims are excluded. These counts reflect occupied spots, not final eligibility determinations.",
      "When all 100 spots are occupied, new reservations are blocked. Existing reservations do not automatically expire, and participants may still send their claim email during the Promotion Period. Final approval remains subject to these Official Rules.",
    ],
  },
  {
    title: "13. Fraud, Technical Problems, and Modification",
    paragraphs: [
      "Neonadri reserves the right to suspend, modify, or terminate the Promotion if fraud, abuse, technical failures, or circumstances beyond Neonadri's reasonable control materially affect the integrity or proper operation of the Promotion.",
      "Any suspension, modification, or termination will not affect a reward already earned by an eligible participant before the effective time of the change, except where reasonably necessary to address fraud, abuse, error, or legal requirements.",
      "Neonadri will not modify these Official Rules for the purpose of avoiding payment of a valid reward that has already been earned.",
    ],
  },
  {
    title: "14. Disqualification",
    paragraphs: ["Neonadri may disqualify a participant who:"],
    bullets: [
      "violates these Official Rules;",
      "submits false or misleading information;",
      "attempts to obtain multiple rewards;",
      "uses automated or fraudulent methods to participate;",
      "manipulates or interferes with the Promotion; or",
      "otherwise engages in conduct reasonably determined to constitute fraud or abuse.",
      "Eligibility decisions will be made reasonably and in good faith based on the information available to Neonadri.",
    ],
  },
  {
    title: "15. Third-Party Platforms",
    paragraphs: [
      "This Promotion is offered solely by Neonadri.",
      "To the extent permitted by applicable law, each participant releases Reddit from liability related to this Promotion.",
      "It is not sponsored, endorsed, administered by, or associated with Reddit, Nextdoor, Meta, Instagram, Facebook, or any other third-party platform on which the Promotion may be advertised or discussed.",
      "Any questions regarding the Promotion should be directed to Neonadri, not to those platforms.",
    ],
  },
  {
    title: "16. Privacy",
    paragraphs: [
      "Information collected in connection with the Promotion will be handled in accordance with the Neonadri Privacy Policy.",
      "Information reasonably necessary to administer the Promotion, verify eligibility, prevent fraud, and fulfill rewards may be processed by Neonadri and its service providers.",
    ],
  },
  {
    title: "17. Questions",
    paragraphs: [
      "Questions regarding the Neonadri $10 Launch Reward may be sent to hello@neonadri.net.",
      "By participating in the Promotion, participants agree to these Official Rules.",
    ],
  },
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
          Post a Meetup. Get $10. First 100 eligible participants.
        </p>

        <p className="mt-3 text-sm font-semibold leading-6 text-[#555555]">
          Last updated: September 9, 2026
        </p>

        <div className="mt-8 divide-y divide-[#111111] border-y border-[#111111]">
          {sections.map((section) => (
            <section key={section.title} className="grid gap-3 py-5 sm:grid-cols-[56px_1fr] sm:gap-5">
              <div className="text-[24px] font-black leading-none tracking-[-0.04em]">
                {section.title.split(".")[0]}
              </div>
              <div className="space-y-3">
                <h2 className="text-xl font-black tracking-[-0.03em] text-[#111111]">
                  {section.title.replace(/^\d+\.\s*/, "")}
                </h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="text-base font-semibold leading-7 text-[#333333]">
                    {paragraph}
                  </p>
                ))}
                {section.bullets?.length ? (
                  <ul className="list-disc space-y-2 pl-5 text-base font-semibold leading-7 text-[#333333]">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}