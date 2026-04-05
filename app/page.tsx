"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";
import HomePostsMap from "./components/HomePostsMap";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  location: string | null;
  meeting_time: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  meeting_purpose: string | null;
  payment_amount: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function HomePage() {
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select(
          "id, title, content, created_at, location, meeting_time, target_gender, target_age_group, meeting_purpose, payment_amount, latitude, longitude"
        )
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    loadPosts();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26] px-6 py-10">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-6">Neonadri</h1>

        <div className="mb-10">
          <HomePostsMap posts={posts} />
        </div>

        <div className="grid gap-5">
          {posts.map((post) => (
            <div key={post.id} className="p-5 bg-white rounded-xl shadow">

              <a href={`/posts/${post.id}`}>
                <h2 className="text-xl font-semibold">{post.title}</h2>
              </a>

              <div className="text-sm mt-2 space-y-1 text-gray-600">
                {post.location && <p>📍 {post.location}</p>}
                {post.meeting_time && (
                  <p>🕒 {new Date(post.meeting_time).toLocaleString()}</p>
                )}
                {post.meeting_purpose && (
                  <p>🎯 {post.meeting_purpose}</p>
                )}
                {post.payment_amount && (
                  <p>💰 {post.payment_amount}</p>
                )}
              </div>

              <p className="mt-3 text-sm">
                {post.content.slice(0, 120)}...
              </p>

            </div>
          ))}
        </div>
      </div>
    </main>
  );
}