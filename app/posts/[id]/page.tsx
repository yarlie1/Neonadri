import { createClient } from "../../../lib/supabase/server";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createClient();

  // 🔥 로그인 여부 확인 (하지만 막지는 않음)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <h1 className="text-3xl font-semibold">Post not found</h1>

          <div className="mt-6">
            <a
              href="/"
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  const isOwner = user?.id === post.user_id;

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
          Post
        </p>

        <h1 className="text-4xl font-semibold tracking-tight">
          {post.title}
        </h1>

        <p className="mt-4 text-sm text-[#9b8f84]">
          {new Date(post.created_at).toLocaleString()}
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[#e7ddd2] bg-white p-6 text-sm leading-8 text-[#6f655c]">
          {post.content}
        </div>

        {/* 🔥 로그인 안했을 때 안내 */}
        {!user && (
          <div className="mt-8 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-5 py-4 text-sm text-[#6b5f52]">
            Log in to write posts or interact with others.
          </div>
        )}

        {/* 🔥 작성자만 수정/삭제 가능 */}
        {isOwner && (
          <div className="mt-8 flex gap-3">
            <a
              href="/dashboard"
              className="rounded-2xl bg-[#6b5f52] px-5 py-3 text-sm text-white"
            >
              Edit in Dashboard
            </a>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/"
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}