import LegalPageShell from "../components/LegalPageShell";

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of Service"
      intro="These terms describe the basic rules for using Neonadri as an adults-only meetup platform. This is a public-facing product draft and should still receive legal review before final publication."
      lastUpdated="2026-04-22"
      sections={[
        {
          title: "1. Eligibility",
          paragraphs: [
            "Neonadri is for adults 18 or older only. By creating or using an account, you confirm that you are at least 18, that your information is accurate, and that you will use the service lawfully.",
          ],
        },
        {
          title: "2. Account responsibility",
          paragraphs: [
            "You are responsible for your account, your password, and activity that happens through your account. You may not share your account or impersonate another person.",
          ],
        },
        {
          title: "3. Meetup content and conduct",
          paragraphs: [
            "You are responsible for the profile content, meetup details, messages, and reviews you create through Neonadri.",
          ],
          bullets: [
            "Do not harass, threaten, stalk, or pressure another person.",
            "Do not post misleading meetup details or arrange illegal activity.",
            "Do not evade blocks, moderation actions, or account restrictions.",
          ],
        },
        {
          title: "4. Cost support rule",
          paragraphs: [
            "Any cost support shown on Neonadri may only refer to direct meetup-related costs such as food, drinks, tickets, transport, parking, or similar activity expenses.",
          ],
          bullets: [
            "Cost support may not be used for attendance.",
            "Cost support may not be used for time or companionship.",
            "Cost support may not be used for personal, romantic, or sexual access.",
          ],
        },
        {
          title: "5. Location and safety",
          paragraphs: [
            "To reduce safety risk, Neonadri may limit how precisely location details are shown before a match is confirmed. More detailed location information may appear later in the meetup flow where product rules allow it.",
          ],
        },
        {
          title: "6. Matching, messaging, and availability",
          paragraphs: [
            "Neonadri helps users discover and coordinate meetups, but does not guarantee that a meetup will occur, that a user will attend, or that a match will remain available. Chat availability may also be limited by product rules.",
          ],
        },
        {
          title: "7. Moderation and enforcement",
          paragraphs: [
            "We may review, restrict, remove, or disable content or accounts when necessary to enforce platform rules, investigate unsafe behavior, comply with law, or protect users and the service.",
          ],
        },
        {
          title: "8. Disclaimers",
          paragraphs: [
            "Neonadri is provided on an as-is and as-available basis. We do not guarantee uninterrupted availability, the accuracy of user-generated content, the safety or intentions of any user, or the outcome of any meetup, request, or conversation.",
          ],
        },
      ]}
    />
  );
}
