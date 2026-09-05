import LegalPageShell from "../components/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Neonadri Terms of Service"
      intro='These Terms of Service ("Terms") govern your access to and use of Neonadri ("Neonadri"), an adults-only social meetup service operated by an individual owner ("we," "our," or "us"). By accessing or using Neonadri, you agree to these Terms.'
      lastUpdated="September 15, 2026"
      sections={[
        {
          title: "1. Eligibility",
          paragraphs: [
            "Neonadri is for adults 18 years of age or older only.",
            "By creating an account or using the service, you confirm that you are at least 18 years old, the information you provide is accurate, and you will use the service in compliance with applicable laws and these Terms.",
            "Neonadri is not a dating or matchmaking service.",
          ],
        },
        {
          title: "2. Account Responsibility",
          paragraphs: [
            "You are responsible for maintaining the confidentiality of your account and password and for activity occurring under your account.",
          ],
          bullets: [
            "You may not share your account with others.",
            "You may not impersonate another person.",
            "You may not provide false or misleading identity information.",
            "You may not create or use multiple accounts to evade restrictions, abuse promotions, or obtain benefits for which you are not eligible.",
          ],
        },
        {
          title: "3. Meetup Content and Conduct",
          paragraphs: [
            "You are responsible for content you create, including profiles, meetup listings, messages, and reviews.",
            "Neonadri is intended for respectful, low-pressure social interaction.",
          ],
          bullets: [
            "You may not harass, threaten, stalk, or pressure another user.",
            "You may not engage in abusive, unsafe, fraudulent, deceptive, or unlawful behavior.",
            "You may not post misleading or deceptive meetup details.",
            "You may not arrange or promote illegal activities.",
            "You may not evade blocks, moderation actions, or account restrictions.",
            "You may not create or pursue romantic, sexual, or prohibited financial expectations through the platform.",
            "You may not use Neonadri primarily for advertising, commercial solicitation, spam, or fraudulent activity.",
          ],
        },
        {
          title: "4. Cost Support Rule",
          paragraphs: [
            "Any cost support shown on Neonadri may only refer to direct, shared meetup-related expenses, such as food, drinks, tickets, transportation, or similar activity costs.",
            "Cost support is not a payment to any individual.",
            "Promotional rewards, credits, or incentives offered directly by Neonadri are separate from meetup cost support and may be subject to separate promotional terms or Official Rules.",
            "A promotional reward offered directly by Neonadri is not a payment by one user to another for attendance, time, companionship, personal interaction, or participation in a meetup.",
          ],
          bullets: [
            "Cost support may not be used for attendance.",
            "Cost support may not be used for time or companionship.",
            "Cost support may not be used for personal, romantic, or sexual access.",
          ],
        },
        {
          title: "5. Location and Safety",
          paragraphs: [
            "All meetups must take place in public locations.",
            "Private residences, hotel rooms, or isolated locations are not permitted.",
            "To reduce safety risk, Neonadri may limit how precisely location details are displayed before a meetup is confirmed.",
            "Users are responsible for exercising reasonable judgment regarding their personal safety and may leave a meetup at any time.",
          ],
        },
        {
          title: "6. Matching, Messaging, and Availability",
          paragraphs: [
            "Neonadri facilitates discovery and coordination of meetups but does not guarantee that a meetup will occur, that another user will attend, that a user is who they claim to be, or that a match, request, listing, or other opportunity will remain available.",
            "Neonadri is not responsible for cancellations, no-shows, or unmet expectations related to a meetup.",
            "Users are responsible for their own expenses unless otherwise agreed between participants in a manner permitted by these Terms.",
          ],
        },
        {
          title: "7. Promotions and Rewards",
          paragraphs: [
            "From time to time, Neonadri may offer promotions, rewards, credits, referral programs, beta programs, or other incentives.",
            "A promotion may be subject to separate eligibility requirements, Official Rules, promotional terms, time limits, geographic restrictions, or participation limits.",
            "Participation in a promotion is subject to the rules applicable to that promotion.",
            "If specific promotional terms or Official Rules conflict with these Terms solely with respect to that promotion, the specific promotional terms or Official Rules will govern the promotion.",
            "Neonadri may use third-party service providers to administer or fulfill promotional rewards.",
            "Fraudulent, duplicate, automated, misleading, or abusive participation in a promotion is prohibited.",
          ],
        },
        {
          title: "8. Moderation and Enforcement",
          paragraphs: [
            "Neonadri may review, restrict, suspend, or remove content or accounts where reasonably appropriate to enforce these Terms or applicable promotional rules, investigate unsafe, fraudulent, abusive, or inappropriate behavior, prevent misuse of Neonadri or its promotions, comply with legal obligations, or protect users and the service.",
            "Neonadri may also disqualify a user from a promotion where reasonably necessary under the rules applicable to that promotion.",
          ],
        },
        {
          title: "9. Disclaimers and Limitation of Responsibility",
          paragraphs: [
            "Neonadri is provided on an as-is and as-available basis.",
            "To the fullest extent permitted by applicable law, Neonadri disclaims warranties, express or implied, regarding availability or reliability of the service, accuracy of user-generated content, identity, safety, or intentions of any user, and outcomes of any meetup, interaction, or communication.",
            "Users interact with other users at their own discretion and risk.",
            "Unless expressly stated otherwise for a particular feature, Neonadri does not conduct background checks or independently verify user identities.",
            "Neonadri does not control and is not responsible for the conduct of users outside the service.",
            "No romantic, financial, or other expectations are created or implied merely by use of Neonadri.",
            "Nothing in these Terms excludes or limits liability that cannot lawfully be excluded or limited under applicable law.",
          ],
        },
        {
          title: "10. Changes to the Service or Terms",
          paragraphs: [
            "Neonadri may update or change the service and these Terms from time to time.",
            "Where reasonably appropriate, material changes to these Terms will be reflected by updating the Last updated date or through another appropriate notice.",
            "Continued use of Neonadri after updated Terms become effective constitutes acceptance of the updated Terms to the extent permitted by applicable law.",
            "Changes to these Terms do not eliminate promotional rewards already earned under applicable Official Rules, except where reasonably necessary to address fraud, error, abuse, or legal requirements.",
            "If you do not agree to these Terms, you must stop using Neonadri.",
          ],
        },
        {
          title: "11. Contact",
          paragraphs: [
            "Questions regarding these Terms may be sent to Neonadri at hello@neonadri.net.",
            "Neonadri is for adults 18+ only.",
          ],
        },
      ]}
    />
  );
}