"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Eye,
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
    <div className="rounded-[30px] border border-[#eadfd3] bg-white/92 px-6 py-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
            Host controls
          </div>
          <h2 className="mt-2 text-[1.7rem] font-black tracking-[-0.04em] text-[#2f2a26]">
            {isMatched ? "This meetup is matched" : "Choose your guest"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-[#6f655c]">
            {isMatched
              ? "You already confirmed this meetup. Review who matched and keep the plan locked in."
              : pendingRequestCount > 0
              ? `${pendingRequestCount} pending request${pendingRequestCount === 1 ? "" : "s"} waiting for your decision.`
              : "No requests yet. You can still edit the meetup while it is open."}
          </p>
        </div>

      </div>

      {isMatched && matchedPartner ? (
        <div className="mt-5 rounded-[24px] border border-[#dccfc2] bg-[#efe7dc] p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a5647]">
                Match completed
              </div>
              <div className="mt-2 text-lg font-semibold text-[#2f2a26]">
                You matched with {matchedPartner.displayName}
              </div>
              <div className="mt-2 text-sm text-[#6b5f52]">
                {[matchedPartner.gender || "Unknown", matchedPartner.ageGroup || null]
                  .filter(Boolean)
                  .join(" / ")}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/profile/${matchedPartner.userId}`}
                className="inline-flex items-center gap-2 rounded-full border border-[#ccb9a9] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
              >
                <Eye className="h-4 w-4" />
                View Profile
              </Link>
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
                className="rounded-[22px] border border-[#eadfd3] bg-[#fcfaf7] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9d7362]">
                      Request
                    </div>
                    <div className="mt-1 text-lg font-semibold text-[#2f2a26]">
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

                  <div className="rounded-full border border-[#e7ddd2] bg-white px-3 py-1.5 text-xs font-medium uppercase tracking-[0.12em] text-[#7b7067]">
                    {request.status}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/profile/${request.requesterUserId}`}
                    className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]"
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
                        className="inline-flex items-center gap-2 rounded-full bg-[#a48f7a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#927d69] disabled:opacity-50"
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
                        className="inline-flex items-center gap-2 rounded-full border border-[#dccfc2] bg-white px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4] disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {processingRequestId === request.id && processingAction === "rejected"
                          ? "Declining..."
                          : "Decline"}
                      </button>
                    </>
                  ) : (
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#e7ddd2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#6b5f52]">
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
        <div className="mt-5 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-4 text-sm leading-6 text-[#6b5f52]">
          No one has requested this meetup yet. You can keep it open or edit the details first.
        </div>
      )}

      {isMatched && !matchedPartner && (
        <div className="mt-5 rounded-[22px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-4 text-sm leading-6 text-[#6b5f52]">
          A match has been recorded for this meetup.
        </div>
      )}
    </div>
  );
}
