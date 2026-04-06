"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import HomePostsMap from "../components/HomePostsMap";
import TopNav from "../components/TopNav";

type Post = {
  id: number;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  latitude: number | null;
  longitude: number | null;
  meeting_purpose?: string | null;
  target_gender?: string | null;
  target_age_group?: string | null;
  benefit_amount?: string | null;
};

export default function MapPage() {
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    const loadPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select(
          "id, place_name, location, meeting_time, latitude, longitude, meeting_purpose, target_gender, target_age_group, benefit_amount"
        )
        .order("meeting_time", { ascending: true });

      setPosts(data || []);
    };

    loadUser();
    loadPosts();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? "");
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <TopNav userEmail={userEmail} onLogout={handleLogout} />

      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-8">
          <h1 className="text-3xl font-semibold text-[#2f2a26]">
            Meetups on the Map
          </h1>
          <p className="mt-2 text-sm text-[#6f655c]">
            Tap a pin to see meetup details.
          </p>
        </div>

        <div className="overflow-hidden rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-3 shadow-sm">
          <HomePostsMap posts={posts} />
        </div>
      </div>
    </main>
  );
}