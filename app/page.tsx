import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      "id, place_name, location, meeting_time, meeting_purpose, benefit_amount, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Meetup</h2>

          <Link
            href="/map"
            className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
          >
            Map View
          </Link>
        </div>

        {/* List */}
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
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
            ))
          ) : (
            <div className="rounded-2xl border border-[#e7ddd2] bg-white p-6 text-center text-sm text-[#6f655c]">
              No meetups yet
            </div>
          )}
        </div>
      </div>

      {/* FAB - 업그레이드 버전 */}
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