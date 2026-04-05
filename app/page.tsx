"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  location: string | null;
  meeting_time: string | null;
  target_gender: string | null;
  target_age_group: string | null;
};

export default function HomePage() {
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
          "id, title, content, created_at, location, meeting_time, target_gender, target_age_group"
        )
        .order("created_at", { ascending: false });

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
      <section className="mx-auto max-w-5xl px-6 py-12 md:py-14">
        <div className="mb-14 rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
            Neonadri
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#2f2a26] md:text-6xl">
            Do you want to
            <br />
            meet someone?
            <span className="mt-2 block text-[#8d7763]">Try Neonadri.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-[#6f655c] md:text-lg">
            Discover people, share posts, and build connections in a clean,
            simple space that feels comfortable from the first click.
          </p>

          {userEmail ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/dashboard"
                className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
              >
                Dashboard
              </a>

              <a
                href="/write"
                className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Write a Post
              </a>

              <button
                onClick={handleLogout}
                className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
              >
                Log Out
              </button>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-5 py-4 text-sm text-[#6b5f52]">
              Sign up or log in from the top navigation to start posting and
              connecting.
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-[#2f2a26] md:text-3xl">
            Recent Posts
          </h2>

          <p className="mt-2 text-sm text-[#7b7067]">
            See what people are sharing right now.
          </p>

          {posts.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center shadow-sm">
              <p className="text-[#7b7067]">No posts yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {posts.map((post) => {
                const mapUrl = post.location
                  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      post.location
                    )}`
                  : "";

                return (
                  <div
                    key={post.id}
                    className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(80,60,40,0.08)]"
                  >
                    <a href={`/posts/${post.id}`} className="block">
                      <h3 className="text-xl font-semibold text-[#2f2a26]">
                        {post.title}
                      </h3>

                      <div className="mt-3 space-y-1 text-sm text-[#6f655c]">
                        {post.location && <p>Location: {post.location}</p>}
                        {post.meeting_time && (
                          <p>
                            Time: {new Date(post.meeting_time).toLocaleString()}
                          </p>
                        )}
                        {post.target_gender && (
                          <p>Target Gender: {post.target_gender}</p>
                        )}
                        {post.target_age_group && (
                          <p>Target Age Group: {post.target_age_group}</p>
                        )}
                      </div>

                      <p className="mt-4 text-sm leading-7 text-[#6f655c]">
                        {post.content.length > 180
                          ? `${post.content.slice(0, 180)}...`
                          : post.content}
                      </p>

                      <div className="mt-4 text-xs text-[#9b8f84]">
                        {new Date(post.created_at).toLocaleString()}
                      </div>
                    </a>

                    {post.location && (
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