"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_ROW_SURFACE_CLASS,
  APP_SOFT_CARD_CLASS,
} from "../designSystem";

export default function SafetyActions({
  currentUserId,
  targetUserId,
  className = "",
}: {
  currentUserId: string | null;
  targetUserId?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<"block" | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const canBlock = useMemo(
    () => Boolean(currentUserId && targetUserId && currentUserId !== targetUserId),
    [currentUserId, targetUserId]
  );

  if (!canBlock) return null;

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
