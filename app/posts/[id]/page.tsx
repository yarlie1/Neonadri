import { createClient } from "../../../lib/supabase/server";
import ClientMap from "./ClientMap";

export default async function Page({ params }: any) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!post) {
    return <div className="p-10">Not found</div>;
  }

  const hasCoordinates =
    post.latitude !== null && post.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
    : "";

  return (
    <main className="p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="p-6 bg-white rounded-xl border">
          <h1 className="text-xl font-bold">
            📍 {post.place_name || post.location}
          </h1>

          <p className="mt-2 text-sm">{post.location}</p>

          <div className="mt-4 space-y-2 text-sm">
            <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
            <p>🎯 {post.meeting_purpose}</p>
            <p>
              👤 {post.target_gender} / {post.target_age_group}
            </p>
            <p>🎁 {post.benefit_amount}</p>
          </div>

          <div className="mt-4 flex gap-3">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                className="px-4 py-2 bg-[#a48f7a] text-white rounded"
              >
                Open Map
              </a>
            )}
          </div>
        </div>

        {hasCoordinates && (
          <div className="bg-white p-3 rounded-xl border">
            <ClientMap
              latitude={post.latitude}
              longitude={post.longitude}
            />
          </div>
        )}
      </div>
    </main>
  );
}