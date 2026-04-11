"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

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

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const [aboutMe, setAboutMe] = useState("");
  const [preferredArea, setPreferredArea] = useState("");
  const [meetingStyle, setMeetingStyle] = useState("");
  const [languages, setLanguages] = useState("");
  const [interests, setInterests] = useState("");
  const [responseTimeNote, setResponseTimeNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

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
        setBio(profile.bio || "");
        setGender(profile.gender || "");
        setAgeGroup(profile.age_group || "");
        setIsPublic(profile.is_public ?? true);

        setAboutMe(profile.about_me || "");
        setPreferredArea(profile.preferred_area || "");
        setMeetingStyle(profile.meeting_style || "");
        setLanguages((profile.languages || []).join(", "));
        setInterests((profile.interests || []).join(", "));
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

    const parsedLanguages = languages
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const parsedInterests = interests
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName.trim() || null,
      bio: bio.trim() || null,
      gender: gender || null,
      age_group: ageGroup || null,
      is_public: isPublic,
      about_me: aboutMe.trim() || null,
      preferred_area: preferredArea.trim() || null,
      meeting_style: meetingStyle.trim() || null,
      languages: parsedLanguages.length > 0 ? parsedLanguages : null,
      interests: parsedInterests.length > 0 ? parsedInterests : null,
      response_time_note: responseTimeNote.trim() || null,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Profile saved.");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-6 py-8 text-[#2f2a26]">
        <div className="mx-auto max-w-3xl rounded-[30px] border border-[#eadfd3] bg-white/90 p-8 text-center shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
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

        <div className="mx-auto rounded-[30px] border border-[#eadfd3] bg-white/90 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
              My account
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2f2a26]">
              Personal profile
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7a6b61]">
              Manage your public intro, preferences, and profile details.
            </p>
          </div>
          <div className="rounded-full bg-[#f6eee6] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
            Visible across meetups
          </div>
        </div>

        <div className="mt-8 space-y-5">
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
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
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
              rows={4}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Short intro shown in your profile"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              About Me
            </label>
            <textarea
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              rows={5}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Tell people more about your personality, interests, and meetup style"
            />
          </div>

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

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Preferred Area
            </label>
            <input
              value={preferredArea}
              onChange={(e) => setPreferredArea(e.target.value)}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Koreatown, Pasadena, DTLA..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Meeting Style
            </label>
            <input
              value={meetingStyle}
              onChange={(e) => setMeetingStyle(e.target.value)}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Friendly, casual, thoughtful..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Languages
            </label>
            <input
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="English, Korean"
            />
            <p className="mt-1 text-xs text-[#9b8f84]">
              Separate with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Interests
            </label>
            <input
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Coffee, Walk, Study, Board Games"
            />
            <p className="mt-1 text-xs text-[#9b8f84]">
              Separate with commas.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Response Note
            </label>
            <input
              value={responseTimeNote}
              onChange={(e) => setResponseTimeNote(e.target.value)}
              className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
              placeholder="Usually replies within a day"
            />
          </div>

          <label className="flex items-center gap-3 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-3 text-sm text-[#5a5149]">
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
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <a
            href="/"
            className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
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
