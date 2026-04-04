"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function HomePage() {
  const supabase = createClient();

  const [userEmail, setUserEmail] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUserEmail(data.user?.email ?? "");
    };

    const loadPosts = async () => {
      const { data } = await supabase
        .from("posts")
        .select("id, title, content, created_at")
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
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    } else {
      setUserEmail("");
      setMessage("Logged out successfully.");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <section className="mx-auto max-w-5xl px-6 py-16">
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
            <div className="mt-10">
              <p className="mb-5 text-sm text-[#7b7067]">
                Logged in as{" "}
                <span className="font-semibold text-[#2f2a26]">{userEmail}</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
                >
                  Dashboard
                </a>

                <a
                  href="/write"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                >
                  Write a Post
                </a>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
              >
                Log In
              </a>

              <a
                href="/signup"
                className="inline-flex items-center justify-center rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Sign Up
              </a>
            </div>
          )}

          {message && (
            <p className="mt-5 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
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
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(80,60,40,0.08)]"
                >
                  <h3 className="text-xl font-semibold text-[#2f2a26]">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-[#6f655c]">
                    {post.content.length > 180
                      ? `${post.content.slice(0, 180)}...`
                      : post.content}
                  </p>

                  <div className="mt-4 text-xs text-[#9b8f84]">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}