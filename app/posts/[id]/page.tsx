import { createClient } from "../../../lib/supabase/server";
import ClientMap from "./ClientMap";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!post) {
    return <div>Not found</div>;
  }

  const mapUrl =
    post.latitude && post.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
      : "";

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-16 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* 카드 */}
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">

          <p className="mb-3 text-xs tracking-[0.3em] text-[#a48f7a]">
            MEETUP
          </p>

          <h1 className="text-2xl font-semibold">
            📍 {post.location}
          </h1>

          <div className="mt-6 space-y-3 text-sm text-[#6f655c]">

            <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>

            <p>🎯 {post.meeting_purpose}</p>

            <p>
              👤 {post.target_gender || "Any"} /{" "}
              {post.target_age_group || "Any"}
            </p>

            <p className="font-medium text-[#2f2a26]">
              🎁 Benefit: {post.benefit_amount}
            </p>
          </div>

          {/* 버튼 */}
          <div className="mt-6 flex gap-3">

            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white"
              >
                Open Map
              </a>
            )}

            <a
              href="/"
              className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm"
            >
              Back
            </a>
          </div>
        </div>

        {/* 지도 */}
        {post.latitude && post.longitude && (
          <div className="rounded-[1.5rem] overflow-hidden border border-[#e7ddd2] bg-white p-3">
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