"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle2, AlertCircle, XCircle, Clock3 } from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

type Props = {
  postId: number;
  postOwnerUserId: string;
  requestCount: number;
  isPostMatched: boolean;
  myRequestId: number | null;
  myRequestStatus: string;
};

export default function MatchRequestBox({
  postId,
  postOwnerUserId,
  requestCount,
  isPostMatched,
  myRequestId,
  myRequestStatus,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "info">("info");

  const normalizedStatus = String(myRequestStatus || "").toLowerCase();
  const hasPendingRequest = normalizedStatus === "pending" && !!myRequestId;
  const hasMatchedRequest =
    isPostMatched || normalizedStatus === "matched" || normalizedStatus === "accepted";
  const isRejectedRequest = normalizedStatus === "rejected";

  const handleRequestMatch = async () => {
    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in first.");
        setMessageType("info");
        return;
      }

      if (user.id === postOwnerUserId) {
        setMessage("You cannot request your own meetup.");
        setMessageType("info");
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from("match_requests")
        .select("id, status")
        .eq("post_id", postId)
        .eq("requester_user_id", user.id)
        .eq("post_owner_user_id", postOwnerUserId)
        .maybeSingle();

      if (existingError) {
        setMessage(existingError.message);
        setMessageType("info");
        return;
      }

      if (existing) {
        const status = String(existing.status || "").toLowerCase();

        if (status === "pending") {
          setMessage("Your request has already been sent.");
        } else if (status === "accepted") {
          setMessage("Your request was already accepted.");
        } else if (status === "rejected") {
          setMessage("This request was previously declined.");
        } else {
          setMessage(`Request already exists: ${existing.status}`);
        }

        setMessageType("info");
        return;
      }

      const { error } = await supabase.from("match_requests").insert({
        post_id: postId,
        requester_user_id: user.id,
        post_owner_user_id: postOwnerUserId,
        status: "pending",
      });

      if (error) {
        if (error.code === "23505") {
          setMessage("Your request has already been sent.");
          setMessageType("info");
          return;
        }

        setMessage(error.message);
        setMessageType("info");
        return;
      }

      setMessage("Match request sent successfully.");
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
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Please sign in first.");
        return;
      }

      const { error } = await supabase
        .from("match_requests")
        .delete()
        .eq("id", myRequestId)
        .eq("requester_user_id", user.id)
        .eq("status", "pending");

      if (error) {
        setMessage(error.message);
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
    <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f6eee6]">
            <Send className="h-5 w-5 text-[#8a7f74]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
              Join this meetup
            </div>
            <h2 className="mt-2 text-[1.45rem] font-black tracking-[-0.04em] text-[#2f2a26]">
              Request Match
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#6f655c]">
              Send your request to the host and wait for approval.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-[#f6eee6] px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
            {isPostMatched ? "Match complete" : "Host approval"}
          </div>
          <div className="rounded-full border border-[#e7ddd2] bg-white px-3 py-1.5 text-xs font-medium text-[#7a6b61]">
            {requestCountLabel}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">
          Status
        </div>
        <div className="mt-2 text-sm leading-6 text-[#6b5f52]">
          {hasMatchedRequest
            ? "This meetup already has a confirmed match."
            : hasPendingRequest
            ? "Your request is with the host now. You can leave it pending or cancel it here."
            : isRejectedRequest
            ? "This request was declined. You can review the meetup details, but the current request is closed."
            : "Once you send a request, the host can review your profile and accept or decline from their dashboard."}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {hasMatchedRequest ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-[#efe7dc] px-4 py-2.5 text-sm font-medium text-[#5f5347]">
            <CheckCircle2 className="h-4 w-4" />
            Match completed
          </div>
        ) : hasPendingRequest ? (
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-[#efe7dc] px-4 py-2.5 text-sm font-medium text-[#5f5347]">
              <Clock3 className="h-4 w-4" />
              Request sent
            </div>

            <button
              type="button"
              onClick={handleCancelRequest}
              disabled={cancelLoading}
              className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2.5 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              {cancelLoading ? "Cancelling..." : "Cancel Request"}
            </button>
          </>
        ) : isRejectedRequest ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-4 py-2.5 text-sm font-medium text-[#6b5f52]">
            <AlertCircle className="h-4 w-4" />
            Request declined
          </div>
        ) : (
          <button
              type="button"
              onClick={handleRequestMatch}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending..." : "Send Request"}
            </button>
        )}
      </div>

      {message && (
        <div
          className={`mt-5 rounded-[22px] border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-[#dccfc2] bg-[#efe7dc] text-[#5f5347]"
              : "border-[#e7ddd2] bg-[#f4ece4] text-[#6b5f52]"
          }`}
        >
          <div className="flex items-start gap-2">
            {messageType === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
            ) : (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#8a7f74]" />
            )}
            <span>{message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
