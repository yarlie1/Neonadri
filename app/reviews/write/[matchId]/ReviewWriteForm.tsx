"use client";

import { useState } from "react";
import { Clock3, MapPin, Sparkles, Star } from "lucide-react";
import { formatMeetingTime } from "../../../../lib/meetingTime";

type PostRow = {
  id: number;
  meeting_time: string | null;
  place_name: string | null;
  location: string | null;
  meeting_purpose: string | null;
};

type ReviewWriteFormProps = {
  matchId: string;
  initialCanReview: boolean;
  initialMessage: string;
  initialPostInfo: PostRow | null;
  initialRevieweeUserId: string;
  initialRevieweeName: string;
  initialRevieweeIsHost: boolean;
  initialUserTimeZone: string;
};

export default function ReviewWriteForm({
  matchId,
  initialCanReview,
  initialMessage,
  initialPostInfo,
  initialRevieweeUserId,
  initialRevieweeName,
  initialRevieweeIsHost,
  initialUserTimeZone,
}: ReviewWriteFormProps) {
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [showedUp, setShowedUp] = useState<boolean | null>(null);
  const [hostPaidBenefit, setHostPaidBenefit] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = async () => {
    if (!initialCanReview) return;

    if (showedUp === null) {
      setMessage("Please confirm whether they showed up for the meetup.");
      return;
    }

    if (initialRevieweeIsHost && hostPaidBenefit === null) {
      setMessage("Please confirm whether the host paid the promised benefit.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/reviews/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: matchId,
          review_text: reviewText,
          rating,
          showed_up: showedUp,
          host_paid_benefit: initialRevieweeIsHost ? hostPaidBenefit : null,
          reviewee_user_id: initialRevieweeUserId,
        }),
      });

      const result = await response.json();

      setSaving(false);

      if (!response.ok) {
        setMessage(result.error || "Failed to submit review.");
        return;
      }

      window.location.href = "/dashboard?tab=matches&review=1";
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Server error");
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] px-4 py-6">
      <div className="mx-auto max-w-xl space-y-4">
        <div className="rounded-[28px] border border-[#e7ddd2] bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-[#2f2a26]">Leave a Review</h1>

          {initialPostInfo && (
            <div className="mt-4 rounded-[20px] border border-[#e7ddd2] bg-[#fcfaf7] p-4">
              <div className="text-sm font-medium text-[#7a6f65]">Review for</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#2f2a26]">
                {initialRevieweeName || "your match"}
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#766c62]">
                  <Sparkles className="h-4 w-4 text-[#8a7f74]" />
                  <span>{initialPostInfo.meeting_purpose || "Meetup"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#766c62]">
                  <MapPin className="h-4 w-4 text-[#8a7f74]" />
                  <span>
                    {initialPostInfo.place_name ||
                      initialPostInfo.location ||
                      "No place"}
                  </span>
                </div>
              </div>

              {initialPostInfo.meeting_time && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#766c62]">
                  <Clock3 className="h-4 w-4 text-[#8a7f74]" />
                  <span>
                    {formatMeetingTime(
                      initialPostInfo.meeting_time,
                      initialUserTimeZone
                    ) || ""}
                  </span>
                </div>
              )}
            </div>
          )}

          {!initialCanReview ? (
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
                  Did they show up for the meetup?
                </label>
                <div className="flex gap-2">
                  {[
                    { label: "Yes", value: true },
                    { label: "No", value: false },
                  ].map((option) => {
                    const active = showedUp === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => setShowedUp(option.value)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "border-[#a48f7a] bg-[#a48f7a] text-white"
                            : "border-[#dccfc2] bg-white text-[#5a5149] hover:bg-[#f4ece4]"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {initialRevieweeIsHost && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#6f655c]">
                    Did the host pay the promised benefit?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { label: "Yes", value: true },
                      { label: "No", value: false },
                    ].map((option) => {
                      const active = hostPaidBenefit === option.value;
                      return (
                        <button
                          key={option.label}
                          type="button"
                          onClick={() => setHostPaidBenefit(option.value)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            active
                              ? "border-[#a48f7a] bg-[#a48f7a] text-white"
                              : "border-[#dccfc2] bg-white text-[#5a5149] hover:bg-[#f4ece4]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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
