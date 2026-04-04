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
    const confirmed = window.confirm("Delete this post?");
    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      setPostMessage(error.message);
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
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
            Dashboard
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
            Welcome, {fullName || userEmail}
          </h1>

          <p className="mt-3 text-sm leading-7 text-[#6f655c]">
            Email: {userEmail}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/write"
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Write a New Post
            </a>

            <a
              href="/"
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Back to Home
            </a>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
          <h2 className="text-2xl font-semibold text-[#2f2a26]">Edit Profile</h2>

          <div className="mt-5 flex flex-col gap-4 md:flex-row">
            <input
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <button
              onClick={handleSaveProfile}
              disabled={loading || !userId}
              className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
          <h2 className="text-2xl font-semibold text-[#2f2a26]">Your Posts</h2>

          {postMessage && (
            <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {postMessage}
            </p>
          )}

          <div className="mt-6 space-y-5">
            {posts.length === 0 ? (
              <p className="text-[#6f655c]">No posts yet.</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-[1.5rem] border border-[#e7ddd2] bg-white p-6 shadow-sm"
                >
                  {editingPostId === post.id ? (
                    <div className="space-y-4">
                      <input
                        className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      />
                      <textarea
                        className="min-h-[180px] w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm text-[#2f2a26]"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={handleUpdatePost}
                          className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
                        >
                          Save Edit
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-semibold text-[#2f2a26]">
                        <a href={`/posts/${post.id}`}>{post.title}</a>
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-[#6f655c]">
                        {post.content}
                      </p>
                      <p className="mt-4 text-xs text-[#9b8f84]">
                        {new Date(post.created_at).toLocaleString()}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <button
                          onClick={() => handleStartEdit(post)}
                          className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}