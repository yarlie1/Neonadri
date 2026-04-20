"use client";

import Link from "next/link";
import { useState } from "react";
import { Save } from "lucide-react";
import {
  ABOUT_ME_RESTRICTION_MESSAGE,
  validateAboutMeContent,
} from "../../../lib/profileContent";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  about_me: string | null;
  gender: string | null;
  age_group: string | null;
  languages: string[] | null;
  meeting_style: string | null;
  interests: string[] | null;
  response_time_note: string | null;
  is_public: boolean | null;
};

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

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";

export default function ProfileEditForm({
  profile,
}: {
  profile: ProfileRow;
}) {
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [aboutMe, setAboutMe] = useState(profile.about_me || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [ageGroup, setAgeGroup] = useState(profile.age_group || "");
  const [languages, setLanguages] = useState<string[]>(profile.languages || []);
  const [meetingStyle, setMeetingStyle] = useState(profile.meeting_style || "");
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [responseTimeNote, setResponseTimeNote] = useState(
    profile.response_time_note || ""
  );

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
    } else {
      setter([...current, value]);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    try {
      setSaving(true);
      setMessage("Saving profile...");

      const aboutMeValidation = validateAboutMeContent(aboutMe);

      if (!aboutMeValidation.ok) {
        setMessage(ABOUT_ME_RESTRICTION_MESSAGE);
        setSaving(false);
        return;
      }

      const payload = {
        id: profile.id,
        display_name: displayName.trim() || null,
        bio: aboutMeSummary || null,
        about_me: aboutMe.trim() || null,
        gender: gender || null,
        age_group: ageGroup || null,
        languages: languages.length > 0 ? languages : null,
        meeting_style: meetingStyle || null,
        interests: interests.length > 0 ? interests : null,
        response_time_note: responseTimeNote || null,
        updated_at: new Date().toISOString(),
      };

      const response = await fetch("/api/profile/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage("ERROR: " + (result.error || "Failed to save profile."));
        setSaving(false);
        return;
      }

      setMessage("Profile saved. Redirecting...");
      window.location.replace(`/profile/${profile.id}`);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while saving.");
      setSaving(false);
    }
  };

  return (
    <div className={`overflow-hidden rounded-[36px] ${APP_SURFACE_CARD_CLASS} backdrop-blur`}>
      <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fa_100%)] px-6 py-5">
        <div className={APP_EYEBROW_CLASS}>
          Edit profile
        </div>
        <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#24323c]">
          Keep your profile feeling current
        </h2>
      </div>

      <div className="border-t border-[#e6edf2]/80 px-6 py-5">
        <div className={`mb-5 rounded-[22px] px-4 py-4 text-sm leading-6 ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
          A clear profile makes it easier for people to understand your energy before they send a request.
        </div>

        <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={INPUT_CLASS}
                  placeholder="Your name"
                />
              </div>

              <div>
              <label className="mb-2 block text-sm font-medium text-[#52616a]">
                About Me
              </label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={4}
                  className={INPUT_CLASS}
                  placeholder="Tell people more about yourself"
                />
                <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
                  Avoid prostitution, solicitation, or other unsafe sexual content.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
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

              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Languages
                </label>
                <div className={`flex flex-wrap gap-2 rounded-[22px] p-3 ${APP_SOFT_CARD_CLASS}`}>
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
                  {MEETING_STYLE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Interests
                </label>
                <div className={`flex flex-wrap gap-2 rounded-[22px] p-3 ${APP_SOFT_CARD_CLASS}`}>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Response Note
                </label>
                <select
                  value={responseTimeNote}
                  onChange={(e) => setResponseTimeNote(e.target.value)}
                  className={INPUT_CLASS}
                >
                  <option value="">Select response note</option>
                  {RESPONSE_NOTE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              {message && (
                <p className="rounded-[22px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                  {message}
                </p>
              )}
        </div>
      </div>

      <div className="border-t border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fa_100%)] px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`touch-manipulation inline-flex min-h-[48px] items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </button>

          <Link
            href={`/profile/${profile.id}`}
            className={`touch-manipulation inline-flex min-h-[48px] items-center rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
