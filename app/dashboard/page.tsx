"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postMessage, setPostMessage] = useState("");

  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.full_name) {
        setFullName(profile.full_name);
      }

      await loadPosts();
    };

    loadDashboard();
  }, [router, supabase]);

  const loadPosts = async () => {
    const { data: postData } = await supabase
      .from("posts")
      .select("id, title, content, created_at")
      .order("created_at", { ascending: false });

    setPosts(postData || []);
  };

  const handleSaveProfile = async () => {
    setMessage("");
    setLoading(true);

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Profile updated successfully.");
    }

    setLoading(false);
  };

  const handleDeletePost = async (postId: number) => {
    if (!userId) {
      alert("User not loaded yet.");
      return;
    }

    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (error) {
      alert(error.message);
      return;
    }

    setPostMessage("Post deleted successfully.");
    await loadPosts();
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditContent(post.content);
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
  };

  const handleUpdatePost = async () => {
    if (!editingPostId) return;

    if (!editTitle.trim() || !editContent.trim()) {
      setPostMessage("Please enter both title and content.");
      return;
    }

    const { error } = await supabase
      .from("posts")
      .update({
        title: editTitle,
        content: editContent,
      })
      .eq("id", editingPostId);

    if (error) {
      setPostMessage(error.message);
      return;
    }

    setPostMessage("Post updated successfully.");
    setEditingPostId(null);
    setEditTitle("");
    setEditContent("");
    await loadPosts();
  };

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1>Dashboard</h1>

      <p>Welcome: {fullName || userEmail}</p>
      <p>Email: {userEmail}</p>
      {fullName && <p>Name: {fullName}</p>}

      <div style={{ marginTop: 20 }}>
        <a href="/write">
          <button>Write a New Post</button>
        </a>
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>Edit Profile</h2>
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <button onClick={handleSaveProfile} disabled={loading || !userId}>
          {loading ? "Saving..." : "Save"}
        </button>
        {message && <p style={{ marginTop: 12 }}>{message}</p>}
      </div>

      <div style={{ marginTop: 40 }}>
        <h2>Posts</h2>

        {postMessage && <p style={{ marginTop: 12 }}>{postMessage}</p>}

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
              {editingPostId === post.id ? (
                <div>
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={{ width: "100%", maxWidth: 400, marginBottom: 8 }}
                  />
                  <br />
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={6}
                    style={{ width: "100%", maxWidth: 600 }}
                  />
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={handleUpdatePost}
                      style={{ marginRight: 8 }}
                    >
                      Save Edit
                    </button>
                    <button onClick={handleCancelEdit}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3>
                    <a
                      href={`/posts/${post.id}`}
                      style={{ color: "black", textDecoration: "none" }}
                    >
                      {post.title}
                    </a>
                  </h3>
                  <p>{post.content}</p>
                  <small>{new Date(post.created_at).toLocaleString()}</small>

                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => handleStartEdit(post)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeletePost(post.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
}