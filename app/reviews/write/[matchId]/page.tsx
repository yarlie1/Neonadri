"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../../lib/supabase/client";
import { Star } from "lucide-react";

type MatchRow = {
  id: number;
  user_a: string;
  user_b: string;
};

type PageProps = {
  params: {
    matchId: string;
  };
};

export default function WriteReviewPage({ params }: PageProps) {
  const supabase = createClient();

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [revieweeUserId, setRevieweeUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

      const { data: matchData, error } = await supabase
        .from("matches")
        .select("id, user_a, user_b")
        .eq("id", Number(params.matchId))
        .single();

      if (error || !matchData) {
        setMessage("Match not found.");
        setLoading(false);
        return;
      }

      const match = matchData as MatchRow;
      const otherUserId = match.user_a === user.id ? match.user_b : match.user_a;

      setRevieweeUserId(otherUserId);
      setLoading(false);
    };

    loadMatch();
  }, [params.matchId, supabase]);

  const handleSubmit = async () => {
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
      review_text: reviewText,
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
      <div className="mx-auto max-w-xl rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-[#2f2a26]">Leave a Review</h1>

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
                    <Star className={`h-7 w-7 ${active ? "fill-current" : ""}`} />
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
      </div>
    </main>
  );
}