import { createClient } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function PostDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select("id, title, content, created_at, user_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !post) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <h1 className="text-3xl font-semibold text-[#2f2a26]">
            Post not found
          </h1>

          <div className="mt-6">
            <a
              href="/"
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
            >
              Back to Home
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)] md:p-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.35em] text-[#a48f7a]">
          Post
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-[#2f2a26]">
          {post.title}
        </h1>

        <p className="mt-4 text-sm text-[#9b8f84]">
          {new Date(post.created_at).toLocaleString()}
        </p>

        <div className="mt-8 rounded-[1.5rem] border border-[#e7ddd2] bg-white p-6 text-sm leading-8 text-[#6f655c]">
          {post.content}
        </div>

        <div className="mt-8">
          <a
            href="/"
            className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
          >
            Back to Home
          </a>
        </div>
      </div>
    </main>
  );
}