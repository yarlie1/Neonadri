"use client";

import Link from "next/link";
import { useState } from "react";
import { Save } from "lucide-react";

type ProfileRow = {
  id: string;
  display_name: string | null;
  bio: string | null;
  about_me: string | null;
  gender: string | null;
  age_group: string | null;
  preferred_area: string | null;
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

      const payload = {
        id: profile.id,
        display_name: displayName.trim() || null,
        bio: aboutMeSummary || null,
        about_me: aboutMe.trim() || null,
        gender: gender || null,
        age_group: ageGroup || null,
        preferred_area: null,
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
    <div className="rounded-[34px] border border-[#eadfd3] bg-white/95 shadow-[0_24px_60px_rgba(92,69,52,0.14)] backdrop-blur">
      <div className="border-b border-[#efe6db] bg-[#fffaf6] px-6 py-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
          Edit profile
        </div>
        <h2 className="mt-1 text-xl font-black tracking-[-0.03em] text-[#2f2a26]">
          Keep your profile feeling current
        </h2>
      </div>

      <div className="px-6 py-5">
        <div className="mb-5 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-4 text-sm leading-6 text-[#6b5f52]">
          A clear, warm profile makes it easier for people to understand your energy before they send a request.
        </div>

        <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  About Me
                </label>
                <textarea
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value)}
                  rows={4}
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                  placeholder="Tell people more about yourself"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
                    className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2 rounded-[22px] border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Meeting Style
                </label>
                <select
                  value={meetingStyle}
                  onChange={(e) => setMeetingStyle(e.target.value)}
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2 rounded-[22px] border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Response Note
                </label>
                <select
                  value={responseTimeNote}
                  onChange={(e) => setResponseTimeNote(e.target.value)}
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
                <p className="rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-3 text-sm text-[#6b5f52]">
                  {message}
                </p>
              )}
        </div>
      </div>

      <div className="border-t border-[#efe6db] bg-[#fffaf6] px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="touch-manipulation inline-flex min-h-[48px] items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </button>

          <Link
            href={`/profile/${profile.id}`}
            className="touch-manipulation inline-flex min-h-[48px] items-center rounded-full border border-[#dccfc2] bg-white px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
