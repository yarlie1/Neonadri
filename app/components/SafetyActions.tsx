"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
} from "../designSystem";
import { REPORT_REASON_OPTIONS, type ReportReason } from "../../lib/safety";

type ReportConfig = {
  targetType: "user" | "post" | "chat";
  targetId: string;
  label: string;
};

export default function SafetyActions({
  currentUserId,
  targetUserId,
  reportConfig,
  className = "",
}: {
  currentUserId: string | null;
  targetUserId?: string | null;
  reportConfig?: ReportConfig | null;
  className?: string;
}) {
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<"report" | "block" | null>(null);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const canBlock = useMemo(
    () => Boolean(currentUserId && targetUserId && currentUserId !== targetUserId),
    [currentUserId, targetUserId]
  );
  const canReport = Boolean(currentUserId && reportConfig);

  if (!canBlock && !canReport) return null;

  const handleReport = async () => {
    if (!reportConfig) return;
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: reportConfig.targetType,
        targetId: reportConfig.targetId,
        reason,
        detail,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not submit report.");
      return;
    }

    setDetail("");
    setOpenPanel(null);
    setMessage("Thanks. Your report was submitted.");
  };

  const handleBlock = async () => {
    if (!targetUserId) return;
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/blocks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blockedUserId: targetUserId }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not block user.");
      return;
    }

    setOpenPanel(null);
    setMessage("User blocked.");
    router.refresh();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {canReport ? (
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === "report" ? null : "report")}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Report
          </button>
        ) : null}
        {canBlock ? (
          <button
            type="button"
            onClick={() => setOpenPanel(openPanel === "block" ? null : "block")}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Block user
          </button>
        ) : null}
      </div>

      {openPanel === "report" && reportConfig ? (
        <div className={`${APP_SOFT_CARD_CLASS} p-4`}>
          <div className={APP_EYEBROW_CLASS}>Report</div>
          <div className="mt-2 text-sm font-semibold text-[#24323c]">
            Report this {reportConfig.label.toLowerCase()}
          </div>
          <p className="mt-1 text-sm text-[#6c7880]">
            Tell us what happened. Your report will be reviewed privately.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {REPORT_REASON_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setReason(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  reason === option.value ? APP_ROW_SURFACE_CLASS : APP_PILL_INACTIVE_CLASS
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value.slice(0, 1000))}
            placeholder="Optional details"
            className="mt-3 min-h-[100px] w-full rounded-[16px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-3 text-sm text-[#24323c] outline-none"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleReport()}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_ROW_SURFACE_CLASS}`}
            >
              {submitting ? "Submitting..." : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setOpenPanel(null)}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {openPanel === "block" && canBlock ? (
        <div className={`${APP_SOFT_CARD_CLASS} p-4`}>
          <div className={APP_EYEBROW_CLASS}>Block</div>
          <div className="mt-2 text-sm font-semibold text-[#24323c]">
            Block this user?
          </div>
          <p className="mt-1 text-sm text-[#6c7880]">
            You will no longer be able to send each other new requests or open new chats.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => void handleBlock()}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_ROW_SURFACE_CLASS}`}
            >
              {submitting ? "Blocking..." : "Block user"}
            </button>
            <button
              type="button"
              onClick={() => setOpenPanel(null)}
              className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className={`rounded-[16px] px-3.5 py-2 text-xs font-medium text-[#55626a] ${APP_SOFT_CARD_CLASS}`}>
          {message}
        </div>
      ) : null}
    </div>
  );
}
