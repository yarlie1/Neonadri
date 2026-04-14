"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  UserCircle2,
  XCircle,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/client";

type RequesterRow = {
  id: number;
  requesterUserId: string;
  requesterName: string;
  requesterGender: string;
  requesterAgeGroup: string;
  createdAt: string;
  status: string;
};

type MatchedPartner = {
  userId: string;
  displayName: string;
  gender: string;
  ageGroup: string;
};

type Props = {
  postId: number;
  isMatched: boolean;
  pendingRequestCount: number;
  requests: RequesterRow[];
  matchedPartner: MatchedPartner | null;
};

export default function OwnerMatchPanel({
  postId,
  isMatched,
  pendingRequestCount,
  requests,
  matchedPartner,
}: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);
  const [processingAction, setProcessingAction] = useState<"accepted" | "rejected" | null>(
    null
  );

  const handleRequestAction = async (
    requestId: number,
    nextStatus: "accepted" | "rejected"
  ) => {
    if (processingRequestId !== null) return;

    setProcessingRequestId(requestId);
    setProcessingAction(nextStatus);

    const rpcName =
      nextStatus === "accepted" ? "accept_match_request" : "reject_match_request";

    const { data, error } = await supabase.rpc(rpcName, {
      p_request_id: requestId,
    });

    if (error) {
      alert(error.message);
      setProcessingRequestId(null);
      setProcessingAction(null);
      return;
    }

    const result = data as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      alert(result?.error || "Failed to update request");
      setProcessingRequestId(null);
      setProcessingAction(null);
      return;
    }

    router.refresh();
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#ece0d4] bg-[radial-gradient(circle_at_top_left,#fffbf7_0%,#f6e8dd_44%,#edd8ca_100%)] px-6 py-6 shadow-[0_18px_42px_rgba(92,69,52,0.08)]">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#74675d]">
              Host controls
            </div>
            <h2 className="mt-2 text-[1.7rem] font-black tracking-[-0.04em] text-[#2b1f1a]">
              {isMatched ? "This meetup is matched" : "Choose your guest"}
            </h2>
            {!isMatched && (
              <p className="mt-1 max-w-xl text-sm leading-6 text-[#5f453b]">
                {pendingRequestCount > 0
                  ? `${pendingRequestCount} pending request${pendingRequestCount === 1 ? "" : "s"} waiting for your decision.`
                  : "No requests yet. You can still edit the meetup while it is open."}
              </p>
            )}
          </div>

          {!isMatched && (
            <div className="rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-4 py-[0.45rem] text-sm font-medium leading-none text-[#6b5f52] backdrop-blur">
              {`${pendingRequestCount} pending`}
            </div>
          )}
        </div>

        {isMatched && matchedPartner ? (
          <div className="mt-5 rounded-[24px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] p-4 backdrop-blur">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                Match completed
              </div>
              <div className="mt-2 text-lg font-semibold text-[#2b1f1a]">
                You matched with {matchedPartner.displayName}
              </div>
              <div className="mt-2 text-sm text-[#6b5f52]">
                Guest details are shown below.
              </div>
            </div>
          </div>
        ) : null}

        {!isMatched && requests.length > 0 && (
          <div className="mt-5 space-y-3">
            {requests.map((request) => {
              const isPending = request.status === "pending";

              return (
                <div
                  key={request.id}
                  className="rounded-[22px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] p-4 backdrop-blur"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d7362]">
                        Request
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#2b1f1a]">
                        {request.requesterName}
                      </div>
                      <div className="mt-1 text-sm text-[#6f655c]">
                        {[request.requesterGender || "Unknown", request.requesterAgeGroup || null]
                          .filter(Boolean)
                          .join(" / ")}
                      </div>
                      <div className="mt-2 text-sm text-[#8b7f74]">
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#faf6f1_0%,#f3ebe2_100%)] px-3 py-[0.3125rem] text-xs font-medium uppercase leading-none tracking-[0.12em] text-[#7b7067]">
                      {request.status}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/profile/${request.requesterUserId}`}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#fbf4ed]"
                    >
                      <UserCircle2 className="h-4 w-4" />
                      View Profile
                    </Link>

                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleRequestAction(request.id, "accepted")}
                          disabled={processingRequestId !== null}
                          className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_18px_rgba(92,69,52,0.10)] transition hover:bg-[#927d69] disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {processingRequestId === request.id && processingAction === "accepted"
                            ? "Accepting..."
                            : "Select"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestAction(request.id, "rejected")}
                          disabled={processingRequestId !== null}
                          className="inline-flex items-center gap-2 rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#fbf4ed] disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          {processingRequestId === request.id && processingAction === "rejected"
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#ece0d4] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-2 text-sm font-medium text-[#6b5f52]">
                        <Clock3 className="h-4 w-4" />
                        {request.status}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isMatched && requests.length === 0 && (
          <div className="mt-5 rounded-[22px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-4 text-sm leading-6 text-[#6b5f52] backdrop-blur">
            No one has requested this meetup yet. You can keep it open or edit the details first.
          </div>
        )}

        {isMatched && !matchedPartner && (
          <div className="mt-5 rounded-[22px] border border-[#ece1d5] bg-[linear-gradient(180deg,#fffdfa_0%,#f7efe7_100%)] px-4 py-4 text-sm leading-6 text-[#6b5f52] backdrop-blur">
            A match has been recorded for this meetup.
          </div>
        )}
      </div>
    </div>
  );
}
