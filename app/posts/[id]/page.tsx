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
      <main style={{ padding: 20 }}>
        <h1>Post not found</h1>
        <a href="/dashboard">
          <button>Back to Dashboard</button>
        </a>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, maxWidth: 800, margin: "0 auto" }}>
      <h1>{post.title}</h1>

      <p style={{ color: "#666", marginBottom: 20 }}>
        {new Date(post.created_at).toLocaleString()}
      </p>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 16,
          lineHeight: 1.6,
          whiteSpace: "pre-wrap",
        }}
      >
        {post.content}
      </div>

      <div style={{ marginTop: 20 }}>
        <a href="/dashboard">
          <button>Back to Dashboard</button>
        </a>
      </div>
    </main>
  );
}