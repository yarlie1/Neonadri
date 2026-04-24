"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const INTEREST_OPTIONS = [
  "Coffee",
  "Walk",
  "Meal",
  "Dessert",
  "Study",
  "Movie",
  "Karaoke",
  "Board Games",
  "Workout",
  "Language Exchange",
] as const;

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";

function ToggleChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
        selected
          ? "border-[#bfcbd3] bg-[linear-gradient(180deg,#ffffff_0%,#dde7ed_100%)] text-[#1f2e38] shadow-[0_12px_22px_rgba(118,126,133,0.14),inset_0_1px_0_rgba(255,255,255,0.96)]"
          : APP_PILL_INACTIVE_CLASS
      }`}
    >
      {label}
    </button>
  );
}

export default function BetaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [motivation, setMotivation] = useState("");
  const [meetupInterests, setMeetupInterests] = useState<string[]>([]);

  const toggleInterest = (interest: string) => {
    setMeetupInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    );
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/beta/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        email,
        gender,
        ageGroup,
        motivation,
        meetupInterests,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not submit your beta application.");
      return;
    }

    setMessage(
      payload.message ||
        "Your beta application is in. We'll email you if a spot opens for this round."
    );
  };

  return (
    <main
      className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}
    >
      <div className="mx-auto max-w-5xl space-y-4">
        <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
          <div
            className={`inline-flex items-center gap-2 rounded-full px-3 py-[0.3125rem] text-[11px] font-medium uppercase leading-none tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Closed beta
          </div>
          <div className={APP_EYEBROW_CLASS + " mt-5"}>Apply for access</div>
          <h1 className="mt-2 max-w-2xl text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[42px]">
            Join Neonadri&apos;s application-based beta.
          </h1>
          <p className={`mt-3 max-w-2xl ${APP_BODY_TEXT_CLASS}`}>
            We&apos;re keeping the beta intentionally small while we tune safety,
            meetup quality, and feedback loops. All features are free during the
            beta, but any CS you offer for a matched meetup still applies.
          </p>
          <p className="mt-3 text-sm text-[#5f6d76]">
            If you&apos;re approved, you&apos;ll be able to sign up with the same email
            address you use here.
          </p>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={APP_EYEBROW_CLASS}>Name</label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className={`${INPUT_CLASS} mt-2`}
                placeholder="What should we call you?"
              />
            </div>
            <div>
              <label className={APP_EYEBROW_CLASS}>Email</label>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`${INPUT_CLASS} mt-2`}
                placeholder="name@email.com"
                type="email"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={APP_EYEBROW_CLASS}>Gender</label>
              <select
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                className={`${INPUT_CLASS} mt-2`}
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className={APP_EYEBROW_CLASS}>Age group</label>
              <select
                value={ageGroup}
                onChange={(event) => setAgeGroup(event.target.value)}
                className={`${INPUT_CLASS} mt-2`}
              >
                <option value="">Select</option>
                <option value="20s">20s</option>
                <option value="30s">30s</option>
                <option value="40s">40s</option>
                <option value="50s+">50s+</option>
              </select>
            </div>
          </div>

          <div className="mt-5">
            <label className={APP_EYEBROW_CLASS}>Meetup interests</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <ToggleChip
                  key={interest}
                  label={interest}
                  selected={meetupInterests.includes(interest)}
                  onClick={() => toggleInterest(interest)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className={APP_EYEBROW_CLASS}>Why do you want in?</label>
            <textarea
              value={motivation}
              onChange={(event) => setMotivation(event.target.value)}
              rows={5}
              className={`${INPUT_CLASS} mt-2`}
              placeholder="Tell us why you want to try Neonadri."
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={submitting}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${APP_BUTTON_PRIMARY_CLASS} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {submitting ? "Submitting..." : "Apply for beta"}
              <ArrowRight className="h-4 w-4" />
            </button>
            <Link
              href="/signup"
              className={`inline-flex items-center rounded-full px-5 py-3 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Already approved? Go to signup
            </Link>
          </div>
        </section>

        {message ? (
          <section
            className={`${APP_SOFT_CARD_CLASS} px-5 py-4 text-sm text-[#55626a]`}
          >
            {message}
          </section>
        ) : null}
      </div>
    </main>
  );
}
