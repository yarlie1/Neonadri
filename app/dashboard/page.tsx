"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function Dashboard() {
  const supabase = createClient();

  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("posts").select("*");
      setPosts(data || []);
    };
    load();
  }, [supabase]);

  const deletePost = async (id: number) => {
    await supabase.from("posts").delete().eq("id", id);
    setPosts(posts.filter((p) => p.id !== id));
  };

  return (
    <main className="p-10 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">My Posts</h1>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="p-5 bg-white shadow rounded-xl">

            <h2 className="font-semibold">{post.title}</h2>

            <p className="text-sm text-gray-600 mt-2">
              {post.location}
            </p>

            <p className="text-sm">💵 {post.payment_amount}</p>
            <p className="text-sm">🎁 {post.benefit_amount}</p>

            <div className="mt-3 flex gap-3">
              <a
                href={`/posts/${post.id}`}
                className="text-blue-600 text-sm"
              >
                View
              </a>

              <button
                onClick={() => deletePost(post.id)}
                className="text-red-500 text-sm"
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