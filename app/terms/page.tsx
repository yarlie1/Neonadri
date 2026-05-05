import LegalPageShell from "../components/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Neonadri Terms of Service"
      intro='These Terms of Service ("Terms") govern your access to and use of Neonadri ("Neonadri," "we," "our," or "us"), an adults-only social meetup platform designed for calm, in-person social discovery. By using Neonadri, you agree to these Terms.'
      lastUpdated="2026-05-05"
      sections={[
        {
          title: "1. Eligibility",
          paragraphs: [
            "Neonadri is for adults 18 years of age or older only.",
            "By creating an account or using the service, you confirm that you are at least 18 years old, the information you provide is accurate, and you will use the service in compliance with all applicable laws.",
            "Neonadri is not a dating or matchmaking service.",
          ],
        },
        {
          title: "2. Account Responsibility",
          paragraphs: [
            "You are responsible for maintaining the confidentiality of your account and password, and for all activity that occurs under your account.",
          ],
          bullets: [
            "You may not share your account with others.",
            "You may not impersonate another person.",
            "You may not provide false or misleading identity information.",
          ],
        },
        {
          title: "3. Meetup Content and Conduct",
          paragraphs: [
            "You are solely responsible for any content you create, including profiles, meetup listings, messages, and reviews.",
            "Neonadri is intended for respectful, low-pressure social interaction.",
          ],
          bullets: [
            "Do not harass, threaten, stalk, or pressure another user.",
            "Do not engage in abusive, unsafe, or unlawful behavior.",
            "Do not post misleading or deceptive meetup details.",
            "Do not arrange or promote illegal activities.",
            "Do not evade blocks, moderation actions, or account restrictions.",
            "Do not create or pursue romantic, sexual, or financial expectations through the platform.",
          ],
        },
        {
          title: "4. Cost Support Rule",
          paragraphs: [
            "Any cost support shown on Neonadri may only refer to direct, shared meetup-related expenses, such as food, drinks, tickets, transportation, or similar activity costs.",
            "Cost support is not a payment to any individual.",
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
            "Users are expected to prioritize their own safety and may leave a meetup at any time.",
          ],
        },
        {
          title: "6. Matching, Messaging, and Availability",
          paragraphs: [
            "Neonadri facilitates discovery and coordination of meetups, but does not guarantee that a meetup will occur, that a user will attend, or that a match or request will remain available.",
            "Neonadri is not responsible for cancellations, no-shows, or unmet expectations related to any meetup.",
            "Users are responsible for their own expenses unless otherwise agreed between participants.",
          ],
        },
        {
          title: "7. Moderation and Enforcement",
          paragraphs: [
            "We may review, restrict, suspend, or remove content or accounts at our discretion in order to enforce these Terms, investigate unsafe or inappropriate behavior, comply with legal obligations, and protect users and the platform.",
          ],
        },
        {
          title: "8. Disclaimers and Limitation of Responsibility",
          paragraphs: [
            "Neonadri is provided on an as-is and as-available basis.",
            "To the fullest extent permitted by law, we disclaim all warranties, express or implied, including but not limited to availability or reliability of the service, accuracy of user-generated content, safety, identity, or intentions of any user, and outcomes of any meetup, interaction, or communication.",
            "Users interact at their own risk.",
            "Neonadri does not conduct background checks, does not verify user identity, and is not responsible for the behavior, actions, or conduct of any user.",
            "No romantic, financial, or other expectations are created or implied by the use of this platform.",
          ],
        },
        {
          title: "9. General",
          paragraphs: [
            "These Terms may be updated from time to time. Continued use of Neonadri after changes indicates your acceptance of the updated Terms.",
            "If you do not agree to these Terms, you must stop using the service.",
            "Neonadri is for adults 18+ only.",
          ],
        },
      ]}
    />
  );
}
