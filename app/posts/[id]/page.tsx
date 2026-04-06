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
    .select(
      "id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
    )
    .eq("id", params.id)
    .single();

  if (!post) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] flex items-center justify-center">
        <div className="text-center text-[#6f655c]">Meetup not found</div>
      </main>
    );
  }

  const hasCoordinates =
    post.latitude !== null && post.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
    : "";

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-6 py-8 text-[#2f2a26]">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <p className="mb-3 text-xs tracking-[0.3em] text-[#a48f7a]">
            MEETUP
          </p>

          <h1 className="text-2xl font-semibold leading-snug">
            📍 {post.place_name || post.location || "Location not set"}
          </h1>

          {post.location && (
            <p className="mt-3 text-sm text-[#6f655c]">{post.location}</p>
          )}

          <div className="mt-6 space-y-3 text-sm text-[#6f655c]">
            {post.meeting_time && (
              <p>⏰ {new Date(post.meeting_time).toLocaleString()}</p>
            )}

            {post.meeting_purpose && <p>🎯 {post.meeting_purpose}</p>}

            <p>
              👤 {post.target_gender || "Any"} /{" "}
              {post.target_age_group || "Any"}
            </p>

            {post.benefit_amount && (
              <p className="font-medium text-[#2f2a26]">
                🎁 Benefit: {post.benefit_amount}
              </p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white transition hover:bg-[#927d69]"
              >
                Open Map
              </a>
            )}

            <a
              href="/"
              className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] transition hover:bg-[#f4ece4]"
            >
              Back
            </a>
          </div>
        </div>

        {hasCoordinates && (
          <div className="overflow-hidden rounded-[1.5rem] border border-[#e7ddd2] bg-white p-3">
            <ClientMap
              latitude={post.latitude as number}
              longitude={post.longitude as number}
            />
          </div>
        )}

        <div className="text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}