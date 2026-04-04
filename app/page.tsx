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
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 42, marginBottom: 12 }}>Neonadri</h1>

      <p style={{ fontSize: 20, color: "#555", marginBottom: 30 }}>
        Do you want to meet someone? Try Neonadri.
      </p>

      {userEmail ? (
        <>
          <button onClick={handleLogout}>Log Out</button>
          <p style={{ marginTop: 10 }}>Logged in as: {userEmail}</p>

          <div style={{ marginTop: 16, marginBottom: 40 }}>
            <a href="/dashboard" style={{ marginRight: 8 }}>
              <button>Go to Dashboard</button>
            </a>

            <a href="/write">
              <button>Write a Post</button>
            </a>
          </div>
        </>
      ) : (
        <div style={{ marginBottom: 40 }}>
          <a href="/login" style={{ marginRight: 10 }}>
            <button>Log In</button>
          </a>

          <a href="/signup">
            <button>Sign Up</button>
          </a>
        </div>
      )}

      {message && <p>{message}</p>}

      <div style={{ marginTop: 50 }}>
        <h2>Recent Posts</h2>

        {posts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: "1px solid #ccc",
                padding: 16,
                marginBottom: 16,
                borderRadius: 8,
              }}
            >
              <h3 style={{ marginBottom: 8 }}>
                <a
                  href={`/posts/${post.id}`}
                  style={{ color: "black", textDecoration: "none" }}
                >
                  {post.title}
                </a>
              </h3>

              <p style={{ marginBottom: 8 }}>{post.content}</p>

              <small>{new Date(post.created_at).toLocaleString()}</small>
            </div>
          ))
        )}
      </div>
    </main>
  );
}