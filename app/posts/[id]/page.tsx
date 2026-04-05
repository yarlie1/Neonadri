import { createClient } from "../../../lib/supabase/server";

export default async function PostDetail({ params }: any) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!post) return <div>Not found</div>;

  const mapUrl =
    post.latitude && post.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
      : "";

  return (
    <main className="p-10 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold">{post.title}</h1>

      <div className="mt-4 space-y-2">
        <p>📍 {post.location}</p>
        <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
        <p>🎯 {post.meeting_purpose}</p>
        <p>👤 {post.target_gender} / {post.target_age_group}</p>
        <p>💵 Payment: {post.payment_amount}</p>
        <p>🎁 Benefit: {post.benefit_amount}</p>
      </div>

      {mapUrl && (
        <a href={mapUrl} target="_blank" className="block mt-3 text-blue-600">
          Open Map
        </a>
      )}

      <p className="mt-6">{post.content}</p>

      <a href="/" className="block mt-10 text-gray-500">
        ← Back
      </a>

    </main>
  );
}