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

type MatchRequest = {
  id: number;
  post_id: number;
  requester_user_id: string;
  post_owner_user_id: string;
  status: string;
  message: string | null;
  created_at: string;
  post?: {
    id: number;
    place_name: string | null;
    location: string | null;
    meeting_time: string | null;
  };
  requester_profile?: {
    display_name: string | null;
  } | null;
};

type Match = {
  id: number;
  post_id: number;
  user_a: string;
  user_b: string;
  status: string;
  created_at: string;
  post?: {
    id: number;
    place_name: string | null;
    location: string | null;
    meeting_time: string | null;
  };
};

type PostFilterType = "all" | "upcoming" | "expired";
type DashboardTab = "posts" | "received" | "sent" | "matches";

export default function DashboardPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MatchRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [postFilter, setPostFilter] = useState<PostFilterType>("all");
  const [tab, setTab] = useState<DashboardTab>("posts");

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
            "id, user_id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("match_requests")
          .select(
            "id, post_id, requester_user_id, post_owner_user_id, status, message, created_at, post:posts(id, place_name, location, meeting_time)"
          )
          .eq("post_owner_user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("match_requests")
          .select(
            "id, post_id, requester_user_id, post_owner_user_id, status, message, created_at, post:posts(id, place_name, location, meeting_time)"
          )
          .eq("requester_user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("matches")
          .select(
            "id, post_id, user_a, user_b, status, created_at, post:posts(id, place_name, location, meeting_time)"
          )
          .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
          .order("created_at", { ascending: false }),
      ]);

      if (postsRes.error) {
        setMessage(postsRes.error.message);
        setLoading(false);
        return;
      }

      if (receivedRes.error) {
        setMessage(receivedRes.error.message);
        setLoading(false);
        return;
      }

      if (sentRes.error) {
        setMessage(sentRes.error.message);
        setLoading(false);
        return;
      }

      if (matchesRes.error) {
        setMessage(matchesRes.error.message);
        setLoading(false);
        return;
      }

      setPosts((postsRes.data as Post[]) || []);
      setReceivedRequests((receivedRes.data as MatchRequest[]) || []);
      setSentRequests((sentRes.data as MatchRequest[]) || []);
      setMatches((matchesRes.data as Match[]) || []);
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

    return {
      total,
      upcoming,
      expired,
      received: receivedRequests.length,
      sent: sentRequests.length,
      matches: matches.length,
    };
  }, [posts, receivedRequests, sentRequests, matches, now]);

  const filteredPosts = useMemo(() => {
    if (postFilter === "all") return posts;

    return posts.filter((post) => {
      if (!post.meeting_time) return postFilter === "expired";
      const isUpcoming = new Date(post.meeting_time) >= now;
      return postFilter === "upcoming" ? isUpcoming : !isUpcoming;
    });
  }, [posts, postFilter, now]);

  const getPostStatus = (meetingTime: string | null) => {
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

  const handleRequestAction = async (
    requestId: number,
    nextStatus: "accepted" | "rejected"
  ) => {
    setMessage("");

    const request = receivedRequests.find((item) => item.id === requestId);
    if (!request) return;

    const { error: updateError } = await supabase
      .from("match_requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .eq("post_owner_user_id", userId);

    if (updateError) {
      setMessage(updateError.message);
      return;
    }

    if (nextStatus === "accepted") {
      const { error: matchError } = await supabase.from("matches").insert({
        post_id: request.post_id,
        user_a: request.post_owner_user_id,
        user_b: request.requester_user_id,
        status: "active",
      });

      if (matchError) {
        setMessage(matchError.message);
        return;
      }

      setMatches((prev) => [
        {
          id: Date.now(),
          post_id: request.post_id,
          user_a: request.post_owner_user_id,
          user_b: request.requester_user_id,
          status: "active",
          created_at: new Date().toISOString(),
          post: request.post,
        },
        ...prev,
      ]);
    }

    setReceivedRequests((prev) =>
      prev.map((item) =>
        item.id === requestId ? { ...item, status: nextStatus } : item
      )
    );

    setMessage(
      nextStatus === "accepted" ? "Request accepted." : "Request rejected."
    );
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
                Manage your posts, requests, and matches.
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
            <p className="text-sm text-[#7b7067]">My Posts</p>
            <p className="mt-2 text-3xl font-semibold">{stats.total}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
            <p className="text-sm text-[#7b7067]">Requests Received</p>
            <p className="mt-2 text-3xl font-semibold">{stats.received}</p>
          </div>

          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-5 shadow-sm">
            <p className="text-sm text-[#7b7067]">Matches</p>
            <p className="mt-2 text-3xl font-semibold">{stats.matches}</p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {(["posts", "received", "sent", "matches"] as DashboardTab[]).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    tab === item
                      ? "bg-[#a48f7a] text-white"
                      : "border border-[#dccfc2] bg-[#f4ece4] text-[#5a5149] hover:bg-[#ede3da]"
                  }`}
                >
                  {item === "posts" && "My Posts"}
                  {item === "received" && "Requests Received"}
                  {item === "sent" && "Requests Sent"}
                  {item === "matches" && "Matches"}
                </button>
              )
            )}
          </div>
        </div>

        {tab === "posts" && (
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {(["all", "upcoming", "expired"] as PostFilterType[]).map(
                (item) => (
                  <button
                    key={item}
                    onClick={() => setPostFilter(item)}
                    className={`rounded-xl px-4 py-2 text-sm transition ${
                      postFilter === item
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
                )
              )}
            </div>
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
            Loading...
          </div>
        ) : null}

        {!loading && tab === "posts" && (
          <div className="space-y-5">
            {filteredPosts.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
                No posts.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const mapUrl =
                  post.latitude !== null && post.longitude !== null
                    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
                    : "";

                const status = getPostStatus(post.meeting_time);

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
        )}

        {!loading && tab === "received" && (
          <div className="space-y-5">
            {receivedRequests.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
                No received requests.
              </div>
            ) : (
              receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm"
                >
                  <p className="text-lg font-semibold text-[#2f2a26]">
                    📍 {request.post?.place_name || request.post?.location || "Meetup"}
                  </p>

                  <p className="mt-2 text-sm text-[#6f655c]">
                    Status: {request.status}
                  </p>

                  {request.post?.meeting_time && (
                    <p className="mt-1 text-sm text-[#6f655c]">
                      ⏰ {new Date(request.post.meeting_time).toLocaleString()}
                    </p>
                  )}

                  {request.message && (
                    <p className="mt-3 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#5a5149]">
                      {request.message}
                    </p>
                  )}

                  {request.status === "pending" && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleRequestAction(request.id, "accepted")}
                        className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#927d69]"
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => handleRequestAction(request.id, "rejected")}
                        className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && tab === "sent" && (
          <div className="space-y-5">
            {sentRequests.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
                No sent requests.
              </div>
            ) : (
              sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm"
                >
                  <p className="text-lg font-semibold text-[#2f2a26]">
                    📍 {request.post?.place_name || request.post?.location || "Meetup"}
                  </p>

                  <p className="mt-2 text-sm text-[#6f655c]">
                    Status: {request.status}
                  </p>

                  {request.post?.meeting_time && (
                    <p className="mt-1 text-sm text-[#6f655c]">
                      ⏰ {new Date(request.post.meeting_time).toLocaleString()}
                    </p>
                  )}

                  {request.message && (
                    <p className="mt-3 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#5a5149]">
                      {request.message}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {!loading && tab === "matches" && (
          <div className="space-y-5">
            {matches.length === 0 ? (
              <div className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 text-center text-[#7b7067] shadow-sm">
                No matches yet.
              </div>
            ) : (
              matches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-[1.5rem] border border-[#e7ddd2] bg-[#fffaf5] p-6 shadow-sm"
                >
                  <p className="text-lg font-semibold text-[#2f2a26]">
                    📍 {match.post?.place_name || match.post?.location || "Meetup"}
                  </p>

                  <p className="mt-2 text-sm text-[#6f655c]">
                    Status: {match.status}
                  </p>

                  {match.post?.meeting_time && (
                    <p className="mt-1 text-sm text-[#6f655c]">
                      ⏰ {new Date(match.post.meeting_time).toLocaleString()}
                    </p>
                  )}

                  <p className="mt-3 text-xs text-[#9b8f84]">
                    Matched at {new Date(match.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}