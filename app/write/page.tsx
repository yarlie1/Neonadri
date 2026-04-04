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

    setMessage("Post created successfully.");
    setTitle("");
    setContent("");
    setLoading(false);

    router.push("/dashboard");
  };

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>Write a Post</h1>

      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 500,
            marginBottom: 12,
            padding: 8,
          }}
        />

        <br />

        <textarea
          placeholder="Write your content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          style={{
            width: "100%",
            maxWidth: 700,
            padding: 8,
          }}
        />

        <div style={{ marginTop: 16 }}>
          <button
            onClick={handleCreatePost}
            disabled={loading || !userId}
            style={{ marginRight: 8 }}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>

          <a href="/dashboard">
            <button>Back to Dashboard</button>
          </a>
        </div>

        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>
    </main>
  );
}