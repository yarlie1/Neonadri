"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle, XCircle, Clock3 } from "lucide-react";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

type Props = {
  postId: number;
  postOwnerUserId: string;
  benefitAmount: string | null;
  requestCount: number;
  isPostMatched: boolean;
  isCancelled: boolean;
  isViewerParticipant: boolean;
  myRequestId: number | null;
  myRequestStatus: string;
  meetupFinished: boolean;
};

export default function MatchRequestBox({
  postId,
  postOwnerUserId,
  benefitAmount,
  requestCount,
  isPostMatched,
  isCancelled,
  isViewerParticipant,
  myRequestId,
  myRequestStatus,
  meetupFinished,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "info">("info");

  const normalizedStatus = String(myRequestStatus || "").toLowerCase();
  const hasPendingRequest = normalizedStatus === "pending" && !!myRequestId;
  const hasMatchedRequest = isViewerParticipant;
  const isUnavailableBecauseMatched = isPostMatched && !isViewerParticipant;
  const isUnavailableBecauseExpired = meetupFinished && !hasMatchedRequest;
  const isUnavailableBecauseCancelled = isCancelled;
  const isRejectedRequest = normalizedStatus === "rejected";
  const headerEyebrow = isUnavailableBecauseCancelled
    ? "Meetup cancelled"
    : hasMatchedRequest
    ? "Confirmed meetup"
    : isUnavailableBecauseExpired
    ? "Meetup expired"
    : isUnavailableBecauseMatched
    ? "Meetup closed"
    : "Join this meetup";
  const headerTitle = isUnavailableBecauseCancelled
    ? "This meetup was cancelled"
    : hasMatchedRequest
    ? "You're in"
    : isUnavailableBecauseExpired
    ? "Meetup expired"
    : isUnavailableBecauseMatched
    ? "Spot filled"
    : "Request to join";
  const headerDescription = isUnavailableBecauseCancelled
    ? "The host cancelled this meetup. You can still review the details here."
    : hasMatchedRequest
    ? "Your request was accepted and this meetup is now confirmed."
    : isUnavailableBecauseExpired
    ? "This meetup has already passed, so new requests are no longer available."
    : isUnavailableBecauseMatched
    ? "This meetup already has a confirmed guest, so new requests are closed."
    : "Ask to join this meetup. The host can approve your request.";

  const handleRequestMatch = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await fetch("/api/match-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          postOwnerUserId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
        return;
      }

      if (!response.ok) {
        setMessage(payload?.error || "Failed to send request.");
        setMessageType("info");
        return;
      }

      setMessage("Request sent.");
      setMessageType("success");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!myRequestId) return;

    setCancelLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const response = await fetch("/api/match-requests", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: myRequestId,
        }),
      });

      const payload = await response.json().catch(() => null);

      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/posts/${postId}`)}`);
        return;
      }

      if (!response.ok) {
        setMessage(payload?.error || "Failed to cancel request.");
        return;
      }

      setMessage("Your request has been cancelled.");
      setMessageType("success");
      router.refresh();
    } finally {
      setCancelLoading(false);
    }
  };

  const requestCountLabel =
    requestCount === 1 ? "1 request so far" : `${requestCount} requests so far`;

  return (
    <div className={`${APP_SURFACE_CARD_CLASS} px-6 py-6`}>
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d7e0e6] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)]">
          <Send className="h-5 w-5 text-[#71828c]" />
        </div>
        <div className="min-w-0">
          <div className={APP_EYEBROW_CLASS}>
            {headerEyebrow}
          </div>
          <h2 className="mt-1 text-[1.45rem] font-black tracking-[-0.04em] text-[#24323c]">
            {headerTitle}
          </h2>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className={`rounded-full px-3 py-[0.3125rem] text-xs font-medium leading-none ${APP_PILL_INACTIVE_CLASS}`}>
          {isPostMatched ? "Spot filled" : "Host approval"}
        </div>
        <div className={`rounded-full px-3 py-[0.3125rem] text-xs font-medium leading-none ${APP_PILL_INACTIVE_CLASS}`}>
          {requestCountLabel}
        </div>
      </div>

      <p className={`mt-4 ${APP_BODY_TEXT_CLASS}`}>
        {headerDescription}
      </p>
      {!hasMatchedRequest &&
        !isUnavailableBecauseCancelled &&
        !isUnavailableBecauseMatched &&
        !isUnavailableBecauseExpired &&
        !isRejectedRequest && (
        <p className={`mt-1 ${APP_BODY_TEXT_CLASS}`}>
          Cost support is only for the activity, not attendance or time.
        </p>
      )}

      <div className={`mt-5 rounded-[22px] px-4 py-4 ${APP_SOFT_CARD_CLASS}`}>
        <div className={APP_EYEBROW_CLASS}>
          Status
        </div>
        <div className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
          {isUnavailableBecauseCancelled
            ? "This meetup is no longer active. New requests are closed, and confirmed chat is now read-only."
            : hasMatchedRequest
            ? "This meetup is confirmed. You can review the details above and connect with the host here."
            : isUnavailableBecauseExpired
            ? "This meetup has already ended, so requests are closed."
            : isUnavailableBecauseMatched
            ? "This meetup is no longer accepting requests because the host already confirmed a guest."
            : hasPendingRequest
            ? "Your request is with the host now. You can leave it pending or cancel it here."
            : isRejectedRequest
            ? "This request was declined. You can review the meetup details, but the current request is closed."
            : "Once you send a request, the host can review your profile and accept or decline from their dashboard."}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {isUnavailableBecauseCancelled ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <AlertCircle className="h-4 w-4" />
            Cancelled by host
          </div>
        ) : hasMatchedRequest ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <CheckCircle2 className="h-4 w-4" />
            Confirmed
          </div>
        ) : isUnavailableBecauseExpired ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <AlertCircle className="h-4 w-4" />
            Meetup expired
          </div>
        ) : isUnavailableBecauseMatched ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <AlertCircle className="h-4 w-4" />
            Already confirmed with someone else
          </div>
        ) : hasPendingRequest ? (
          <>
            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
              <Clock3 className="h-4 w-4" />
              Request sent
            </div>

            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={cancelLoading}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              <XCircle className="h-4 w-4" />
              {cancelLoading ? "Cancelling..." : "Cancel request"}
            </button>
          </>
        ) : isRejectedRequest ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <AlertCircle className="h-4 w-4" />
            Request declined
          </div>
        ) : (
          <button
              type="button"
              onClick={handleRequestMatch}
              disabled={loading}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Request to join"}
            </button>
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-[22px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
          <div className="flex items-start gap-2">
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#71828c]" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#71828c]" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
