import LegalPageShell from "../components/LegalPageShell";

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="This page explains the kinds of information Neonadri uses to run the service, support meetup flows, reduce abuse, and manage account safety. This is a public-facing draft and should still receive legal review before final publication."
      lastUpdated="2026-04-22"
      sections={[
        {
          title: "1. Information we collect",
          bullets: [
            "Account information such as email address.",
            "Profile information such as display name, gender, age group, languages, interests, meeting style, and response note.",
            "Meetup information such as purpose, place name, location, time, duration, target preferences, and cost support amount.",
            "Messages, reviews, block events, and safety-related submissions where available.",
          ],
        },
        {
          title: "2. Location information",
          paragraphs: [
            "Neonadri may process place names, addresses, map selections, and location-related coordinates used to position meetups and show relevant results. Public views may reduce location precision before a match is confirmed.",
          ],
        },
        {
          title: "3. How we use information",
          bullets: [
            "To create and manage accounts.",
            "To display profiles, meetups, and match flows.",
            "To support ranking, discovery, and map placement.",
            "To enable chat, requests, reviews, and related product features.",
            "To investigate abuse, fraud, safety issues, and rule violations.",
          ],
        },
        {
          title: "4. Safety and cost support review",
          paragraphs: [
            "We may review meetup or account context where reasonably necessary to detect unsafe or prohibited cost support behavior, including attempts to use the service to offer money for attendance, time, companionship, or personal interaction.",
          ],
        },
        {
          title: "5. Sharing",
          paragraphs: [
            "We may share information with service providers that help us operate the platform, with infrastructure and mapping vendors, where required by law, or where necessary to protect safety, rights, or platform integrity.",
          ],
        },
        {
          title: "6. User controls",
          bullets: [
            "Users may be able to update profile information.",
            "Users may be able to change their password.",
            "Users may be able to block other users.",
            "Users may be able to delete their account.",
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
