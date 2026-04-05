import { createClient } from "../../../lib/supabase/server";
import ClientMap from "./ClientMap";

export default async function PostDetail({ params }: any) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!post) return <div>Not found</div>;

  return (
    <main className="min-h-screen bg-[#f7f1ea] p-6 text-[#2f2a26]">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-3xl font-bold">{post.title}</h1>

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>📍 {post.location}</p>
          <p>🕒 {new Date(post.meeting_time).toLocaleString()}</p>
          <p>🎯 {post.meeting_purpose}</p>
          <p>💰 {post.payment_amount}</p>
          <p>👥 {post.target_gender} / {post.target_age_group}</p>
        </div>

        {post.latitude && post.longitude && (
          <div className="mt-6">
            <ClientMap latitude={post.latitude} longitude={post.longitude} />
          </div>
        )}

        <div className="mt-6 text-sm leading-7">
          {post.content}
        </div>

      </div>
    </main>
  );
}