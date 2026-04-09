"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import { Pencil, Save, X } from "lucide-react";

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
  const supabase = createClient();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [aboutMe, setAboutMe] = useState(profile.about_me || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [ageGroup, setAgeGroup] = useState(profile.age_group || "");
  const [languages, setLanguages] = useState<string[]>(profile.languages || []);
  const [meetingStyle, setMeetingStyle] = useState(profile.meeting_style || "");
  const [interests, setInterests] = useState<string[]>(profile.interests || []);
  const [responseTimeNote, setResponseTimeNote] = useState(
    profile.response_time_note || ""
  );
  const [isPublic, setIsPublic] = useState(profile.is_public ?? true);

  const [message, setMessage] = useState("");

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
        bio: bio.trim() || null,
        about_me: aboutMe.trim() || null,
        gender: gender || null,
        age_group: ageGroup || null,
        preferred_area: null,
        languages: languages.length > 0 ? languages : null,
        meeting_style: meetingStyle || null,
        interests: interests.length > 0 ? interests : null,
        response_time_note: responseTimeNote || null,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Profile saved.");

      router.refresh();

      setTimeout(() => {
        setOpen(false);
        setSaving(false);
        setMessage("");
      }, 500);
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong while saving.");
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
      >
        <Pencil className="h-4 w-4" />
        Edit
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100]">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setOpen(false)}
      />

      <div className="absolute inset-0 flex items-end justify-center sm:items-center">
        <div
          className="relative z-[101] pointer-events-auto flex h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-[#e7ddd2] bg-white shadow-xl sm:h-auto sm:max-h-[90vh] sm:rounded-[28px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[#efe6db] px-6 py-5">
            <h2 className="text-xl font-bold text-[#2f2a26]">Edit Profile</h2>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Display Name
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Bio
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
                  placeholder="Short intro"
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
                  className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
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
                    className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
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
                    className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
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
                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                  className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
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
                <div className="flex flex-wrap gap-2 rounded-2xl border border-[#e7ddd2] bg-[#fcfaf7] p-3">
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
                  className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
                >
                  <option value="">Select response note</option>
                  {RESPONSE_NOTE_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#5a5149]">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Make my profile public
              </label>

              {message && (
                <p className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
                  {message}
                </p>
              )}
            </div>
          </div>

          <div className="relative z-[102] border-t border-[#efe6db] bg-white px-6 py-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
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

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="touch-manipulation inline-flex min-h-[48px] items-center rounded-full border border-[#dccfc2] bg-white px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}