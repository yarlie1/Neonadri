import Link from "next/link";
import { createClient } from "../lib/supabase/server";

type PostRow = {
  id: number;
  user_id: string;
  place_name: string | null;
  location: string | null;
  meeting_time: string | null;
  duration_minutes: number | null;
  meeting_purpose: string | null;
  benefit_amount: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: postsData } = await supabase
    .from("posts")
    .select(
      "id, user_id, place_name, location, meeting_time, duration_minutes, meeting_purpose, benefit_amount, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  const posts = (postsData as PostRow[]) || [];

  const ownerIds = Array.from(new Set(posts.map((post) => post.user_id)));

  const profileMap = new Map<string, string>();
  if (ownerIds.length > 0) {
    const { data: profilesData } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ownerIds);

    ((profilesData as ProfileRow[]) || []).forEach((profile) => {
      profileMap.set(profile.id, profile.display_name || "Unknown");
    });
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">
        <h2 className="text-lg font-semibold">Recent Meetup</h2>

        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => {
              const hostName = profileMap.get(post.user_id) || "Unknown";

              const titleParts = [
                post.meeting_purpose || "Meetup",
                post.place_name || post.location || "No place",
                post.duration_minutes ? `${post.duration_minutes}m` : null,
                post.benefit_amount || null,
              ].filter(Boolean);

              return (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block rounded-2xl border border-[#e7ddd2] bg-white px-6 py-5 shadow-sm transition hover:shadow-md active:scale-[0.99]"
                >
                  {/* 🔥 핵심 제목 */}
                  <div className="text-xl font-semibold leading-7">
                    {titleParts.join(" · ")}
                  </div>

                  {/* 최소 정보 */}
                  <div className="mt-3 flex items-center justify-between text-sm text-[#6f655c]">
                    <span>🧑 {hostName}</span>

                    {post.meeting_time && (
                      <span>
                        {new Date(post.meeting_time).toLocaleDateString()}{" "}
                        {new Date(post.meeting_time).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
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

      {/* Floating 버튼 */}
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