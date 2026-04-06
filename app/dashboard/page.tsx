"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type Post = {
  id: number;
  user_id: string;
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

type FilterType = "all" | "upcoming" | "expired";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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

      const { data, error } = await supabase
        .from("posts")
        .select(
          "id, user_id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      setPosts(data || []);
      setLoading(false);
    };

    loadDashboard();
  }, [router, supabase]);

  const now = new Date();

  const stats = useMemo(() => {
    const total = posts.length;
    const upcoming = posts.filter((post) => {
      if (!post.meeting_time) return false;
      return new Date(post.meeting_time) >= now;
    }).length;

    const expired = posts.filter((post) => {
      if (!post.meeting_time) return false;
      return new Date(post.meeting_time) < now;
    }).length;

    return { total, upcoming, expired };
  }, [posts, now]);

  const filteredPosts = useMemo(() => {
    if (filter === "all") return posts;

    return posts.filter((post) => {
      if (!post.meeting_time) return filter === "expired";
      const isUpcoming = new Date(post.meeting_time) >= now;
      return filter === "upcoming" ? isUpcoming : !isUpcoming;
    });
  }, [posts, filter, now]);

  const getStatus = (meetingTime: string | null) => {
    if (!meetingTime) {
      return {
        label: "No time",
        className: "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]",
      };
    }

    const isUpcoming = new Date(meetingTime) >= now;

    return isUpcoming
      ? {
          label: "Upcoming",
          className: "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]",
        }
      : {
          label: "Expired",
          className: "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]",
        };
  };

  const handleDeletePost = async (postId: number) => {
    const confirmed = window.confirm("Delete this meetup?");
    if (!confirmed) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userId);

    if (error) {
      setMessage(error.message);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
    setMessage("Meetup deleted.");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
                Dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#2f2a26]">
                My Meetups
              </h1>
              <p className="mt-2 text-sm text-[#6f655c]">
                Manage your meetup posts in one place.
              </p>
            </div>

            <a
              href="/write"
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Create Meetup
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
            <p className="text-sm text-[#7b7067]">Total Posts</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
            <p className="text-sm text-[#7b7067]">Upcoming</p>
            <p className="mt-2 text-3xl font-semibold">{stats.upcoming}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
            <p className="text-sm text-[#7b7067]">Expired</p>
            <p className="mt-2 text-3xl font-semibold">{stats.expired}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(["all", "upcoming", "expired"] as FilterType[]).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`rounded-xl px-4 py-2 text-sm transition ${
                  filter === item
                    ? "bg-[#a48f7a] text-white"
                    : "border border-[#dccfc2] bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
                }`}
              >
                {item === "all"
                  ? "All"
                  : item === "upcoming"
                  ? "Upcoming"
                  : "Expired"}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </div>
        )}

        <div className="space-y-5">
          {loading ? (
            <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
              Loading...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
              No meetups in this category.
            </div>
          ) : (
            filteredPosts.map((post) => {
              const mapUrl =
                post.latitude !== null && post.longitude !== null
                  ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
                  : "";

              const status = getStatus(post.meeting_time);

              return (
                <div
                  key={post.id}
                  className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-[#2f2a26]">
                          📍 {post.place_name || post.location || "Location not set"}
                        </p>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      {post.location && (
                        <p className="mt-2 line-clamp-1 text-sm text-[#6f655c]">
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

                      <div className="mt-4 text-xs text-[#9b8f84]">
                        Created at {new Date(post.created_at).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={`/posts/${post.id}`}
                        className="rounded-xl bg-[#6b5f52] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5b5046]"
                      >
                        View
                      </a>

                      <a
                        href={`/write/${post.id}`}
                        className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                      >
                        Edit
                      </a>

                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                        >
                          Map
                        </a>
                      )}

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}