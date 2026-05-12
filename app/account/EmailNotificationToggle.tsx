"use client";

import { useState } from "react";
import { LoaderCircle, Mail, MailX } from "lucide-react";

export default function EmailNotificationToggle({
  initialEnabled,
}: {
  initialEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);

  const handleToggle = async () => {
    if (busy) return;

    const nextEnabled = !enabled;
    setEnabled(nextEnabled);
    setBusy(true);

    try {
      const response = await fetch("/api/account/email-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: nextEnabled }),
      });

      if (!response.ok) {
        throw new Error("EMAIL_NOTIFICATION_UPDATE_FAILED");
      }
    } catch (error) {
      console.error("[email-notification-toggle] update failed", error);
      setEnabled(!nextEnabled);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-[#24323c]">
          Email notifications
        </div>
        <div className="mt-1 text-xs font-medium text-[#728089]">
          Important updates by email
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        disabled={busy}
        className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-60 ${
          enabled
            ? "border-[#b8c6cf] bg-[linear-gradient(180deg,#dce7ed_0%,#aebdc7_100%)]"
            : "border-[#d9e2e8] bg-[linear-gradient(180deg,#ffffff_0%,#edf2f5_100%)]"
        }`}
        title={enabled ? "Email notifications on" : "Email notifications off"}
        aria-label={enabled ? "Email notifications on" : "Email notifications off"}
      >
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#64727a] shadow-[0_6px_14px_rgba(118,126,133,0.22)] transition ${
            enabled ? "translate-x-7" : "translate-x-1"
          }`}
        >
          {busy ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
          ) : enabled ? (
            <Mail className="h-3.5 w-3.5" />
          ) : (
            <MailX className="h-3.5 w-3.5" />
          )}
        </span>
      </button>
    </div>
  );
}
