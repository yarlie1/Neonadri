"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function WritePage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
    };

    checkUser();
  }, [router, supabase]);

  const handleCreatePost = async () => {
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setMessage("Please enter both title and content.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("posts").insert({
      user_id: userId,
      title,
      content,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
          Neonadri
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          Write a Post
        </h1>

        <p className="mt-3 text-sm leading-7 text-[#6f655c]">
          Share a thought, story, or moment with the community.
        </p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="min-h-[220px] w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
            placeholder="Write your content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={handleCreatePost}
            disabled={loading || !userId}
            className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Post"}
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