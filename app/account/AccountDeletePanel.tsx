"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2 } from "lucide-react";
import {
  APP_BUTTON_SECONDARY_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

export default function AccountDeletePanel() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageTone, setDeleteMessageTone] = useState<"default" | "danger">("default");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteMessage("");
    setDeleteMessageTone("default");

    const response = await fetch("/api/account/delete", {
      method: "POST",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      setIsDeleting(false);
      setDeleteMessage(payload.error || "Could not delete account.");
      setDeleteMessageTone("danger");
      return;
    }

    try {
      sessionStorage.clear();
    } catch {}

    const target = `/?account_deleted=${Date.now()}`;
    window.location.assign(
      `/api/auth/logout?redirect=${encodeURIComponent(target)}`
    );
  };

  return (
    <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#2d3b44]">
        <AlertTriangle className="h-4 w-4 text-[#8a6d62]" />
        Delete account
      </div>
      <p className="mt-2 text-sm text-[#637079]">
        Permanently remove your profile, meetups, requests, matches, and saved access.
      </p>

      <div className="mt-4 rounded-[18px] border border-[#eaded8] bg-[linear-gradient(180deg,#fffdfc_0%,#f7f0ed_100%)] px-4 py-3 text-sm text-[#775f55]">
        This cannot be undone.
      </div>

      {!confirmDelete ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            <Trash2 className="h-4 w-4" />
            Delete account
          </button>
          <button
            type="button"
            onClick={() => router.push("/account")}
            className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
          >
            Back to account
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="text-sm text-[#775f55]">
            Delete this account now?
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleDeleteAccount()}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-full border border-[#dfcfc8] bg-[linear-gradient(180deg,#fff9f7_0%,#f4e5df_100%)] px-4 py-2.5 text-sm font-medium text-[#7d584b] transition disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? "Deleting..." : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              disabled={isDeleting}
              className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {deleteMessage ? (
        <div
          className={`mt-4 rounded-[18px] px-4 py-3 text-sm font-medium ${
            deleteMessageTone === "danger"
              ? "border border-[#eaded8] bg-[linear-gradient(180deg,#fffdfc_0%,#f7f0ed_100%)] text-[#775f55]"
              : `${APP_SOFT_CARD_CLASS} text-[#55626a]`
          }`}
        >
          {deleteMessage}
        </div>
      ) : null}
    </section>
  );
}
