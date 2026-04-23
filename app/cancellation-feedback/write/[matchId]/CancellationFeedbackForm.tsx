"use client";

import { useState } from "react";
import { Clock3, MapPin, MessageSquareText, Sparkles } from "lucide-react";
import { formatMeetingTime } from "../../../../lib/meetingTime";
import {
  CANCELLATION_FEEDBACK_OPTIONS,
  type CancellationFeedbackType,
} from "../../../../lib/cancellationFeedback";
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

type CancellationFeedbackFormProps = {
  matchId: string;
  initialCanSubmit: boolean;
  initialMessage: string;
  initialPostInfo: PostRow | null;
  initialCancelledByName: string;
  initialUserTimeZone: string;
};

export default function CancellationFeedbackForm({
  matchId,
  initialCanSubmit,
  initialMessage,
  initialPostInfo,
  initialCancelledByName,
  initialUserTimeZone,
}: CancellationFeedbackFormProps) {
  const [feedbackType, setFeedbackType] = useState<CancellationFeedbackType | null>(
    null
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(initialMessage);

  const handleSubmit = async () => {
    if (!initialCanSubmit) return;

    if (!feedbackType) {
      setMessage("Choose the option that best describes how the cancellation felt.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch("/api/cancellation-feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: matchId,
          feedback_type: feedbackType,
          note,
        }),
      });

      const result = await response.json();
      setSaving(false);

      if (!response.ok) {
        setMessage(result.error || "Failed to submit cancellation feedback.");
        return;
      }

      window.location.href = "/dashboard?tab=matches&cancellation_feedback=1";
    } catch (error) {
      setSaving(false);
      setMessage(error instanceof Error ? error.message : "Server error");
    }
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6`}>
      <div className="mx-auto max-w-xl space-y-4">
        <div className={`${APP_SURFACE_CARD_CLASS} rounded-[28px] p-6`}>
          <h1 className="text-2xl font-bold text-[#24323c]">Cancellation Feedback</h1>

          {initialPostInfo && (
            <div className={`mt-4 rounded-[20px] p-4 ${APP_SOFT_CARD_CLASS}`}>
              <div className={APP_EYEBROW_CLASS}>Cancelled meetup</div>
              <div className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#24323c]">
                {initialCancelledByName || "Host"}
              </div>
              <div className={`mt-2 text-sm leading-6 ${APP_BODY_TEXT_CLASS}`}>
                This feedback stays internal and helps us understand how cancellations are being handled.
              </div>

              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-[#66727a]">
                  <Sparkles className="h-4 w-4 text-[#71828c]" />
                  <span>{initialPostInfo.meeting_purpose || "Meetup"}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-[#66727a]">
                  <MapPin className="h-4 w-4 text-[#71828c]" />
                  <span>{initialPostInfo.place_name || initialPostInfo.location || "No place"}</span>
                </div>

                {initialPostInfo.meeting_time && (
                  <div className="flex items-center gap-2 text-sm text-[#66727a]">
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
            </div>
          )}

          {!initialCanSubmit ? (
            <div className={`mt-5 rounded-2xl px-4 py-3 text-sm ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
              {message || "You cannot leave cancellation feedback for this meetup."}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  How did the cancellation feel?
                </label>
                <div className="grid gap-2">
                  {CANCELLATION_FEEDBACK_OPTIONS.map((option) => {
                    const active = feedbackType === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFeedbackType(option.value)}
                        className={`rounded-[20px] border px-4 py-3 text-left transition ${
                          active ? APP_PILL_ACTIVE_CLASS : APP_PILL_INACTIVE_CLASS
                        }`}
                      >
                        <div className="text-sm font-semibold text-[#24323c]">
                          {option.label}
                        </div>
                        <div className="mt-1 text-xs leading-5 text-[#66727a]">
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Add a note
                </label>
                <textarea
                  className="w-full rounded-2xl border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30"
                  rows={5}
                  placeholder="Anything else we should know about the cancellation?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className={`rounded-2xl px-4 py-3 text-sm ${APP_SOFT_CARD_CLASS} ${APP_BODY_TEXT_CLASS}`}>
                <div className="inline-flex items-center gap-2 font-medium text-[#52616a]">
                  <MessageSquareText className="h-4 w-4 text-[#71828c]" />
                  Internal only
                </div>
                <div className="mt-1">
                  This feedback is not shown on profiles or meetup cards.
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className={`rounded-full px-5 py-3 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
                >
                  {saving ? "Submitting..." : "Submit Feedback"}
                </button>

                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Back
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
