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
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

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
    <div className={`relative overflow-hidden ${APP_SURFACE_CARD_CLASS} px-6 py-6`}>
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/55 blur-2xl" />
      <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#c9d4db]/35 blur-2xl" />
      <div className="relative">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className={APP_EYEBROW_CLASS}>
              Host controls
            </div>
            <h2 className="mt-2 text-[1.7rem] font-black tracking-[-0.04em] text-[#25333d]">
              {isMatched ? "This meetup is matched" : "Choose your guest"}
            </h2>
            {!isMatched && (
              <p className={`mt-1 max-w-xl ${APP_BODY_TEXT_CLASS}`}>
                {pendingRequestCount > 0
                  ? `${pendingRequestCount} pending request${pendingRequestCount === 1 ? "" : "s"} waiting for your decision.`
                  : "No requests yet. You can still edit the meetup while it is open."}
              </p>
            )}
          </div>

          {!isMatched && (
            <div className={`rounded-full px-4 py-[0.45rem] text-sm font-medium leading-none backdrop-blur ${APP_PILL_ACTIVE_CLASS}`}>
              {`${pendingRequestCount} pending`}
            </div>
          )}
        </div>

        {isMatched && matchedPartner ? (
          <div className={`mt-5 ${APP_SOFT_CARD_CLASS} p-4 backdrop-blur`}>
            <div>
              <div className={APP_EYEBROW_CLASS}>
                Match completed
              </div>
              <div className="mt-2 text-lg font-semibold text-[#25333d]">
                You matched with {matchedPartner.displayName}
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
                  className={`${APP_SOFT_CARD_CLASS} p-4 backdrop-blur`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className={APP_EYEBROW_CLASS}>
                        Request
                      </div>
                      <div className="mt-1 text-lg font-semibold text-[#25333d]">
                        {request.requesterName}
                      </div>
                      <div className="mt-1 text-sm text-[#64717a]">
                        {[request.requesterGender || "Unknown", request.requesterAgeGroup || null]
                          .filter(Boolean)
                          .join(" / ")}
                      </div>
                      <div className="mt-2 text-sm text-[#86929a]">
                        {new Date(request.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className={`rounded-full px-3 py-[0.3125rem] text-xs font-medium uppercase leading-none tracking-[0.12em] ${APP_PILL_INACTIVE_CLASS}`}>
                      {request.status}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/profile/${request.requesterUserId}`}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
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
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          {processingRequestId === request.id && processingAction === "accepted"
                            ? "Accepting..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRequestAction(request.id, "rejected")}
                          disabled={processingRequestId !== null}
                          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${APP_BUTTON_SECONDARY_CLASS}`}
                        >
                          <XCircle className="h-4 w-4" />
                          {processingRequestId === request.id && processingAction === "rejected"
                            ? "Declining..."
                            : "Decline"}
                        </button>
                      </>
                    ) : (
                      <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${APP_PILL_INACTIVE_CLASS}`}>
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
          <div className={`mt-5 ${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm leading-6 ${APP_BODY_TEXT_CLASS} backdrop-blur`}>
            No one has requested this meetup yet. You can keep it open or edit the details first.
          </div>
        )}

        {isMatched && !matchedPartner && (
          <div className={`mt-5 ${APP_SOFT_CARD_CLASS} px-4 py-4 text-sm leading-6 ${APP_BODY_TEXT_CLASS} backdrop-blur`}>
            A match has been recorded for this meetup.
          </div>
        )}
      </div>
    </div>
  );
}
