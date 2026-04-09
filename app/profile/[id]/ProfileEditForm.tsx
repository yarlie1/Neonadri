"use client";

import { useState, useTransition } from "react";
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

export default function ProfileEditForm({
  profile,
}: {
  profile: ProfileRow;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState(profile.display_name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [aboutMe, setAboutMe] = useState(profile.about_me || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [ageGroup, setAgeGroup] = useState(profile.age_group || "");
  const [preferredArea, setPreferredArea] = useState(profile.preferred_area || "");
  const [languages, setLanguages] = useState((profile.languages || []).join(", "));
  const [meetingStyle, setMeetingStyle] = useState(profile.meeting_style || "");
  const [interests, setInterests] = useState((profile.interests || []).join(", "));
  const [responseTimeNote, setResponseTimeNote] = useState(profile.response_time_note || "");
  const [isPublic, setIsPublic] = useState(profile.is_public ?? true);

  const [message, setMessage] = useState("");

  const handleSave = async () => {
    setMessage("");

    const parsedLanguages = languages
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const parsedInterests = interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from("profiles").upsert({
      id: profile.id,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      about_me: aboutMe.trim() || null,
      gender: gender || null,
      age_group: ageGroup || null,
      preferred_area: preferredArea.trim() || null,
      languages: parsedLanguages.length > 0 ? parsedLanguages : null,
      meeting_style: meetingStyle.trim() || null,
      interests: parsedInterests.length > 0 ? parsedInterests : null,
      response_time_note: responseTimeNote.trim() || null,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved.");

    startTransition(() => {
      router.refresh();
      setOpen(false);
    });
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-[#e7ddd2] bg-white p-6 shadow-xl sm:rounded-[28px]">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#2f2a26]">Edit Profile</h2>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dccfc2] bg-white text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
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
              Preferred Area
            </label>
            <input
              value={preferredArea}
              onChange={(e) => setPreferredArea(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Koreatown, Pasadena, DTLA..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Languages
            </label>
            <input
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="English, Korean"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Meeting Style
            </label>
            <input
              value={meetingStyle}
              onChange={(e) => setMeetingStyle(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Friendly, thoughtful, relaxed..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Interests
            </label>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Coffee, Walk, Study, Board Games"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Response Note
            </label>
            <input
              value={responseTimeNote}
              onChange={(e) => setResponseTimeNote(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Usually replies within a day"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#5a5149]">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make my profile public
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full border border-[#dccfc2] bg-white px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            Cancel
          </button>
        </div>

        {message && (
          <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}