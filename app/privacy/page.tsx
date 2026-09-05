import LegalPageShell from "../components/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Neonadri Privacy Policy"
      intro='This Privacy Policy explains how Neonadri, an independently operated social meetup service ("Neonadri," "we," "our," or "us"), collects, uses, shares, and retains information in connection with the service.'
      lastUpdated="September 15, 2026"
      sections={[
        {
          title: "1. Information We Collect",
          paragraphs: ["Depending on how you use Neonadri, we may collect:"],
          bullets: [
            "Account information, such as your email address and account identifiers.",
            "Profile information, such as display name, age group, languages, interests, meeting style, and other information you choose to provide.",
            "Meetup information, such as purpose, place name, location, time, duration, preferences, and cost support information.",
            "Messages, reviews, block events, reports, and safety-related submissions, where applicable.",
            "Moderation information related to reports, safety checks, account restrictions, suspected misuse, fraud, or abuse of the service.",
            "Technical and usage information, such as IP address, device or browser information, login activity, timestamps, and related technical or activity signals used for service operation, security, fraud prevention, and abuse detection.",
            "Promotion and reward information, such as reward claims, eligibility status, fulfillment status, related communications, and records reasonably necessary to administer promotions and prevent duplicate or fraudulent reward claims.",
            "Feedback and research information that you voluntarily choose to provide.",
          ],
        },
        {
          title: "2. Location Information",
          paragraphs: [
            "Neonadri may process place names, public location details, map selections, and location-related coordinates used to position meetups and show relevant results.",
            "Because meetups must take place in public locations, users should not submit private residences, hotel rooms, or isolated locations as meetup locations.",
            "Public views may reduce location precision before a meetup is confirmed.",
          ],
        },
        {
          title: "3. How We Use Information",
          paragraphs: ["We may use information to:"],
          bullets: [
            "create and manage accounts;",
            "display profiles, meetups, requests, matches, and related product flows;",
            "support ranking, discovery, and map placement;",
            "enable messages, requests, reviews, and related features;",
            "communicate with users about their accounts, meetups, or the service;",
            "contact users for optional product feedback or research where appropriate;",
            "administer promotions and reward programs;",
            "verify promotional eligibility;",
            "process and fulfill rewards;",
            "detect and prevent duplicate, fraudulent, automated, misleading, or abusive participation;",
            "investigate abuse, fraud, unsafe behavior, inappropriate cost support, and violations of our rules;",
            "maintain the security, integrity, and proper operation of Neonadri; and",
            "comply with applicable legal obligations.",
          ],
        },
        {
          title: "4. Safety, Fraud, and Cost Support Review",
          paragraphs: [
            "We may review meetup, message, profile, report, account, promotion, or related activity information where reasonably necessary to detect unsafe, fraudulent, abusive, or prohibited behavior.",
            "Technical or activity signals may be considered as part of an abuse or fraud review.",
            "A shared IP address or similar technical signal alone does not necessarily establish fraud or misuse.",
          ],
          bullets: [
            "attempts to offer money for attendance, time, companionship, romantic access, sexual access, or personal interaction;",
            "attempts to obtain multiple promotional rewards through duplicate or misleading accounts or submissions;",
            "impersonation of another person;",
            "misleading identity or meetup information;",
            "violations of public-location requirements;",
            "illegal activity; or",
            "misuse of Neonadri in violation of applicable Terms or rules.",
          ],
        },
        {
          title: "5. Promotions and Rewards",
          paragraphs: [
            "When you participate in a Neonadri promotion, we may process information reasonably necessary to receive and review your claim, determine eligibility, prevent duplicate or fraudulent participation, communicate with you about the promotion, deliver a reward, and maintain records reasonably necessary for administration, accounting, dispute resolution, fraud prevention, or legal compliance.",
            "Unless the rules of a particular promotion clearly state otherwise, participation in optional product feedback or research is voluntary.",
            "For the Neonadri $10 Launch Reward, providing feedback is optional and does not affect reward eligibility.",
          ],
        },
        {
          title: "6. Sharing Information",
          paragraphs: [
            "We may share information with service providers that help us operate Neonadri, such as providers supporting infrastructure, hosting, communications, security, analytics, mapping, or other operational functions.",
            "When necessary to deliver a promotional reward, we may share limited information, such as your name, email address, reward amount, and related fulfillment information, with a reward provider such as Tremendous.",
            "We may also share information when required by law or legal process, or where reasonably necessary to protect safety, rights, users, or platform integrity.",
            "We do not need to publicly expose all information we process. Some information is used internally for safety, moderation, fraud prevention, account operations, and enforcement.",
          ],
        },
        {
          title: "7. User Controls",
          bullets: [
            "Users may be able to update profile information.",
            "Users may be able to change their password.",
            "Users may be able to block other users.",
            "Users may be able to delete their account.",
            "Users may be able to report unsafe behavior, inappropriate payment requests, or other rule violations where reporting tools are available.",
            "Users may opt out of non-essential product feedback or research emails by contacting us.",
          ],
        },
        {
          title: "8. Retention",
          paragraphs: [
            "We retain information for as long as reasonably necessary to provide the service, protect the platform, investigate abuse, resolve disputes, administer promotions, prevent fraud, and comply with legal obligations.",
            "Some records may remain where retention is necessary for legal, security, moderation, fraud-prevention, accounting, dispute-resolution, or reward-administration reasons.",
          ],
        },
        {
          title: "9. Children",
          paragraphs: [
            "Neonadri is for adults 18+ only and is not intended for children.",
          ],
        },
        {
          title: "10. Changes and Contact",
          paragraphs: [
            "We may update this Privacy Policy from time to time. Where reasonably appropriate, updates will be reflected by changing the Last updated date or providing another appropriate notice.",
            "Questions about this Privacy Policy may be sent to hello@neonadri.net.",
          ],
        },
      ]}
    />
  );
}