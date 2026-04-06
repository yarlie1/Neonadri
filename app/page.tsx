
"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Post = {
  id: number;
  created_at: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  meeting_purpose: string | null;
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
        .select(
          "id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
        )
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    loadPosts();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <section className="mx-auto max-w-5xl px-6 py-8 md:py-10">
        <div>
          <h1 className="text-2xl font-semibold text-[#2f2a26] md:text-3xl">
            Recent Meetups
          </h1>

          <p className="mt-2 text-sm text-[#7b7067]">
            Browse the latest meetup posts.
          </p>

          {posts.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center shadow-sm">
              <p className="text-[#7b7067]">No meetups yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {posts.map((post) => {
                const mapUrl =
                  post.latitude !== null && post.longitude !== null
                    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
                    : "";

                return (
                  <div
                    key={post.id}
                    className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(80,60,40,0.08)]"
                  >
                    <a href={`/posts/${post.id}`} className="block">
                      <p className="text-lg font-semibold text-[#2f2a26]">
                        📍 {post.place_name || post.location || "Location not set"}
                      </p>

                      {post.location && (
                        <p className="mt-2 text-sm text-[#6f655c] line-clamp-1">
                          {post.location}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-sm text-[#6f655c]">
                        {post.meeting_time && (
                          <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
                        )}
                        {post.meeting_purpose && <p>🎯 {post.meeting_purpose}</p>}
                        {(post.target_gender || post.target_age_group) && (
                          <p>
                            👤 {post.target_gender || "Any"} /{" "}
                            {post.target_age_group || "Any"}
                          </p>
                        )}
                        {post.benefit_amount && <p>🎁 {post.benefit_amount}</p>}
                      </div>

                      <div className="mt-4 text-xs text-[#9b8f84]">
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </a>

                    {mapUrl && (
                      <div className="mt-4">
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}