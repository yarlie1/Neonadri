import { createClient } from "../../../lib/supabase/server";
import ClientMap from "./ClientMap";
import MatchRequestBox from "./MatchRequestBox";

type PageProps = {
  params: {
    id: string;
  };
};

type ProfileRow = {
  id: string;
  display_name: string | null;
};

type MatchRequestRow = {
  id: number;
  status: string;
};

type MatchRow = {
  id: number;
  status: string;
};

export default async function MeetupDetailPage({ params }: PageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select(
      "id, user_id, created_at, place_name, location, meeting_time, target_gender, target_age_group, meeting_purpose, benefit_amount, latitude, longitude"
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

  let ownerName = "Unknown user";

  if (post.user_id) {
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("id", post.user_id)
      .maybeSingle();

    if ((ownerProfile as ProfileRow | null)?.display_name) {
      ownerName = (ownerProfile as ProfileRow).display_name as string;
    }
  }

  let myRequestStatus = "No request yet";
  let isMatched = false;

  if (user && post.user_id && user.id !== post.user_id) {
    const [{ data: requestData }, { data: matchData }] = await Promise.all([
      supabase
        .from("match_requests")
        .select("id, status")
        .eq("post_id", post.id)
        .eq("requester_user_id", user.id)
        .maybeSingle(),

      supabase
        .from("matches")
        .select("id, status")
        .eq("post_id", post.id)
        .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
        .maybeSingle(),
    ]);

    const request = requestData as MatchRequestRow | null;
    const match = matchData as MatchRow | null;

    if (request?.status) {
      myRequestStatus = request.status;
    }

    if (match?.status) {
      isMatched = true;
      myRequestStatus = "matched";
    }
  }

  const hasCoordinates =
    post.latitude !== null && post.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`
    : "";

  const getStatusBadge = (status: string) => {
    const normalized = status.toLowerCase();

    if (normalized === "matched") {
      return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
    }

    if (normalized === "accepted") {
      return "bg-[#efe7dc] text-[#6b5f52] border border-[#dccfc2]";
    }

    if (normalized === "pending") {
      return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
    }

    if (normalized === "rejected") {
      return "bg-[#f7f1ea] text-[#9b8f84] border border-[#e7ddd2]";
    }

    return "bg-[#f4ece4] text-[#7b7067] border border-[#e7ddd2]";
  };

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
            <p>🧑 Host: {ownerName}</p>

            {user && user.id !== post.user_id && (
              <div className="flex items-center gap-2">
                <span>🤝 My Match Status:</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(
                    myRequestStatus
                  )}`}
                >
                  {myRequestStatus}
                </span>
              </div>
            )}

            {user && user.id === post.user_id && (
              <p>📝 This is your meetup post.</p>
            )}

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

        {post.user_id && !isMatched && (
          <MatchRequestBox
            postId={post.id}
            postOwnerUserId={post.user_id}
          />
        )}

        <div className="text-xs text-[#9b8f84]">
          Created at {new Date(post.created_at).toLocaleString()}
        </div>
      </div>
    </main>
  );
}