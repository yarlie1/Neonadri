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
  Star,
  UserCircle2,
} from "lucide-react";
import type { MatchRow, MatchRequestRow, PostRow } from "./page";

type DashboardTab = "posts" | "received" | "sent" | "matches";
type PostFilter = "all" | "upcoming" | "expired";

function getPurposeIcon(purpose: string | null) {
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
}

function formatDuration(minutes: number | null) {
  if (!minutes) return "";
  if (minutes === 60) return "1h";
  if (minutes === 90) return "1.5h";
  if (minutes === 120) return "2h";
  return `${minutes}m`;
}

function formatTime(meetingTime: string | null) {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function getPostStatus(meetingTime: string | null) {
  if (!meetingTime) return "Upcoming";
  const now = new Date();
  const target = new Date(meetingTime);
  return target.getTime() >= now.getTime() ? "Upcoming" : "Expired";
}

function getStatusBadgeClass(status: string) {
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
}

function parseBenefitAmount(value: string | null) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^0-9.-]/g, "");
  const amount = Number(cleaned);
  if (Number.isNaN(amount) || amount <= 0) return null;
  return amount;
}

function DashboardTabCard({
  active,
  label,
  value,
  subtext,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  value: number;
  subtext?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[26px] border px-4 py-5 text-left transition ${
        active
          ? "bg-[linear-gradient(135deg,#b79f89_0%,#927763_100%)] border-[#b7a38f] text-white shadow-[0_16px_32px_rgba(120,76,52,0.18)]"
          : "bg-[#fcfaf7] border-[#e7ddd2] text-[#2f2a26] hover:bg-[#f6efe7]"
      }`}
    >
      <div className="flex min-h-[120px] flex-col">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {label}
        </div>

        <div className="mt-auto">
          <div className="text-[36px] font-extrabold leading-none">{value}</div>
          <div className="mt-2 min-h-[16px] text-xs opacity-80">{subtext || ""}</div>
        </div>
      </div>
    </button>
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

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#eadfd3] bg-[#fcfaf7] px-4 py-4">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
        {eyebrow}
      </div>
      <div className="mt-2 text-lg font-black tracking-[-0.04em] text-[#2f2a26]">
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-[#7a6b61]">{body}</p>
    </div>
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

function ProfileInlineLink({
  userId,
  name,
  prefix,
}: {
  userId: string;
  name: string;
  prefix: string;
}) {
  return (
    <div className="mt-1 flex items-center gap-2 text-sm text-[#6f655c]">
      <span>{prefix}</span>
      <Link
        href={`/profile/${userId}`}
        className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 font-medium text-[#5a5149] transition hover:bg-[#f4ece4] hover:text-[#2f2a26]"
      >
        <UserCircle2 className="h-4 w-4 text-[#8a7f74]" />
        <span>{name || "Unknown"}</span>
      </Link>
    </div>
  );
}

export default function DashboardClient({
  userId,
  posts: initialPosts,
  requestsReceived,
  requestsSent,
  matches,
  profileMap,
  postMap,
  reviewedMatchIds,
}: {
  userId: string;
  posts: PostRow[];
  requestsReceived: MatchRequestRow[];
  requestsSent: MatchRequestRow[];
  matches: MatchRow[];
  profileMap: Record<string, string>;
  postMap: Record<number, PostRow>;
  reviewedMatchIds: number[];
}) {
  const supabase = createClient();

  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState<DashboardTab>("posts");
  const [postFilter, setPostFilter] = useState<PostFilter>("all");
  const [matchFilter, setMatchFilter] = useState<PostFilter>("all");
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [processingRequestAction, setProcessingRequestAction] = useState<
    "accepted" | "rejected" | null
  >(null);
  const [showMatchSuccess, setShowMatchSuccess] = useState(false);
  const [showReviewSuccess, setShowReviewSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const success = params.get("success");
    const review = params.get("review");

    if (tab === "posts" || tab === "received" || tab === "sent" || tab === "matches") {
      setActiveTab(tab);
    }

    if (success === "1") {
      setShowMatchSuccess(true);
      const timer = setTimeout(() => setShowMatchSuccess(false), 3000);
      return () => clearTimeout(timer);
    }

    if (review === "1") {
      setShowReviewSuccess(true);
      const timer = setTimeout(() => setShowReviewSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const filteredPosts = useMemo(() => {
    if (postFilter === "all") return posts;
    return posts.filter((post) => getPostStatus(post.meeting_time).toLowerCase() === postFilter);
  }, [posts, postFilter]);

  const filteredMatches = useMemo(() => {
    if (matchFilter === "all") return matches;
    return matches.filter((match) => {
      const post = postMap[match.post_id];
      const status = getPostStatus(post?.meeting_time || null).toLowerCase();
      return status === matchFilter;
    });
  }, [matches, matchFilter, postMap]);

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
    if (processingRequestId !== null) return;

    setProcessingRequestId(requestId);
    setProcessingRequestAction(nextStatus);

    const rpcName =
      nextStatus === "accepted" ? "accept_match_request" : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      setProcessingRequestId(null);
      setProcessingRequestAction(null);
      alert(error.message);
      return;
    }

    const result = data as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      setProcessingRequestId(null);
      setProcessingRequestAction(null);
      alert(result?.error || "Failed to update request");
      return;
    }

    if (nextStatus === "accepted") {
      window.location.href = "/dashboard?tab=matches&success=1";
      return;
    }

    window.location.reload();
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-2xl space-y-5">
        {showMatchSuccess && (
          <div className="rounded-[20px] border border-[#dccfc2] bg-[#efe7dc] px-4 py-3 text-sm font-medium text-[#5f5347] shadow-sm">
            Match created successfully.
          </div>
        )}

        {showReviewSuccess && (
          <div className="rounded-[20px] border border-[#dccfc2] bg-[#efe7dc] px-4 py-3 text-sm font-medium text-[#5f5347] shadow-sm">
            Review submitted successfully.
          </div>
        )}

        <div className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f4d7c7_38%,#e4b49d_100%)] px-6 py-6 shadow-[0_24px_60px_rgba(120,76,52,0.16)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
          <div className="relative">
          <div className="text-[11px] tracking-[0.28em] text-[#9b8f84]">DASHBOARD</div>

          <div className="mt-2 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-[-0.04em] text-[#2b1f1a] sm:text-[36px]">
                My Meetups
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-[#5f453b]">
                Manage posts, requests, matches, and reviews.
              </p>
            </div>

            <Link
              href="/write"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#2f2a26] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#443730]"
            >
              <Plus className="h-4 w-4" />
              Create
            </Link>
          </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <DashboardTabCard
            active={activeTab === "posts"}
            label="My Posts"
            value={posts.length}
            icon={<FileText className="h-4 w-4" />}
            onClick={() => setActiveTab("posts")}
          />
          <DashboardTabCard
            active={activeTab === "received"}
            label="Requests Received"
            value={requestsReceived.length}
            subtext={pendingReceived > 0 ? `${pendingReceived} pending` : "No pending"}
            icon={<Inbox className="h-4 w-4" />}
            onClick={() => setActiveTab("received")}
          />
          <DashboardTabCard
            active={activeTab === "sent"}
            label="Requests Sent"
            value={requestsSent.length}
            icon={<Send className="h-4 w-4" />}
            onClick={() => setActiveTab("sent")}
          />
          <DashboardTabCard
            active={activeTab === "matches"}
            label="Matches"
            value={matches.length}
            icon={<HeartHandshake className="h-4 w-4" />}
            onClick={() => setActiveTab("matches")}
          />
        </div>

        {activeTab === "posts" && (
          <div className="rounded-[30px] border border-[#eadfd3] bg-white/90 p-4 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Hosting"
                title="Everything you are hosting"
                body="Review what is live, what has passed, and what still needs attention before the meetup happens."
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={postFilter === "all"} onClick={() => setPostFilter("all")}>
                    All
                  </FilterPill>
                  <FilterPill
                    active={postFilter === "upcoming"}
                    onClick={() => setPostFilter("upcoming")}
                  >
                    Upcoming
                  </FilterPill>
                  <FilterPill
                    active={postFilter === "expired"}
                    onClick={() => setPostFilter("expired")}
                  >
                    Expired
                  </FilterPill>
                </div>

                <Link
                  href={`/profile/${userId}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                >
                  <UserCircle2 className="h-4 w-4" />
                  My Profile
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === "matches" && (
          <div className="rounded-[30px] border border-[#eadfd3] bg-white/90 p-4 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
            <div className="space-y-4">
              <SectionIntro
                eyebrow="Connections"
                title="People you have matched with"
                body="Keep track of upcoming meetups, revisit finished ones, and leave reviews after the moment has passed."
              />

              <div className="flex flex-wrap gap-2">
                <FilterPill active={matchFilter === "all"} onClick={() => setMatchFilter("all")}>
                  All
                </FilterPill>
                <FilterPill
                  active={matchFilter === "upcoming"}
                  onClick={() => setMatchFilter("upcoming")}
                >
                  Upcoming
                </FilterPill>
                <FilterPill
                  active={matchFilter === "expired"}
                  onClick={() => setMatchFilter("expired")}
                >
                  Expired
                </FilterPill>
              </div>
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
                  className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur"
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
              <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-10 text-center text-[#8b7f74] shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
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
                className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-[#2f2a26]">Request received</div>

                    <ProfileInlineLink
                      userId={item.requester_user_id}
                      name={profileMap[item.requester_user_id] || "Unknown"}
                      prefix="From:"
                    />

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

                {item.status === "pending" ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <CompactActionButton href={`/profile/${item.requester_user_id}`}>
                      <UserCircle2 className="h-3.5 w-3.5" />
                      View Profile
                    </CompactActionButton>

                    <CompactActionButton
                      onClick={() => updateRequestStatus(item.id, "accepted")}
                      disabled={processingRequestId !== null}
                      primary
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {processingRequestId === item.id &&
                      processingRequestAction === "accepted"
                        ? "Accepting..."
                        : "Accept"}
                    </CompactActionButton>

                    <CompactActionButton
                      onClick={() => updateRequestStatus(item.id, "rejected")}
                      disabled={processingRequestId !== null}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      {processingRequestId === item.id &&
                      processingRequestAction === "rejected"
                        ? "Rejecting..."
                        : "Reject"}
                    </CompactActionButton>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <CompactActionButton href={`/profile/${item.requester_user_id}`}>
                      <UserCircle2 className="h-3.5 w-3.5" />
                      View Profile
                    </CompactActionButton>
                  </div>
                )}
              </div>
            ))}

            {requestsReceived.length === 0 && (
              <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-10 text-center text-[#8b7f74] shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
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
                className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold text-[#2f2a26]">Request sent</div>

                    <ProfileInlineLink
                      userId={item.post_owner_user_id}
                      name={profileMap[item.post_owner_user_id] || "Unknown"}
                      prefix="To:"
                    />

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

                <div className="mt-5 flex flex-wrap gap-2">
                  <CompactActionButton href={`/profile/${item.post_owner_user_id}`}>
                    <UserCircle2 className="h-3.5 w-3.5" />
                    View Profile
                  </CompactActionButton>
                </div>
              </div>
            ))}

            {requestsSent.length === 0 && (
              <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-10 text-center text-[#8b7f74] shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
                No requests sent.
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="space-y-4">
            {filteredMatches.map((item) => {
              const otherUserId = item.user_a === userId ? item.user_b : item.user_a;
              const post = postMap[item.post_id];
              const amount = post ? parseBenefitAmount(post.benefit_amount) : null;
              const mapHref = post?.location
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    post.location
                  )}`
                : "";
              const alreadyReviewed = reviewedMatchIds.includes(item.id);
              const meetupStatus = getPostStatus(post?.meeting_time || null).toLowerCase();
              const canLeaveReview = meetupStatus === "expired" && !alreadyReviewed;

              return (
                <div
                  key={item.id}
                  className="rounded-[30px] border border-[#eadfd3] bg-white/92 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-lg font-semibold text-[#2f2a26]">
                        <HeartHandshake className="h-5 w-5 text-[#a48f7a]" />
                        <span>Match confirmed</span>
                      </div>

                      <div className="mt-1 text-sm text-[#6f655c]">
                        With: {profileMap[otherUserId] || "Unknown"}
                      </div>

                      <div className="mt-1 text-sm text-[#8b7f74]">
                        Matched on {new Date(item.created_at).toLocaleString()}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                        meetupStatus
                      )}`}
                    >
                      {meetupStatus === "upcoming" ? "Upcoming" : "Expired"}
                    </span>
                  </div>

                  {post ? (
                    <div className="mt-4 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
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

                          <div className="mt-1 flex items-center gap-2 truncate text-lg font-bold text-[#2f2a26]">
                            <MapPin className="h-4 w-4 shrink-0 text-[#8a7f74]" />
                            <span className="truncate">
                              {post.place_name || post.location || "No place"}
                            </span>
                          </div>
                        </div>

                        {amount !== null && (
                          <div className="shrink-0 rounded-full bg-gradient-to-b from-[#f5df97] to-[#e5c76f] px-4 py-2 text-sm font-bold text-[#5f4c1d] shadow-sm">
                            <span className="inline-flex items-center gap-1.5">
                              <Coins className="h-4 w-4" />
                              ${amount.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="mt-3 space-y-2 text-sm text-[#766c62]">
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
                    </div>
                  ) : (
                    <MiniPostPreview post={post} />
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <CompactActionButton href={`/posts/${item.post_id}`} primary>
                      <Eye className="h-3.5 w-3.5" />
                      View Meetup
                    </CompactActionButton>

                    <CompactActionButton href={`/profile/${otherUserId}`}>
                      <UserRound className="h-3.5 w-3.5" />
                      View Profile
                    </CompactActionButton>

                    {mapHref && (
                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                      >
                        <MapIcon className="h-3.5 w-3.5" />
                        Open Map
                      </a>
                    )}

                    {canLeaveReview ? (
                      <CompactActionButton href={`/reviews/write/${item.id}`}>
                        <Star className="h-3.5 w-3.5" />
                        Leave Review
                      </CompactActionButton>
                    ) : alreadyReviewed ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#b0a59a]"
                        disabled
                      >
                        <Star className="h-3.5 w-3.5" />
                        Review submitted
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#b0a59a]"
                        disabled
                      >
                        <Star className="h-3.5 w-3.5" />
                        Review after meetup
                      </button>
                    )}

                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#dccfc2] bg-white px-3 py-2 text-xs font-medium text-[#b0a59a]"
                      disabled
                    >
                      <Send className="h-3.5 w-3.5" />
                      Chat soon
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredMatches.length === 0 && (
              <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-10 text-center text-[#8b7f74] shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
                {matchFilter === "all"
                  ? "No matches yet."
                  : matchFilter === "upcoming"
                  ? "No upcoming matches."
                  : "No expired matches."}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}


