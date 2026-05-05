import LegalPageShell from "../components/LegalPageShell";

export default function FaqPage() {
  return (
    <LegalPageShell
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro="These answers cover the main product rules and expectations around adults-only social meetups, cost support, public locations, chat, moderation, and account safety on Neonadri."
      lastUpdated="2026-05-05"
      sections={[
        {
          title: "1. What is Neonadri?",
          paragraphs: [
            "Neonadri is an adults-only social meetup platform designed for calm, in-person social discovery.",
            "Neonadri is not a dating or matchmaking service. You can create a meetup, request to join someone else's meetup, match, and chat around the plan.",
          ],
        },
        {
          title: "2. Who can use Neonadri?",
          paragraphs: [
            "Neonadri is for adults 18 years of age or older only. By creating an account or using the service, you confirm that you are at least 18, that your information is accurate, and that you will use the service lawfully.",
          ],
        },
        {
          title: "3. What does cost support mean?",
          paragraphs: [
            "Cost support refers only to direct, shared meetup-related expenses such as food, drinks, tickets, transportation, parking, or similar activity costs.",
            "Cost support is not a payment to any individual.",
          ],
          bullets: [
            "It may not be used for attendance.",
            "It may not be used for time or companionship.",
            "It may not be used for personal, romantic, or sexual access.",
          ],
        },
        {
          title: "4. Where can meetups happen?",
          paragraphs: [
            "All meetups must take place in public locations. Private residences, hotel rooms, isolated locations, or other unsafe meetup locations are not permitted.",
            "Neonadri may limit how precisely location details are displayed before a meetup is confirmed. Once a meetup is confirmed, more precise location details may be shown to confirmed participants.",
            "Users are expected to prioritize their own safety and may leave a meetup at any time.",
          ],
        },
        {
          title: "5. How do match requests work?",
          paragraphs: [
            "If a meetup is open and you fit the meetup's target settings, you can send a request to join. The host can accept or decline that request.",
            "Accepted requests can lead to a match and chat access. Expired, cancelled, or already-filled meetups cannot be requested.",
            "Neonadri does not guarantee that a meetup will occur, that a user will attend, or that a match or request will remain available.",
          ],
        },
        {
          title: "6. When can I chat?",
          paragraphs: [
            "Chat becomes available after a meetup is matched. The chat is intended to help confirmed participants align details before and shortly after the meetup.",
            "Do not use chat to create romantic, sexual, financial, or other expectations outside the meetup plan.",
          ],
        },
        {
          title: "7. Why does chat close after 72 hours?",
          paragraphs: [
            "Neonadri keeps match chat focused on the meetup itself. After the meetup window passes, chat becomes read-only so the space stays tied to that specific meetup instead of becoming an open-ended messaging thread.",
          ],
        },
        {
          title: "8. How do blocking and reporting work?",
          paragraphs: [
            "You can block another user from their profile. Blocking limits new interaction, hides related content, and restricts direct access between the two accounts.",
            "If someone makes an unsafe payment-related request, pressures you, misrepresents their identity, suggests a private or isolated location, or tries to use Neonadri as a dating or matchmaking service, you can report it from the profile safety area for review.",
            "We may review, restrict, suspend, or remove content or accounts when needed to enforce platform rules, investigate unsafe behavior, comply with legal obligations, or protect users and the platform.",
          ],
        },
        {
          title: "9. What happens if a meetup is cancelled or changed?",
          paragraphs: [
            "Neonadri is not responsible for cancellations, no-shows, or unmet expectations related to any meetup.",
            "If a meetup changes, the current product experience may update related details and participant flow depending on the state of that meetup. Users are responsible for their own expenses unless otherwise agreed between participants.",
          ],
        },
        {
          title: "10. Does Neonadri verify users or guarantee safety?",
          paragraphs: [
            "No. Neonadri does not conduct background checks, does not verify user identity, and is not responsible for the behavior, actions, or conduct of any user.",
            "Users interact at their own risk. No romantic, financial, or other expectations are created or implied by using Neonadri.",
          ],
        },
      ]}
    />
  );
}
