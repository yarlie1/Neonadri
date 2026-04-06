"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  gender: string | null;
  age_group: string | null;
  is_public: boolean | null;
};

export default function AccountPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [gender, setGender] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [isPublic, setIsPublic] = useState(true);

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
          "id, display_name, avatar_url, bio, gender, age_group, is_public"
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
          avatar_url: "",
          bio: "",
          gender: "",
          age_group: "",
          is_public: true,
        });

        if (insertError) {
          setMessage(insertError.message);
          setLoading(false);
          return;
        }
      } else {
        const profile = data as Profile;
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url || "");
        setBio(profile.bio || "");
        setGender(profile.gender || "");
        setAgeGroup(profile.age_group || "");
        setIsPublic(profile.is_public ?? true);
      }

      setLoading(false);
    };

    loadProfile();
  }, [router, supabase]);

  const handleSave = async () => {
    if (!userId) return;

    setMessage("");
    setSaving(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      display_name: displayName,
      avatar_url: avatarUrl,
      bio,
      gender,
      age_group: ageGroup,
      is_public: isPublic,
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
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          My Account
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#6f655c]">
          Manage your personal profile information.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#5a5149]">
              Email
            </label>
            <input
              value={email}
              disabled
              className="w-full rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-3 text-sm text-[#7b7067]"
            />
          </div>

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
              Avatar URL
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="https://..."
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
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Tell people a little about yourself"
            />
          </div>

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
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          <a
            href="/"
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
          >
            Back to Home
          </a>
        </div>

        {message && (
          <p className="mt-5 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}