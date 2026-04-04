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

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setMessage("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Logged out successfully.");
      setUserEmail("");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="mb-12 rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 md:p-12">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Neonadri
          </p>

          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Do you want to meet someone?
            <span className="block text-blue-600">Try Neonadri.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Discover people, share posts, and build connections in a simple,
            clean space designed to feel easy from the first click.
          </p>

          {userEmail ? (
            <div className="mt-8">
              <p className="mb-4 text-sm text-slate-600">
                Logged in as{" "}
                <span className="font-semibold text-slate-900">{userEmail}</span>
              </p>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/dashboard"
                  className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Go to Dashboard
                </a>

                <a
                  href="/write"
                  className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Write a Post
                </a>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/login"
                className="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Log In
              </a>

              <a
                href="/signup"
                className="inline-flex items-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Sign Up
              </a>
            </div>
          )}

          {message && (
            <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
              {message}
            </p>
          )}
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Recent Posts
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                See what people are sharing right now.
              </p>
            </div>
          </div>

          {posts.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
              <p className="text-slate-600">No posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {posts.map((post) => (
                <a
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {post.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {post.content}
                  </p>

                  <div className="mt-4 text-xs text-slate-400">
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