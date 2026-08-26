"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Send, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";
import { getProfileCompletionPath } from "../../../lib/profileCompletion";

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
  compact?: boolean;
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
  compact = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "info">("info");
  const [isRedditVisitor, setIsRedditVisitor] = useState(false);
  const searchString = searchParams.toString();
  const nextPath = `${pathname || `/posts/${postId}`}${searchString ? `?${searchString}` : ""}`;

  useEffect(() => {
    const utmSource = searchParams.get("utm_source")?.toLowerCase();
    const utmMedium = searchParams.get("utm_medium")?.toLowerCase();
    const utmCampaign = searchParams.get("utm_campaign")?.toLowerCase();
    const referrer = document.referrer.toLowerCase();

    setIsRedditVisitor(
      searchParams.get("joinCue") === "1" ||
        utmSource === "reddit" ||
        !!utmMedium?.includes("reddit") ||
        !!utmCampaign?.includes("reddit") ||
        referrer.includes("reddit.com")
    );
  }, [searchParams]);

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
    : "Join this 1:1 meetup";
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
    ? "Cancelled by host."
    : hasMatchedRequest
    ? "Request accepted."
    : isUnavailableBecauseExpired
    ? "Meetup ended."
    : isUnavailableBecauseMatched
    ? "Spot filled."
    : "Send a request to join.";

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
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      if (response.status === 403 && payload?.profileIncomplete) {
        router.push(getProfileCompletionPath(nextPath));
        return;
      }

      if (!response.ok) {
        setMessage(payload?.error || "Failed to send request.");
        setMessageType("info");
        return;
      }

      setMessage("Request sent. Waiting for host approval.");
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
        router.push(`/login?next=${encodeURIComponent(nextPath)}`);
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
  const showRedditRequestCue =
    !compact &&
    isRedditVisitor &&
    !loading &&
    !hasPendingRequest &&
    !isRejectedRequest &&
    !isUnavailableBecauseCancelled &&
    !isUnavailableBecauseExpired &&
    !isUnavailableBecauseMatched &&
    !hasMatchedRequest;

  return (
    <div className={compact ? "" : `${APP_SURFACE_CARD_CLASS} px-5 py-5`}>
      <style jsx global>{`
        @keyframes neonadri-request-pulse {
          0%, 100% { box-shadow: 0 0 0 3px #ffffff, 0 0 0 7px #111111; }
          50% { box-shadow: 0 0 0 4px #ffffff, 0 0 0 11px #111111; }
        }
      `}</style>
      {!compact ? (
        <>
          <div className={APP_EYEBROW_CLASS}>{headerEyebrow}</div>
          <h2 className="mt-2 text-2xl font-black leading-tight tracking-[-0.03em] text-[#111111]">
            {headerTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#333333]">{headerDescription}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-[#111111]">
            <span className="rounded-[6px] border border-[#111111] px-2.5 py-1">
              {isPostMatched ? "Spot filled" : "Host approval"}
            </span>
            <span className="rounded-[6px] border border-[#111111] px-2.5 py-1">{requestCountLabel}</span>
          </div>
        </>
      ) : null}
      <div className={compact ? "mt-5" : "mt-5 flex flex-wrap items-center gap-3"}>
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
          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={cancelLoading}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            <XCircle className="h-4 w-4" />
            {cancelLoading ? "Cancelling..." : "Cancel request"}
          </button>
        ) : isRejectedRequest ? (
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
            <AlertCircle className="h-4 w-4" />
            Request declined
          </div>
        ) : (
          <div className={compact ? "relative grid gap-3" : "relative inline-flex flex-col items-start gap-3 sm:flex-row sm:items-center"}>
            {showRedditRequestCue ? (
              <div className="max-w-[240px] rounded-[8px] border-2 border-[#111111] bg-white px-4 py-3 text-sm leading-5 text-[#111111] sm:absolute sm:bottom-[calc(100%+12px)] sm:left-0 sm:z-10">
                <div className="font-black text-[#111111]">Ready to join?</div>
                <div className="mt-1 text-[#333333]">
                  Tap here to send your request to the host.
                </div>
                <div className="absolute -bottom-2 left-7 hidden h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#111111] bg-white sm:block" />
              </div>
            ) : null}
            <button
              type="button"
              onClick={handleRequestMatch}
              disabled={loading}
              className={`inline-flex min-h-[56px] items-center justify-center gap-2 rounded-[8px] border px-5 py-3 text-base font-black transition disabled:opacity-50 ${compact ? "w-full" : ""} ${APP_BUTTON_PRIMARY_CLASS} ${
                showRedditRequestCue
                  ? "border-[#111111] [animation:neonadri-request-pulse_1.45s_ease-in-out_infinite]"
                  : ""
              }`}
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Request to join"}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className="mt-5 rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#333333]">
          <div className="flex items-start gap-2">
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#111111]" />
            )}
            <span className={messageType === "success" ? "font-black text-[#111111]" : ""}>
              {message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
