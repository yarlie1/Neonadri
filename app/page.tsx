import Link from "next/link";
import { createClient } from "../lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();

  const { data: posts, error } = await supabase
    .from("posts")
    .select(
      "id, place_name, location, meeting_time, meeting_purpose, benefit_amount, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-6 text-[#2f2a26]">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ACTION BUTTONS */}
        <div className="flex gap-3">
          <Link
            href="/map"
            className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
          >
            Map View
          </Link>

          <Link
            href="/write"
            className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
          >
            Create Meetup
          </Link>
        </div>

        {/* TITLE */}
        <h2 className="text-lg font-semibold">Recent Meetup</h2>

        {/* LIST */}
        <div className="space-y-4">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-2xl border border-[#e7ddd2] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="text-base font-medium">
                  📍 {post.place_name || "No place"}
                </div>

                {post.location && (
                  <div className="mt-1 text-sm text-[#6f655c]">
                    {post.location}
                  </div>
                )}

                <div className="mt-3 space-y-1 text-sm text-[#6f655c]">
                  {post.meeting_time && (
                    <div>
                      ⏰{" "}
                      {new Date(post.meeting_time).toLocaleString()}
                    </div>
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
    </main>
  );
}