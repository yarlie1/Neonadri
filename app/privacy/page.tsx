import LegalPageShell from "../components/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This page explains the kinds of information Neonadri uses to run the service, support adults-only social meetup flows, reduce abuse, and manage account safety."
      lastUpdated="2026-05-05"
      sections={[
        {
          title: "1. Information we collect",
          bullets: [
            "Account information such as email address.",
            "Profile information such as display name, gender, age group, languages, interests, meeting style, and response note.",
            "Meetup information such as purpose, place name, location, time, duration, target preferences, and cost support amount.",
            "Messages, reviews, block events, and safety-related submissions where available.",
            "Moderation context related to reports, safety checks, account restrictions, or suspected misuse of the platform.",
          ],
        },
        {
          title: "2. Location information",
          paragraphs: [
            "Neonadri may process place names, public location details, map selections, and location-related coordinates used to position meetups and show relevant results.",
            "Because all meetups must take place in public locations, users should not submit private residences, hotel rooms, or isolated locations as meetup locations.",
            "Public views may reduce location precision before a meetup is confirmed.",
          ],
        },
        {
          title: "3. How we use information",
          bullets: [
            "To create and manage accounts.",
            "To display profiles, meetups, requests, matches, and related product flows.",
            "To support ranking, discovery, and map placement.",
            "To enable chat, requests, reviews, and related product features.",
            "To investigate abuse, fraud, unsafe behavior, inappropriate cost support, and rule violations.",
            "To enforce adults-only access, public-location expectations, and platform restrictions against dating, matchmaking, romantic, sexual, or financial expectations.",
          ],
        },
        {
          title: "4. Safety and cost support review",
          paragraphs: [
            "We may review meetup, message, profile, report, or account context where reasonably necessary to detect unsafe or prohibited cost support behavior, including attempts to use the service to offer money for attendance, time, companionship, romantic access, sexual access, or personal interaction.",
            "We may also review context where reasonably necessary to investigate harassment, pressure, impersonation, misleading identity claims, public-location violations, illegal activity, or attempts to use Neonadri as a dating or matchmaking service.",
          ],
        },
        {
          title: "5. Sharing",
          paragraphs: [
            "We may share information with service providers that help us operate the platform, with infrastructure and mapping vendors, where required by law, or where necessary to protect safety, rights, or platform integrity.",
            "We do not need to publicly expose all information we process. Some information is used internally for safety, moderation, fraud prevention, account operations, and enforcement.",
          ],
        },
        {
          title: "6. User controls",
          bullets: [
            "Users may be able to update profile information.",
            "Users may be able to change their password.",
            "Users may be able to block other users.",
            "Users may be able to delete their account.",
            "Users may be able to report unsafe behavior, inappropriate payment requests, or other rule violations where reporting tools are available.",
          ],
        },
        {
          title: "7. Retention",
          paragraphs: [
            "We retain information for as long as reasonably necessary to provide the service, protect the platform, investigate abuse, resolve disputes, and comply with legal obligations. Some records may remain where retention is necessary for safety, security, moderation, or fraud-prevention reasons.",
          ],
        },
        {
          title: "8. Children",
          paragraphs: [
            "Neonadri is for adults 18+ only and is not intended for children.",
          ],
        },
      ]}
    />
  );
}
