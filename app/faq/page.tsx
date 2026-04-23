import LegalPageShell from "../components/LegalPageShell";

export default function FaqPage() {
  return (
    <LegalPageShell
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro="These answers cover the main product rules and expectations around meetups, cost support, chat, location sharing, and account safety on Neonadri."
      lastUpdated="2026-04-23"
      sections={[
        {
          title: "1. What is Neonadri?",
          paragraphs: [
            "Neonadri is an adults-only meetup platform for calm, in-person social discovery. You can create a meetup, request to join someone else's meetup, match, and chat around the meetup.",
          ],
        },
        {
          title: "2. Who can use Neonadri?",
          paragraphs: [
            "Neonadri is for adults 18 or older only. We ask users to confirm that they are 18+ during signup and before protected parts of the product when needed.",
          ],
        },
        {
          title: "3. What does cost support mean?",
          paragraphs: [
            "Cost support refers only to direct meetup-related costs such as food, drinks, tickets, transport, parking, or similar activity expenses.",
          ],
          bullets: [
            "It is not payment for attendance.",
            "It is not payment for time or companionship.",
            "It may not be used for personal, romantic, or sexual access.",
          ],
        },
        {
          title: "4. When is the full address shared?",
          paragraphs: [
            "Before a meetup is matched, Neonadri limits location detail and may show a place name or masked area instead of the full address.",
            "Once a meetup is matched, more precise location details may be shown to confirmed participants.",
          ],
        },
        {
          title: "5. How do match requests work?",
          paragraphs: [
            "If a meetup is open and you fit the meetup's target settings, you can send a request to join. The host can accept or decline that request.",
            "Accepted requests can lead to a match and chat access. Expired meetups cannot be requested.",
          ],
        },
        {
          title: "6. When can I chat?",
          paragraphs: [
            "Chat becomes available after a meetup is matched. The chat is intended to help confirmed participants align details before and shortly after the meetup.",
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
            "If someone makes an unsafe payment-related request, you can report it from the profile safety area for review.",
          ],
        },
        {
          title: "9. What happens if a meetup is cancelled or changed?",
          paragraphs: [
            "If a meetup changes, the current product experience may update the related details and participant flow depending on the state of that meetup. As product support expands, change and cancellation handling may become more explicit.",
          ],
        },
        {
          title: "10. How do reviews work?",
          paragraphs: [
            "After a matched meetup has passed, eligible participants may be able to leave a review. Review availability depends on the meetup state and whether a review has already been submitted.",
          ],
        },
      ]}
    />
  );
}
