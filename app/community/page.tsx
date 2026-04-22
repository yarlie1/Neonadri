import LegalPageShell from "../components/LegalPageShell";

export default function CommunityPage() {
  return (
    <LegalPageShell
      eyebrow="Community"
      title="Community Guidelines"
      intro="Neonadri is meant for calm, adult, real-world social discovery. These guidelines set the baseline for how we expect people to use the platform and treat each other."
      lastUpdated="2026-04-22"
      sections={[
        {
          title: "1. What belongs on Neonadri",
          bullets: [
            "Real meetup activities with clear time, place, and tone.",
            "Honest communication about expectations and availability.",
            "Respectful interaction before, during, and after a meetup.",
            "Cost support that only covers direct meetup-related expenses.",
          ],
        },
        {
          title: "2. What is not allowed",
          bullets: [
            "Harassment, intimidation, threats, or stalking.",
            "Pressure to meet, continue chatting, or share private information.",
            "Impersonation or misleading identity claims.",
            "Escort-style, companionship-for-pay, or sexual services content.",
            "Money offers for attendance, time, or companionship.",
            "Use of the service by anyone under 18.",
          ],
        },
        {
          title: "3. Cost support rule",
          paragraphs: [
            "Cost support is only for direct meetup costs such as food, drinks, tickets, parking, transport, or similar activity expenses.",
          ],
          bullets: [
            "Do not use cost support to pay someone to show up.",
            "Do not use cost support to pay for time or presence.",
            "Do not use cost support for companionship, romantic access, or sexual access.",
          ],
        },
        {
          title: "4. Location and safety expectations",
          paragraphs: [
            "Respect location privacy boundaries in the product. Do not pressure other users to reveal more precise location detail than the product is meant to show at that stage.",
          ],
        },
        {
          title: "5. Reporting, blocking, and enforcement",
          paragraphs: [
            "Use block or report tools where available if you encounter unsafe behavior, inappropriate payment requests, or abusive conduct. We may remove content, limit visibility, restrict account features, suspend accounts, or ban users who violate these guidelines.",
          ],
        },
      ]}
    />
  );
}
