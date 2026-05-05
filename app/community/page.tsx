import LegalPageShell from "../components/LegalPageShell";

export default function CommunityPage() {
  return (
    <LegalPageShell
      eyebrow="Community"
      title="Community Guidelines"
      intro="Neonadri is meant for calm, adult, real-world social meetups, not dating or matchmaking. These guidelines set the baseline for how we expect people to use the platform and treat each other."
      lastUpdated="2026-05-05"
      sections={[
        {
          title: "1. What belongs on Neonadri",
          bullets: [
            "Real meetup activities with clear time, place, and tone.",
            "Public-location meetups that feel safe, respectful, and low-pressure.",
            "Honest communication about expectations and availability.",
            "Respectful interaction before, during, and after a meetup.",
            "Cost support that only applies to direct, shared meetup-related expenses.",
          ],
        },
        {
          title: "2. What is not allowed",
          bullets: [
            "Harassment, intimidation, threats, or stalking.",
            "Pressure to meet, continue chatting, or share private information.",
            "Impersonation or misleading identity claims.",
            "Private residences, hotel rooms, isolated locations, or other unsafe meetup locations.",
            "Creating or pursuing romantic, sexual, or financial expectations through the platform.",
            "Escort-style, companionship-for-pay, or sexual services content.",
            "Money offers for attendance, time, or companionship.",
            "Misleading meetup details, unlawful activity, or attempts to evade moderation.",
            "Use of the service by anyone under 18.",
          ],
        },
        {
          title: "3. Cost support rule",
          paragraphs: [
            "Cost support is only for direct, shared meetup costs such as food, drinks, tickets, parking, transport, or similar activity expenses.",
            "Cost support is not a payment to any individual.",
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
            "All meetups must take place in public locations. Private residences, hotel rooms, and isolated locations are not permitted.",
            "Respect location privacy boundaries in the product. Do not pressure other users to reveal more precise location detail than the product is meant to show at that stage.",
            "Prioritize your own safety. You may leave a meetup at any time.",
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
