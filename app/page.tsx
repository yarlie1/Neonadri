import Link from "next/link";
import { createClient } from "../lib/supabase/server";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MatchRequestRow = {
  post_id: number;
  status: string;
};

type MatchRow = {
  post_id: number;
  status: string;
};

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, meeting_purpose, benefit_amount, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const posts = (postsData as PostRow[]) || [];

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id)));

  let profileMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap.set(profile.id, profile.display_name || "Unknown user");
    });
  }

  let requestStatusMap = new Map<number, string>();
  let matchedPostIds = new Set<number>();

  if (user) {
    const [requestsRes, matchesRes] = await Promise.all([
      supabase
        .from("match_requests")
        .select("post_id, status")
        .eq("requester_user_id", user.id),

      supabase
        .from("matches")
        .select("post_id, status")
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    ]);

    ((requestsRes.data as MatchRequestRow[]) || []).forEach((item) => {
      requestStatusMap.set(item.post_id, item.status);
    });

    ((matchesRes.data as MatchRow[]) || []).forEach((item) => {
      matchedPostIds.add(item.post_id);
      requestStatusMap.set(item.post_id, "matched");
    });
  }

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "matched") {
      return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
    }

    if (normalized === "accepted") {
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

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Meetup</h2>

          <Link
            href="/map"
            className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
          >
            Map View
          </Link>
        </div>

        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => {
              const hostName =
                profileMap.get(post.user_id) || "Unknown user";

              const myStatus =
                user && user.id !== post.user_id
                  ? requestStatusMap.get(post.id) || "No request yet"
                  : null;

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-2xl border border-[#e7ddd2] bg-white p-5 shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  <div className="text-base font-medium">
                    📍 {post.place_name || "No place"}
                  </div>

                  {post.location && (
                    <div className="mt-1 line-clamp-1 text-sm text-[#6f655c]">
                      {post.location}
                    </div>
                  )}

                  <div className="mt-3 space-y-1 text-sm text-[#6f655c]">
                    <div>🧑 Host: {hostName}</div>

                    {user && user.id === post.user_id && (
                      <div>📝 This is your meetup post.</div>
                    )}

                    {myStatus && (
                      <div className="flex items-center gap-2">
                        <span>🤝 My Match Status:</span>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                            myStatus
                          )}`}
                        >
                          {myStatus}
                        </span>
                      </div>
                    )}

                    {post.meeting_time && (
                      <div>⏰ {new Date(post.meeting_time).toLocaleString()}</div>
                    )}

                    {post.meeting_purpose && (
                      <div>🎯 {post.meeting_purpose}</div>
                    )}
                  </div>

                  {post.benefit_amount && (
                    <div className="mt-3 text-sm font-medium text-[#2f2a26]">
                      🎁 {post.benefit_amount}
                    </div>
                  )}

                  <div className="mt-3 text-xs text-[#9b8f84]">
                    {new Date(post.created_at).toLocaleString()}
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-2xl border border-[#e7ddd2] bg-white p-6 text-center text-sm text-[#6f655c]">
              No meetups yet
            </div>
          )}
        </div>
      </div>

      <Link
        href="/write"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#6b5f52] px-5 py-3 text-sm font-medium text-white shadow-[0_10px_25px_rgba(60,45,35,0.28)] transition hover:bg-[#5b5046] active:scale-95"
      >
        <span className="text-xl leading-none">+</span>
        Create
      </Link>
    </main>
  );
}