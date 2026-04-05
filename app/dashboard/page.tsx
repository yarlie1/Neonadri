"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Dashboard() {
  const supabase = createClient();

  const [posts, setPosts] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      setPosts(data || []);
    };

    load();
  }, []);

  const handleDelete = async (id: number) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  const handleUpdate = async (id: number) => {
    await supabase
      .from("posts")
      .update({ content: editContent })
      .eq("id", id);

    setEditingId(null);
  };

  return (
    <main className="p-6 bg-[#f7f1ea] min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded shadow">

            <h2 className="font-semibold">{post.title}</h2>

            <div className="text-sm text-gray-600 space-y-1 mt-1">
              <p>📍 {post.location}</p>
              <p>🎯 {post.meeting_purpose}</p>
              <p>💰 {post.payment_amount}</p>
            </div>

            {editingId === post.id ? (
              <>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full mt-2 border p-2"
                />
                <button
                  onClick={() => handleUpdate(post.id)}
                  className="mt-2 bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Save
                </button>
              </>
            ) : (
              <p className="mt-2 text-sm">{post.content}</p>
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setEditingId(post.id);
                  setEditContent(post.content);
                }}
                className="text-blue-500"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(post.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}