import LegalPageShell from "../components/LegalPageShell";

export default function FaqPage() {
  return (
    <LegalPageShell
      eyebrow="FAQ"
      title="Frequently asked questions"
      intro="Short answers for Neonadri basics."
      lastUpdated="2026-05-05"
      sections={[
        {
          title: "1. Adults-only social meetups",
          paragraphs: [
            "Neonadri is for calm, in-person social meetups.",
            "It is not dating or matchmaking.",
          ],
        },
        {
          title: "2. 18+ only",
          paragraphs: [
            "You must be 18 or older to use Neonadri.",
          ],
        },
        {
          title: "3. Cost support",
          paragraphs: [
            "Cost support covers direct meetup costs only.",
            "It is not a payment to a person.",
          ],
          bullets: [
            "Not attendance.",
            "Not time or companionship.",
            "Not romantic or sexual access.",
          ],
        },
        {
          title: "4. Public places",
          paragraphs: [
            "Meetups must happen in public locations.",
            "Exact location details may stay limited until matching.",
            "You may leave anytime.",
          ],
        },
        {
          title: "5. Requests and matches",
          paragraphs: [
            "Send a request. The host can accept or decline.",
            "Matched meetups unlock chat.",
            "Expired, cancelled, or filled meetups are closed.",
          ],
        },
        {
          title: "6. Chat",
          paragraphs: [
            "Chat opens after a match.",
            "Use it for meetup details only.",
          ],
        },
        {
          title: "7. 72-hour chat window",
          paragraphs: [
            "Chat becomes read-only 72 hours after the meetup.",
          ],
        },
        {
          title: "8. Block and report",
          paragraphs: [
            "Blocking limits future interaction.",
            "Report unsafe behavior from the profile safety area.",
            "We may restrict or remove accounts that break rules.",
          ],
        },
        {
          title: "9. Cancellations",
          paragraphs: [
            "Cancelled meetups close requests.",
            "Users are responsible for their own expenses.",
          ],
        },
        {
          title: "10. No safety guarantee",
          paragraphs: [
            "Neonadri does not run background checks or verify identity.",
            "Use your own judgment. Meet in public.",
          ],
        },
      ]}
    />
  );
}
