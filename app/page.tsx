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
    <main className="min-h-screen bg-gradient-to-b from-stone-50 via-stone-100 to-stone-50 text-stone-800">
      <section className="mx-auto max-w-5xl px-6 py-16">
        {/* HERO */}
        <div className="mb-14 rounded-[2rem] border border-stone-200 bg-white p-8 shadow-sm md:p-12">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-stone-400">
            Neonadri
          </p>

          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-stone-900 md:text-6xl">
            Do you want to
            <br />
            meet someone?
            <span className="mt-2 block text-stone-700">
              Try Neonadri.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-stone-600 md:text-lg">
            Discover people, share posts, and build connections in a clean,
            simple space that feels comfortable from the first click.
          </p>

          {userEmail ? (
            <div className="mt-10">
              <p className="mb-5 text-sm text-stone-500">
                Logged in as{" "}
                <span className="font-semibold text-stone-800">
                  {userEmail}
                </span>
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="rounded-2xl bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                >
                  Dashboard
                </a>

                <a
                  href="/write"
                  className="rounded-2xl bg-stone-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
                >
                  Write a Post
                </a>

                <button
                  onClick={handleLogout}
                  className="rounded-2xl border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="/login"
                className="rounded-2xl bg-stone-800 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Log In
              </a>

              <a
                href="/signup"
                className="rounded-2xl bg-stone-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
              >
                Sign Up
              </a>
            </div>
          )}

          {message && (
            <p className="mt-5 rounded-2xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-700">
              {message}
            </p>
          )}
        </div>

        {/* POSTS */}
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 md:text-3xl">
            Recent Posts
          </h2>

          <p className="mt-2 text-sm text-stone-500">
            See what people are sharing right now.
          </p>

          {posts.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] border border-stone-200 bg-white p-8 text-center shadow-sm">
              <p className="text-stone-500">No posts yet.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <h3 className="text-xl font-semibold text-stone-900">
                    {post.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {post.content.length > 180
                      ? `${post.content.slice(0, 180)}...`
                      : post.content}
                  </p>

                  <div className="mt-4 text-xs text-stone-400">
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