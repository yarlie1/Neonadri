"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  target_gender: string | null;
  target_age_group: string | null;
  created_at: string;
};

type MatchRequestRow = {
  id: number;
  post_id: number;
  requester_user_id: string;
  receiver_user_id: string;
  status: string;
  created_at: string;
};

type MatchRow = {
  id: number;
  post_id: number;
  user_a: string;
  user_b: string;
  status: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type DashboardTab = "posts" | "received" | "sent" | "matches";
type PostFilter = "all" | "upcoming" | "expired";

const getPurposeIcon = (purpose: string | null) => {
  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return "☕";
    case "Meal":
      return "🍽";
    case "Dessert":
      return "🍰";
    case "Walk":
      return "🚶";
    case "Jogging":
      return "🏃";
    case "Yoga":
      return "🧘";
    case "Movie":
    case "Theater":
      return "🎬";
    case "Karaoke":
      return "🎤";
    case "Board Games":
      return "🎲";
    case "Gaming":
      return "🎮";
    case "Bowling":
      return "🎳";
    case "Arcade":
      return "🎯";
    case "Study":
      return "📚";
    case "Work Together":
    case "Work":
      return "💻";
    case "Book Talk":
    case "Book":
      return "📖";
    case "Photo Walk":
    case "Photo":
      return "📷";
    default:
      return "✨";
  }
};

const formatDuration = (minutes: number | null) => {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getPostStatus = (meetingTime: string | null) => {
  if (!meetingTime) return "Upcoming";
  const now = new Date();
  const target = new Date(meetingTime);
  return target.getTime() >= now.getTime() ? "Upcoming" : "Expired";
};

const getStatusBadgeClass = (status: string) => {
  const normalized = status.toLowerCase();

  if (normalized === "expired") {
    return "bg-[#f4ece4] text-[#8b7f74]";
  }

  if (normalized === "upcoming") {
    return "bg-[#efe7dc] text-[#6b5f52]";
  }

  if (normalized === "matched" || normalized === "accepted") {
    return "bg-[#efe7dc] text-[#6b5f52]";
  }

  if (normalized === "pending") {
    return "bg-[#f4ece4] text-[#7b7067]";
  }

  if (normalized === "rejected") {
    return "bg-[#f7f1ea] text-[#9b8f84]";
  }

  return "bg-[#f4ece4] text-[#7b7067]";
};

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<MatchRequestRow[]>([]);
  const [requestsSent, setRequestsSent] = useState<MatchRequestRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);

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

      const [postsRes, receivedRes, sentRes, matchesRes] = await Promise.all([
        supabase
          .from("posts")
          .select(
            "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("match_requests")
          .select("id, post_id, requester_user_id, receiver_user_id, status, created_at")
          .eq("receiver_user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("match_requests")
          .select("id, post_id, requester_user_id, receiver_user_id, status, created_at")
          .eq("requester_user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("matches")
          .select("id, post_id, user_a, user_b, status, created_at")
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);

      const nextPosts = (postsRes.data as PostRow[]) || [];
      const nextReceived = (receivedRes.data as MatchRequestRow[]) || [];
      const nextSent = (sentRes.data as MatchRequestRow[]) || [];
      const nextMatches = (matchesRes.data as MatchRow[]) || [];

      setPosts(nextPosts);
      setRequestsReceived(nextReceived);
      setRequestsSent(nextSent);
      setMatches(nextMatches);

      const relatedUserIds = Array.from(
        new Set([
          ...nextReceived.map((item) => item.requester_user_id),
          ...nextSent.map((item) => item.receiver_user_id),
          ...nextMatches.flatMap((item) => [item.user_a, item.user_b]),
        ])
      ).filter((id) => id !== user.id);

      if (relatedUserIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", relatedUserIds);

        const nextProfileMap: Record<string, string> = {};
        ((profilesData as ProfileRow[]) || []).forEach((profile) => {
          nextProfileMap[profile.id] = profile.display_name || "Unknown";
        });
        setProfileMap(nextProfileMap);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router, supabase]);

  const filteredPosts = useMemo(() => {
    if (postFilter === "all") return posts;
    return posts.filter((post) => {
      const status = getPostStatus(post.meeting_time).toLowerCase();
      return status === postFilter;
    });
  }, [posts, postFilter]);

  const pendingReceived = useMemo(
    () => requestsReceived.filter((item) => item.status === "pending").length,
    [requestsReceived]
  );

  const upcomingPostsCount = useMemo(
    () =>
      posts.filter((post) => getPostStatus(post.meeting_time) === "Upcoming")
        .length,
    [posts]
  );

  const deletePost = async (postId: number) => {
    const confirmed = window.confirm("Delete this meetup?");
    if (!confirmed) return;

    setDeletingPostId(postId);

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    setDeletingPostId(null);

    if (error) {
      alert(error.message);
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== postId));
  };

  const updateRequestStatus = async (
    requestId: number,
    nextStatus: "accepted" | "rejected"
  ) => {
    const { error } = await supabase
      .from("match_requests")
      .update({ status: nextStatus })
      .eq("id", requestId);

    if (error) {
      alert(error.message);
      return;
    }

    setRequestsReceived((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status: nextStatus } : item
      )
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-[#e7ddd2] bg-white p-8 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-sm">
          <div className="text-xs tracking-[0.35em] text-[#9b8f84]">
            DASHBOARD
          </div>
          <h1 className="mt-3 text-4xl font-semibold">My Meetups</h1>
          <p className="mt-2 text-[#6f655c]">
            Manage your posts, requests, and matches.
          </p>

          <div className="mt-6">
            <Link
              href="/write"
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Create Meetup
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">My Posts</div>
            <div className="mt-2 text-4xl font-semibold">{posts.length}</div>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">Requests</div>
            <div className="mt-2 text-4xl font-semibold">
              {requestsReceived.length}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">Matches</div>
            <div className="mt-2 text-4xl font-semibold">{matches.length}</div>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm">
            <div className="text-sm text-[#8b7f74]">Pending</div>
            <div className="mt-2 text-4xl font-semibold">{pendingReceived}</div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveTab("posts")}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeTab === "posts"
                  ? "bg-[#a48f7a] text-white"
                  : "bg-[#f4ece4] text-[#6b5f52]"
              }`}
            >
              My Posts
            </button>

            <button
              onClick={() => setActiveTab("received")}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeTab === "received"
                  ? "bg-[#a48f7a] text-white"
                  : "bg-[#f4ece4] text-[#6b5f52]"
              }`}
            >
              Requests Received
            </button>

            <button
              onClick={() => setActiveTab("sent")}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeTab === "sent"
                  ? "bg-[#a48f7a] text-white"
                  : "bg-[#f4ece4] text-[#6b5f52]"
              }`}
            >
              Requests Sent
            </button>

            <button
              onClick={() => setActiveTab("matches")}
              className={`rounded-xl px-4 py-2 text-sm ${
                activeTab === "matches"
                  ? "bg-[#a48f7a] text-white"
                  : "bg-[#f4ece4] text-[#6b5f52]"
              }`}
            >
              Matches
            </button>
          </div>
        </div>

        {activeTab === "posts" && (
          <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setPostFilter("all")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  postFilter === "all"
                    ? "bg-[#a48f7a] text-white"
                    : "bg-[#f4ece4] text-[#6b5f52]"
                }`}
              >
                All
              </button>

              <button
                onClick={() => setPostFilter("upcoming")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  postFilter === "upcoming"
                    ? "bg-[#a48f7a] text-white"
                    : "bg-[#f4ece4] text-[#6b5f52]"
                }`}
              >
                Upcoming
              </button>

              <button
                onClick={() => setPostFilter("expired")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  postFilter === "expired"
                    ? "bg-[#a48f7a] text-white"
                    : "bg-[#f4ece4] text-[#6b5f52]"
                }`}
              >
                Expired
              </button>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const postStatus = getPostStatus(post.meeting_time);

              const mapUrl = post.location
                ? post.location && post.location.length > 0
                  ? post.location
                  : ""
                : "";

              return (
                <div
                  key={post.id}
                  className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-base font-semibold">
                        {getPurposeIcon(post.meeting_purpose)}{" "}
                        {post.meeting_purpose || "Meetup"} ·{" "}
                        {formatDuration(post.duration_minutes)}
                      </div>

                      <div className="mt-1 truncate text-2xl font-semibold">
                        {post.place_name || post.location || "No place"}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          postStatus
                        )}`}
                      >
                        {postStatus}
                      </span>

                      {post.benefit_amount && (
                        <div className="rounded-2xl bg-gradient-to-br from-[#f6e7b2] to-[#e8c97a] px-4 py-2 text-sm font-semibold text-[#5a4a1f] shadow">
                          🪙 {post.benefit_amount}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 space-y-1">
                    {post.meeting_time && (
                      <div className="text-sm text-[#6f655c]">
                        ⏰ {formatTime(post.meeting_time)}
                      </div>
                    )}

                    {post.location && (
                      <div className="line-clamp-1 text-sm text-[#6f655c]">
                        📍 {post.location}
                      </div>
                    )}

                    <div className="text-sm text-[#6f655c]">
                      👤 {post.target_gender || "Any"} /{" "}
                      {post.target_age_group || "Any"}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      href={`/posts/${post.id}`}
                      className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
                    >
                      View
                    </Link>

                    <Link
                      href={`/write/${post.id}`}
                      className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
                    >
                      Edit
                    </Link>

                    {mapUrl && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          post.location || ""
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
                      >
                        Map
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      disabled={deletingPostId === post.id}
                      className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4] disabled:opacity-50"
                    >
                      {deletingPostId === post.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                {postFilter === "all"
                  ? "No meetups yet."
                  : postFilter === "upcoming"
                  ? "No upcoming meetups."
                  : "No expired meetups."}
              </div>
            )}
          </div>
        )}

        {activeTab === "received" && (
          <div className="space-y-4">
            {requestsReceived.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-[#2f2a26]">
                      Request for post #{item.post_id}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      From: {profileMap[item.requester_user_id] || "Unknown"}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      Status: {item.status}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                {item.status === "pending" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => updateRequestStatus(item.id, "accepted")}
                      className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateRequestStatus(item.id, "rejected")}
                      className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}

            {requestsReceived.length === 0 && (
              <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                No requests received.
              </div>
            )}
          </div>
        )}

        {activeTab === "sent" && (
          <div className="space-y-4">
            {requestsSent.map((item) => (
              <div
                key={item.id}
                className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold text-[#2f2a26]">
                      Request for post #{item.post_id}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      To: {profileMap[item.receiver_user_id] || "Unknown"}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      Status: {item.status}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}

            {requestsSent.length === 0 && (
              <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                No requests sent.
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            {matches.map((item) => {
              const otherUserId =
                item.user_a === userId ? item.user_b : item.user_a;

              return (
                <div
                  key={item.id}
                  className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-[#2f2a26]">
                        Match for post #{item.post_id}
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        With: {profileMap[otherUserId] || "Unknown"}
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        Status: {item.status}
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="rounded-[2rem] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                No matches yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}