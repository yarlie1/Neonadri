"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }
    };

    loadProfile();
  }, [router, supabase]);

  const handleSaveProfile = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }

    setLoading(false);
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Dashboard</h1>

      <p>Welcome: {fullName || userEmail}</p>
      <p>Email: {userEmail}</p>

      <div style={{ marginTop: 20 }}>
        <h2>Edit Profile</h2>

        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ marginRight: 8 }}
        />

        <button onClick={handleSaveProfile} disabled={loading || !userId}>
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </main>
  );
}