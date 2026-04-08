"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Star, Clock3 } from "lucide-react";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
  post_id: number;
};

type PostRow = {
  id: number;
  meeting_time: string | null;
  place_name: string | null;
  location: string | null;
  meeting_purpose: string | null;
};

type PageProps = {
  params: {
    matchId: string;
  };
};

const formatTime = (meetingTime: string | null) => {
  if (!meetingTime) return "";
  const date = new Date(meetingTime);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const isMeetupExpired = (meetingTime: string | null) => {
  if (!meetingTime) return false;
  return new Date(meetingTime).getTime() < Date.now();
};

export default function WriteReviewPage({ params }: PageProps) {
  const supabase = createClient();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [revieweeUserId, setRevieweeUserId] = useState("");
  const [postInfo, setPostInfo] = useState<PostRow | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadMatch = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/";
        return;
      }

      const { data: matchData, error: matchError } = await supabase
        .from("matches")
        .select("id, user_a, user_b, post_id")
        .eq("id", Number(params.matchId))
        .single();

      if (matchError || !matchData) {
        setMessage("Match not found.");
        setLoading(false);
        return;
      }

      const match = matchData as MatchRow;

      if (match.user_a !== user.id && match.user_b !== user.id) {
        setMessage("You do not have access to this review.");
        setLoading(false);
        return;
      }

      const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;
      setRevieweeUserId(otherUserId);

      const { data: postData } = await supabase
        .from("posts")
        .select("id, meeting_time, place_name, location, meeting_purpose")
        .eq("id", match.post_id)
        .maybeSingle();

      const typedPost = postData as PostRow | null;
      setPostInfo(typedPost);

      if (!typedPost || !isMeetupExpired(typedPost.meeting_time)) {
        setMessage("Review is available only after the meetup is finished.");
        setLoading(false);
        return;
      }

      const { data: existingReview } = await supabase
        .from("match_reviews")
        .select("id")
        .eq("match_id", match.id)
        .eq("reviewer_user_id", user.id)
        .maybeSingle();

      if (existingReview) {
        setMessage("You already submitted a review for this meetup.");
        setLoading(false);
        return;
      }

      setCanReview(true);
      setLoading(false);
    };

    loadMatch();
  }, [params.matchId, supabase]);

  const handleSubmit = async () => {
    if (!canReview) return;

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please sign in first.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("match_reviews").insert({
      match_id: Number(params.matchId),
      reviewer_user_id: user.id,
      reviewee_user_id: revieweeUserId,
      rating,
      review_text: reviewText.trim() || null,
    });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/dashboard?tab=matches";
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
        <div className="mx-auto max-w-xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#2f2a26]">Leave a Review</h1>

          {postInfo && (
            <div className="mt-4 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] p-4">
              <div className="text-base font-semibold text-[#2f2a26]">
                {postInfo.meeting_purpose || "Meetup"}
              </div>

              <div className="mt-1 text-lg font-bold text-[#5f5347]">
                {postInfo.place_name || postInfo.location || "No place"}
              </div>

              {postInfo.meeting_time && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#766c62]">
                  <Clock3 className="h-4 w-4 text-[#8a7f74]" />
                  <span>{formatTime(postInfo.meeting_time)}</span>
                </div>
              )}
            </div>
          )}

          {!canReview ? (
            <div className="mt-5 rounded-2xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message || "You cannot review this meetup yet."}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#6f655c]">
                  Rating
                </label>

                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = n <= rating;

                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`rounded-full p-2 transition ${
                          active ? "text-[#a48f7a]" : "text-[#d1c7bc]"
                        }`}
                      >
                        <Star
                          className={`h-7 w-7 ${active ? "fill-current" : ""}`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#6f655c]">
                  Comment
                </label>

                <textarea
                  className="w-full rounded-2xl border border-[#dccfc2] px-4 py-3 text-sm text-[#2f2a26] outline-none"
                  rows={5}
                  placeholder="How was your meetup?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
                >
                  {saving ? "Submitting..." : "Submit Review"}
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="rounded-full border border-[#dccfc2] bg-white px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
                >
                  Cancel
                </button>
              </div>

              {message && (
                <div className="rounded-2xl bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
                  {message}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}