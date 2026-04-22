"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SUBTLE_TEXT_CLASS,
} from "../designSystem";

export default function AdultCheckForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleConfirm = async () => {
    if (!confirmed || submitting) return;

    try {
      setSubmitting(true);
      setMessage("");

      const response = await fetch("/api/account/confirm-adult", {
        method: "POST",
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage(payload?.error || "We couldn't update your confirmation.");
        return;
      }

      window.location.replace(nextPath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <label className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-3 rounded-[24px] border border-[#dbe3e8] bg-[linear-gradient(180deg,#ffffff_0%,#eef3f6_100%)] px-4 py-4 text-sm text-[#55636b] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)]">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
          className="!mt-0.5 !h-4 !w-4 !appearance-auto !rounded !border-[#c7d2d9] !p-0 !shadow-none !outline-none !ring-0 accent-[#8fa1ac]"
        />
        <span className="leading-6">
          I confirm that I am 18 or older and understand that Neonadri is for adults only.
        </span>
      </label>

      {!confirmed ? (
        <p className={`mt-3 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
          You need to confirm you are 18 or older before continuing.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!confirmed || submitting}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${APP_BUTTON_PRIMARY_CLASS}`}
        >
          {submitting ? "Saving..." : "Continue"}
        </button>

        <a
          href="/api/auth/logout?redirect=%2Flogin"
          className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
        >
          Log out
        </a>
      </div>

      {message ? (
        <p className={`mt-4 rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
