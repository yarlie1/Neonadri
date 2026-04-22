"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";
import {
  ABOUT_ME_RESTRICTION_MESSAGE,
  validateAboutMeContent,
} from "../../lib/profileContent";
import BlockedUsersCard from "../components/BlockedUsersCard";

const LANGUAGE_OPTIONS = [
  "English",
  "Korean",
  "Spanish",
  "Japanese",
  "Chinese",
  "French",
];

const MEETING_STYLE_OPTIONS = [
  "Friendly and relaxed",
  "Thoughtful and calm",
  "Casual and easygoing",
  "Focused and productive",
  "Energetic and social",
  "Quiet and comfortable",
];

const INTEREST_OPTIONS = [
  "Coffee",
  "Walk",
  "Study",
  "Board Games",
  "Meal",
  "Dessert",
  "Movie",
  "Karaoke",
  "Workout",
  "Books",
  "Travel",
  "Language Exchange",
  "Networking",
  "Photography",
];

const RESPONSE_NOTE_OPTIONS = [
  "Usually replies within a few hours",
  "Usually replies within a day",
  "Usually replies within 2 days",
  "Replies may be slow on weekdays",
  "Usually replies in the evening",
];
const DISPLAY_NAME_MAX_LENGTH = 24;
const DISPLAY_NAME_LENGTH_MESSAGE = `Display name must be ${DISPLAY_NAME_MAX_LENGTH} characters or fewer.`;

type Profile = {
  id: string;
  display_name: string | null;
  bio: string | null;
  gender: string | null;
  age_group: string | null;
  is_public: boolean | null;
  about_me: string | null;
  preferred_area: string | null;
  meeting_style: string | null;
  languages: string[] | null;
  interests: string[] | null;
  response_time_note: string | null;
  is_admin: boolean | null;
};

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";
const SURFACE_CARD_CLASS = APP_SURFACE_CARD_CLASS;
const SOFT_CARD_CLASS = APP_SOFT_CARD_CLASS;
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-9";

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
        selected ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
      }`}
    >
      {label}
    </button>
  );
}

export default function AccountPage() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [meetingStyle, setMeetingStyle] = useState("");
  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [responseTimeNote, setResponseTimeNote] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const aboutMeSummary = aboutMe.replace(/\s+/g, " ").trim()
    ? aboutMe.replace(/\s+/g, " ").trim().length <= 110
      ? aboutMe.replace(/\s+/g, " ").trim()
      : `${aboutMe.replace(/\s+/g, " ").trim().slice(0, 107).trimEnd()}...`
    : "";

  const toggleArrayValue = (
    value: string,
    current: string[],
    setter: (next: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
      return;
    }

    setter([...current, value]);
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          setMessage(authError.message || "Could not load account.");
          return;
        }

        if (!user) {
          setLoading(false);
          router.push("/login");
          return;
        }

        setUserId(user.id);
        setEmail(user.email || "");

        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
              id,
              display_name,
              bio,
              gender,
              age_group,
              is_public,
              about_me,
              preferred_area,
              meeting_style,
              languages,
              interests,
              response_time_note,
              is_admin
            `
          )
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          setMessage(error.message);
          return;
        }

        if (!data) {
          const { error: insertError } = await supabase.from("profiles").insert({
            id: user.id,
            display_name: "",
            bio: "",
            gender: "",
            age_group: "",
            is_public: true,
            about_me: "",
            preferred_area: "",
            meeting_style: "",
            languages: [],
            interests: [],
            response_time_note: "",
            is_admin: false,
          });

          if (insertError) {
            setMessage(insertError.message);
            return;
          }
        } else {
          const profile = data as Profile;

          setDisplayName(profile.display_name || "");
          setGender(profile.gender || "");
          setAgeGroup(profile.age_group || "");
          setAboutMe(profile.about_me || "");
          setPreferredArea(profile.preferred_area || "");
          setMeetingStyle(profile.meeting_style || "");
          setLanguages(profile.languages || []);
          setInterests(profile.interests || []);
          setResponseTimeNote(profile.response_time_note || "");
          setIsAdmin(!!profile.is_admin);
        }
      } catch (error) {
        console.error("Account load failed", error);
        setMessage("Could not load account.");
      } finally {
        setLoading(false);
      }
    };

    void loadProfile();
  }, [router, supabase]);

  const handleSave = async () => {
    if (!userId) return;

    setMessage("");
    setSaving(true);

    if (displayName.trim().length > DISPLAY_NAME_MAX_LENGTH) {
      setMessage(DISPLAY_NAME_LENGTH_MESSAGE);
      setSaving(false);
      return;
    }

    const aboutMeValidation = validateAboutMeContent(aboutMe);

    if (!aboutMeValidation.ok) {
      setMessage(ABOUT_ME_RESTRICTION_MESSAGE);
      setSaving(false);
      return;
    }

    const response = await fetch("/api/profile/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: userId,
        display_name: displayName.trim() || null,
        bio: aboutMeSummary || null,
        gender: gender || null,
        age_group: ageGroup || null,
        is_public: true,
        about_me: aboutMe.trim() || null,
        preferred_area: preferredArea.trim() || null,
        meeting_style: meetingStyle.trim() || null,
        languages: languages.length > 0 ? languages : null,
        interests: interests.length > 0 ? interests : null,
        response_time_note: responseTimeNote.trim() || null,
        updated_at: new Date().toISOString(),
      }),
    });

    const result = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(result.error || "Failed to save profile.");
      return;
    }

    setMessage("Profile saved.");
  };

  if (loading) {
    return (
      <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-6 py-8`}>
        <div className={`mx-auto max-w-3xl ${SURFACE_CARD_CLASS} p-8 text-center`}>
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-4xl space-y-4">
        <section className={HERO_SURFACE_CLASS}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
          <div className="relative">
            <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
              Profile settings
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[40px]">
              Shape how people meet you.
            </h1>
            <p className={`mt-3 max-w-2xl sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
              Your account sets the tone before the first message. Keep it warm, clear, and easy to trust.
            </p>
          </div>
        </section>

        <div className={`mx-auto ${SURFACE_CARD_CLASS} p-5 md:p-8`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className={APP_EYEBROW_CLASS}>
              My account
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              Personal profile
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Manage your public intro, meetup preferences, and the signals people see before they reach out.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
              Account email
            </div>
            <div className="mt-2 text-sm font-medium text-[#52616a]">
              {email || "Not available"}
            </div>
          </div>
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
              About you
            </div>
            <div className="mt-2 text-sm font-medium text-[#52616a]">
              {aboutMeSummary || "Write a little about yourself"}
            </div>
          </div>
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
              Interests
            </div>
            <div className="mt-2 text-sm font-medium text-[#52616a]">
              {interests.length > 0 ? `${interests.length} selected` : "Add a few favorites"}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section className={`${APP_SOFT_CARD_CLASS} p-4 sm:p-5`}>
            <div className="mb-4">
              <div className={APP_EYEBROW_CLASS}>
                Basics
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                The first impression
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-[20px] border border-[#d9e1e7] bg-[linear-gradient(180deg,#f7fafc_0%,#eef3f6_100%)] px-4 py-3 text-sm text-[#7a8790]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) =>
                setDisplayName(e.target.value.slice(0, DISPLAY_NAME_MAX_LENGTH))
              }
              maxLength={DISPLAY_NAME_MAX_LENGTH}
              className={INPUT_CLASS}
              placeholder="Your name"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#52616a]">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#52616a]">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="">Select age group</option>
                <option value="20s">20s</option>
                <option value="30s">30s</option>
                <option value="40s">40s</option>
                <option value="50s+">50s+</option>
              </select>
            </div>
          </div>
          </section>

          <section className={`${APP_SOFT_CARD_CLASS} p-4 sm:p-5`}>
            <div className="mb-4">
              <div className={APP_EYEBROW_CLASS}>
                Personality
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                Help people understand your vibe
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              About Me
            </label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={5}
              className={INPUT_CLASS}
              placeholder="Tell people more about your personality, interests, and meetup style"
            />
            <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              Avoid prostitution, solicitation, or other unsafe sexual content.
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Preferred Area
            </label>
            <input
              value={preferredArea}
              onChange={(e) => setPreferredArea(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Koreatown, Pasadena, DTLA..."
            />
          </div>
          </section>

          <section className={`${APP_SOFT_CARD_CLASS} p-4 sm:p-5`}>
            <div className="mb-4">
              <div className={APP_EYEBROW_CLASS}>
                Preferences
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                Make your meetup style easy to read
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Meeting Style
            </label>
            <select
              value={meetingStyle}
              onChange={(e) => setMeetingStyle(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Select meeting style</option>
              {MEETING_STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Languages
            </label>
            <div className={`${SOFT_CARD_CLASS} flex flex-wrap gap-2 p-3`}>
              {LANGUAGE_OPTIONS.map((item) => (
                <ToggleChip
                  key={item}
                  label={item}
                  selected={languages.includes(item)}
                  onClick={() => toggleArrayValue(item, languages, setLanguages)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Interests
            </label>
            <div className={`${SOFT_CARD_CLASS} flex flex-wrap gap-2 p-3`}>
              {INTEREST_OPTIONS.map((item) => (
                <ToggleChip
                  key={item}
                  label={item}
                  selected={interests.includes(item)}
                  onClick={() => toggleArrayValue(item, interests, setInterests)}
                />
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#52616a]">
              Response Note
            </label>
            <select
              value={responseTimeNote}
              onChange={(e) => setResponseTimeNote(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="">Select response note</option>
              {RESPONSE_NOTE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          </section>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`rounded-full border px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <a
            href="/"
            className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Back to Home
          </a>
        </div>

        {message && (
          <p className="mt-5 rounded-[20px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
            {message}
          </p>
        )}
        </div>

        {isAdmin ? (
          <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
            <div className={APP_EYEBROW_CLASS}>Admin tools</div>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
              Review safety reports
            </h2>
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
              Open the admin reports queue to review new reports, update status, and jump to the affected target.
            </p>
            <div className="mt-4">
              <Link
                href="/admin/reports"
                className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Open admin reports
              </Link>
            </div>
          </section>
        ) : null}

        <BlockedUsersCard />
      </div>
    </main>
  );
}
