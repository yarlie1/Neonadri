"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  ABOUT_ME_RESTRICTION_MESSAGE,
  validateAboutMeContent,
} from "../../lib/profileContent";

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
};

const SURFACE_CARD_CLASS =
  "rounded-[30px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f8efe7_100%)] shadow-[0_14px_32px_rgba(92,69,52,0.07)] backdrop-blur";
const SOFT_CARD_CLASS =
  "rounded-[22px] border border-[#eee3d8] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)]";
const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12";
const PRIMARY_BUTTON_CLASS =
  "rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_18px_rgba(92,69,52,0.10)] transition hover:bg-[#927d69] disabled:opacity-50";
const SECONDARY_BUTTON_CLASS =
  "rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-5 py-3 text-sm font-medium text-[#5f5347] transition hover:bg-[#f7eee6]";

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
        className={`rounded-full px-3 py-2 text-sm font-medium transition ${
        selected
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
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
            response_time_note
          `
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        setMessage(error.message);
        setLoading(false);
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
        });

        if (insertError) {
          setMessage(insertError.message);
          setLoading(false);
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
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleSave = async () => {
    if (!userId) return;

    setMessage("");
    setSaving(true);

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
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-6 py-8 text-[#2f2a26]">
        <div className={`mx-auto max-w-3xl ${SURFACE_CARD_CLASS} p-8 text-center`}>
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f4d7c7_38%,#e4b49d_100%)] px-6 py-7 text-[#2a211d] shadow-[0_24px_60px_rgba(120,76,52,0.16)] sm:px-8 sm:py-9">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
            <div className="inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
              Profile settings
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#2b1f1a] sm:text-[40px]">
              Shape how people meet you.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5f453b] sm:text-[15px]">
              Your account sets the tone before the first message. Keep it warm, clear, and easy to trust.
            </p>
          </div>
        </section>

        <div className={`mx-auto ${SURFACE_CARD_CLASS} p-5 md:p-8`}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
              My account
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2f2a26]">
              Personal profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7a6b61]">
              Manage your public intro, meetup preferences, and the signals people see before they reach out.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
              Account email
            </div>
            <div className="mt-2 text-sm font-medium text-[#5f5347]">
              {email || "Not available"}
            </div>
          </div>
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
              About you
            </div>
            <div className="mt-2 text-sm font-medium text-[#5f5347]">
              {aboutMeSummary || "Write a little about yourself"}
            </div>
          </div>
          <div className={`${SOFT_CARD_CLASS} p-4`}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
              Interests
            </div>
            <div className="mt-2 text-sm font-medium text-[#5f5347]">
              {interests.length > 0 ? `${interests.length} selected` : "Add a few favorites"}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <section className="rounded-[26px] border border-[#efe6db] bg-[#fcfaf7] p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                Basics
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#2f2a26]">
                The first impression
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#f6eee6] px-4 py-3 text-sm text-[#7b7067]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Display Name
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Your name"
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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
              <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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

          <section className="rounded-[26px] border border-[#efe6db] bg-[#fcfaf7] p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                Personality
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#2f2a26]">
                Help people understand your vibe
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              About Me
            </label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={5}
              className={INPUT_CLASS}
              placeholder="Tell people more about your personality, interests, and meetup style"
            />
            <p className="mt-2 text-xs text-[#8c7668]">
              Avoid prostitution, solicitation, or other unsafe sexual content.
            </p>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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

          <section className="rounded-[26px] border border-[#efe6db] bg-[#fcfaf7] p-4 sm:p-5">
            <div className="mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
                Preferences
              </div>
              <h3 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#2f2a26]">
                Make your meetup style easy to read
              </h3>
            </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
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
            className={PRIMARY_BUTTON_CLASS}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <a
            href="/"
            className={SECONDARY_BUTTON_CLASS}
          >
            Back to Home
          </a>
        </div>

        {message && (
          <p className="mt-5 rounded-[20px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </p>
        )}
        </div>
      </div>
    </main>
  );
}
