"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  Coffee,
  UtensilsCrossed,
  CakeSlice,
  Footprints,
  PersonStanding,
  Clapperboard,
  Mic2,
  Gamepad2,
  BookOpen,
  BriefcaseBusiness,
  Book,
  Camera,
  Clock3,
  MapPin,
  UserRound,
  Coins,
  FileText,
  Inbox,
  Send,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  Eye,
  Map as MapIcon,
  Plus,
} from "lucide-react";

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
  post_owner_user_id: string;
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
  const className = "h-5 w-5 shrink-0 text-[#7b7067]";

  switch (purpose) {
    case "Coffee Chat":
    case "Coffee":
      return <Coffee className={className} />;
    case "Meal":
      return <UtensilsCrossed className={className} />;
    case "Dessert":
      return <CakeSlice className={className} />;
    case "Walk":
      return <Footprints className={className} />;
    case "Jogging":
    case "Yoga":
      return <PersonStanding className={className} />;
    case "Movie":
    case "Theater":
      return <Clapperboard className={className} />;
    case "Karaoke":
      return <Mic2 className={className} />;
    case "Board Games":
    case "Gaming":
    case "Bowling":
    case "Arcade":
      return <Gamepad2 className={className} />;
    case "Study":
      return <BookOpen className={className} />;
    case "Work Together":
    case "Work":
      return <BriefcaseBusiness className={className} />;
    case "Book Talk":
    case "Book":
      return <Book className={className} />;
    case "Photo Walk":
    case "Photo":
      return <Camera className={className} />;
    default:
      return <MapPin className={className} />;
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
    return "bg-[#f4ece4] text-[#8b7f74] border border-[#e7ddd2]";
  }

  if (normalized === "upcoming") {
    return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
  }

  if (normalized === "matched" || normalized === "accepted") {
    return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
  }

  if (normalized === "pending") {
    return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
  }

  if (normalized === "rejected") {
    return "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]";
  }

  return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
};

const parseBenefitAmount = (value: string | null) => {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
};

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[22px] border border-[#e7ddd2] bg-white px-4 py-4 shadow-sm">
      <div className="text-xs font-medium text-[#8b7f74]">{label}</div>
      <div className="mt-1.5 text-2xl font-bold tracking-[-0.02em] text-[#2f2a26]">
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-[#a48f7a] text-white"
          : "bg-[#f4ece4] text-[#6b5f52] hover:bg-[#ede3da]"
      }`}
    >
      {children}
    </button>
  );
}

function CompactActionButton({
  href,
  onClick,
  disabled,
  primary = false,
  children,
}: {
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  const className = `inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition ${
    primary
      ? "bg-[#a48f7a] text-white hover:bg-[#927d69]"
      : "border border-[#dccfc2] bg-white text-[#5a5149] hover:bg-[#f4ece4]"
  } ${disabled ? "opacity-50" : ""}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

function MiniPostPreview({ post }: { post?: PostRow }) {
  if (!post) {
    return (
      <div className="mt-3 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-3 text-sm text-[#8b7f74]">
        Post details unavailable
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-3">
      <div className="flex items-center gap-2 truncate text-base font-semibold text-[#2f2a26]">
        {getPurposeIcon(post.meeting_purpose)}
        <span className="truncate">{post.meeting_purpose || "Meetup"}</span>
        {formatDuration(post.duration_minutes) ? (
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {formatDuration(post.duration_minutes)}
          </span>
        ) : null}
      </div>

      <div className="mt-1 flex items-center gap-2 truncate text-sm text-[#8a7f74]">
        <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
        <span className="truncate">{post.place_name || post.location || "No place"}</span>
      </div>

      {post.meeting_time && (
        <div className="mt-1 flex items-center gap-2 text-sm text-[#8a7f74]">
          <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
          <span>{formatTime(post.meeting_time)}</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  const [posts, setPosts] = useState<PostRow[]>([]);
  const [requestsReceived, setRequestsReceived] = useState<MatchRequestRow[]>([]);
  const [requestsSent, setRequestsSent] = useState<MatchRequestRow[]>([]);
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, string>>({});
  const [postMap, setPostMap] = useState<Record<number, PostRow>>({});

  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const success = params.get("success");

    if (tab === "posts" || tab === "received" || tab === "sent" || tab === "matches") {
      setActiveTab(tab);
    }

    if (success === "1") {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
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
          .select(
            "id, post_id, requester_user_id, post_owner_user_id, status, created_at"
          )
          .eq("post_owner_user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("match_requests")
          .select(
            "id, post_id, requester_user_id, post_owner_user_id, status, created_at"
          )
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
          ...nextSent.map((item) => item.post_owner_user_id),
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

      const relatedPostIds = Array.from(
        new Set([
          ...nextReceived.map((item) => item.post_id),
          ...nextSent.map((item) => item.post_id),
          ...nextMatches.map((item) => item.post_id),
        ])
      );

      if (relatedPostIds.length > 0) {
        const { data: relatedPostsData } = await supabase
          .from("posts")
          .select(
            "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, target_gender, target_age_group, created_at"
          )
          .in("id", relatedPostIds);

        const nextPostMap: Record<number, PostRow> = {};
        ((relatedPostsData as PostRow[]) || []).forEach((post) => {
          nextPostMap[post.id] = post;
        });

        setPostMap(nextPostMap);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

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
    const rpcName =
      nextStatus === "accepted"
        ? "accept_match_request"
        : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (!data?.ok) {
      alert(data?.error || "Failed to update request");
      return;
    }

    if (nextStatus === "accepted") {
      window.location.href = "/dashboard?tab=matches&success=1";
      return;
    }

    window.location.reload();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-4">
        {showSuccess && (
          <div className="rounded-[20px] border border-[#dccfc2] bg-[#efe7dc] px-4 py-3 text-sm font-medium text-[#5f5347] shadow-sm">
            Match created successfully 🎉
          </div>
        )}

        <div className="rounded-[28px] border border-[#e7ddd2] bg-[#fffaf5] px-6 py-5 shadow-sm">
          <div className="text-[11px] tracking-[0.28em] text-[#9b8f84]">
            DASHBOARD
          </div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#2f2a26] sm:text-[34px]">
                My Meetups
              </h1>
              <p className="mt-1 text-sm text-[#6f655c]">
                Manage posts, requests, and matches.
              </p>
            </div>

            <Link
              href="/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="My Posts" value={posts.length} />
          <SummaryCard label="Requests" value={requestsReceived.length} />
          <SummaryCard label="Matches" value={matches.length} />
          <SummaryCard label="Pending" value={pendingReceived} />
        </div>

        <div className="rounded-[28px] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <FilterPill active={activeTab === "posts"} onClick={() => setActiveTab("posts")}>
              <span className="inline-flex items-center gap-2">
                <FileText className="h-4 w-4" />
                My Posts
              </span>
            </FilterPill>

            <FilterPill active={activeTab === "received"} onClick={() => setActiveTab("received")}>
              <span className="inline-flex items-center gap-2">
                <Inbox className="h-4 w-4" />
                Requests Received
              </span>
            </FilterPill>

            <FilterPill active={activeTab === "sent"} onClick={() => setActiveTab("sent")}>
              <span className="inline-flex items-center gap-2">
                <Send className="h-4 w-4" />
                Requests Sent
              </span>
            </FilterPill>

            <FilterPill active={activeTab === "matches"} onClick={() => setActiveTab("matches")}>
              <span className="inline-flex items-center gap-2">
                <HeartHandshake className="h-4 w-4" />
                Matches
              </span>
            </FilterPill>
          </div>
        </div>

        {activeTab === "posts" && (
          <div className="rounded-[28px] border border-[#e7ddd2] bg-[#fffaf5] p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <FilterPill active={postFilter === "all"} onClick={() => setPostFilter("all")}>
                All
              </FilterPill>
              <FilterPill active={postFilter === "upcoming"} onClick={() => setPostFilter("upcoming")}>
                Upcoming
              </FilterPill>
              <FilterPill active={postFilter === "expired"} onClick={() => setPostFilter("expired")}>
                Expired
              </FilterPill>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {filteredPosts.map((post) => {
              const postStatus = getPostStatus(post.meeting_time);
              const amount = parseBenefitAmount(post.benefit_amount);

              return (
                <div
                  key={post.id}
                  className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 truncate text-[22px] font-extrabold text-[#2f2a26] sm:text-[24px]">
                        {getPurposeIcon(post.meeting_purpose)}
                        <span className="truncate">{post.meeting_purpose || "Meetup"}</span>
                        {formatDuration(post.duration_minutes) ? (
                          <span className="inline-flex shrink-0 items-center gap-1 text-[#2f2a26]">
                            <Clock3 className="h-4 w-4" />
                            {formatDuration(post.duration_minutes)}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-[2px] flex items-center gap-2 truncate text-[22px] font-extrabold text-[#8a7f74] sm:text-[24px]">
                        <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                        <span className="truncate">
                          {post.place_name || post.location || "No place"}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          postStatus
                        )}`}
                      >
                        {postStatus}
                      </span>

                      {amount !== null && (
                        <div className="rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-4 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                          <span className="inline-flex items-center gap-1.5">
                            <Coins className="h-4 w-4" />
                            ${amount.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#766c62]">
                    {post.meeting_time && (
                      <div className="flex items-center gap-2">
                        <Clock3 className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                        <span>{formatTime(post.meeting_time)}</span>
                      </div>
                    )}

                    {post.location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
                        <span className="line-clamp-1">{post.location}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                      <span>
                        {post.target_gender || "Any"} / {post.target_age_group || "Any"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <CompactActionButton href={`/posts/${post.id}`} primary>
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </CompactActionButton>

                    <CompactActionButton href={`/write/${post.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </CompactActionButton>

                    {post.location && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          post.location
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                      >
                        <MapIcon className="h-3.5 w-3.5" />
                        Map
                      </a>
                    )}

                    <CompactActionButton
                      onClick={() => deletePost(post.id)}
                      disabled={deletingPostId === post.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingPostId === post.id ? "Deleting..." : "Delete"}
                    </CompactActionButton>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
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
                className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-[#2f2a26]">
                      Request received
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      From: {profileMap[item.requester_user_id] || "Unknown"}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <MiniPostPreview post={postMap[item.post_id]} />

                {item.status === "pending" && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <CompactActionButton
                      onClick={() => updateRequestStatus(item.id, "accepted")}
                      primary
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Accept
                    </CompactActionButton>

                    <CompactActionButton
                      onClick={() => updateRequestStatus(item.id, "rejected")}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject
                    </CompactActionButton>
                  </div>
                )}
              </div>
            ))}

            {requestsReceived.length === 0 && (
              <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
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
                className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-[#2f2a26]">
                      Request sent
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      To: {profileMap[item.post_owner_user_id] || "Unknown"}
                    </div>
                    <div className="mt-1 text-sm text-[#6f655c]">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <MiniPostPreview post={postMap[item.post_id]} />
              </div>
            ))}

            {requestsSent.length === 0 && (
              <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                No requests sent.
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            {matches.map((item) => {
              const otherUserId = item.user_a === userId ? item.user_b : item.user_a;

              return (
                <div
                  key={item.id}
                  className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-lg font-semibold text-[#2f2a26]">
                        Matched meetup
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        With: {profileMap[otherUserId] || "Unknown"}
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                        item.status
                      )}`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <MiniPostPreview post={postMap[item.post_id]} />
                </div>
              );
            })}

            {matches.length === 0 && (
              <div className="rounded-[28px] border border-[#e7ddd2] bg-white px-6 py-10 text-center text-[#8b7f74] shadow-sm">
                No matches yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}