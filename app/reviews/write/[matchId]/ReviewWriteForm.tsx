"use client";

import { useState } from "react";
import { Clock3, MapPin, Sparkles, Star } from "lucide-react";
import { formatMeetingTime } from "../../../../lib/meetingTime";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_BODY_TEXT_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../../designSystem";

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
      setMessage("Please confirm whether your match showed up for the meetup.");
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
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
      <div className="mx-auto max-w-xl space-y-4">
        <div className={`${APP_SURFACE_CARD_CLASS} rounded-[28px] p-6`}>
          <h1 className="text-2xl font-bold text-[#24323c]">Leave a Review</h1>

          {initialPostInfo && (
            <div className={`mt-4 rounded-[20px] p-4 ${APP_SOFT_CARD_CLASS}`}>
              <div className={APP_EYEBROW_CLASS}>Review for</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
                {initialRevieweeName || "your match"}
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#66727a]">
                  <Sparkles className="h-4 w-4 text-[#71828c]" />
                  <span>{initialPostInfo.meeting_purpose || "Meetup"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#66727a]">
                  <MapPin className="h-4 w-4 text-[#71828c]" />
                  <span>
                    {initialPostInfo.place_name ||
                      initialPostInfo.location ||
                      "No place"}
                  </span>
                </div>
              </div>

              {initialPostInfo.meeting_time && (
                <div className="mt-2 flex items-center gap-2 text-sm text-[#66727a]">
                  <Clock3 className="h-4 w-4 text-[#71828c]" />
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
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
              {message || "You cannot review this meetup yet."}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
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
                          active ? "text-[#71828c]" : "text-[#d1d9df]"
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
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Did your match show up for the meetup?
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
                          active ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
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
                  <label className="mb-2 block text-sm font-medium text-[#52616a]">
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
                            active ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
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
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Comment
                </label>

                <textarea
                  className="w-full rounded-2xl border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30"
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
                  className={`rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
                >
                  {saving ? "Submitting..." : "Submit Review"}
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Cancel
                </button>
              </div>

              {message && (
                <div className="rounded-2xl border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
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
