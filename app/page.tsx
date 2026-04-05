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
  benefit_amount: string | null;
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
        .select("*")
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    loadPosts();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <section className="mx-auto max-w-5xl px-6 py-12">

        <h1 className="text-4xl font-semibold mb-10">
          Meet people nearby ✨
        </h1>

        {/* 지도 */}
        <div className="mb-10">
          <HomePostsMap posts={posts} />
        </div>

        {/* 게시글 */}
        <div className="grid gap-5">
          {posts.map((post) => {
            const mapUrl =
              post.latitude !== null && post.longitude !== null
                ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
                : "";

            return (
              <div key={post.id} className="p-5 bg-white rounded-xl shadow">

                <a href={`/posts/${post.id}`}>
                  <h2 className="text-xl font-semibold">{post.title}</h2>

                  <div className="text-sm mt-2 space-y-1">
                    {post.location && <p>📍 {post.location}</p>}
                    {post.meeting_time && (
                      <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
                    )}
                    {post.meeting_purpose && <p>🎯 {post.meeting_purpose}</p>}
                    {post.payment_amount && <p>💵 Payment: {post.payment_amount}</p>}
                    {post.benefit_amount && <p>🎁 Benefit: {post.benefit_amount}</p>}
                  </div>

                  <p className="mt-3 text-sm text-gray-600">
                    {post.content.slice(0, 120)}...
                  </p>
                </a>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    className="inline-block mt-3 text-sm text-blue-600"
                  >
                    Open Map
                  </a>
                )}
              </div>
            );
          })}
        </div>

      </section>
    </main>
  );
}