"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  created_at: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  latitude: number | null;
  longitude: number | null;
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/");
        return;
      }

      const { data: postData } = await supabase
        .from("posts")
        .select(
          "id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
        )
        .order("created_at", { ascending: false });

      setPosts(postData || []);
    };

    loadDashboard();
  }, [router, supabase]);

  const handleDeletePost = async (postId: number) => {
    const confirmed = window.confirm("Delete this meetup?");
    if (!confirmed) return;

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Meetup deleted successfully.");
    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
            Dashboard
          </p>

          <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
            My Meetups
          </h1>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/write"
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Create Meetup
            </a>

            <a
              href="/"
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Back to Home
            </a>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
          )}
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
          <h2 className="text-2xl font-semibold text-[#2f2a26]">Meetup List</h2>

          <div className="mt-6 space-y-5">
            {posts.length === 0 ? (
              <p className="text-[#6f655c]">No meetups yet.</p>
            ) : (
              posts.map((post) => {
                const mapUrl =
                  post.latitude !== null && post.longitude !== null
                    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
                    : "";

                return (
                  <div
                    key={post.id}
                    className="rounded-[1.5rem] border border-[#e7ddd2] bg-white p-6 shadow-sm"
                  >
                    <a href={`/posts/${post.id}`} className="block">
                      <p className="text-lg font-semibold text-[#2f2a26]">
                        📍 {post.place_name || post.location || "Location not set"}
                      </p>

                      {post.location && (
                        <p className="mt-2 text-sm text-[#6f655c]">
                          {post.location}
                        </p>
                      )}

                      <div className="mt-3 space-y-1 text-sm text-[#6f655c]">
                        {post.meeting_time && (
                          <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
                        )}
                        {post.meeting_purpose && <p>🎯 {post.meeting_purpose}</p>}
                        {(post.target_gender || post.target_age_group) && (
                          <p>
                            👤 {post.target_gender || "Any"} /{" "}
                            {post.target_age_group || "Any"}
                          </p>
                        )}
                        {post.benefit_amount && <p>🎁 {post.benefit_amount}</p>}
                      </div>
                    </a>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <a
                        href={`/posts/${post.id}`}
                        className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#5b5046]"
                      >
                        View
                      </a>

                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                        >
                          Open Map
                        </a>
                      )}

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
