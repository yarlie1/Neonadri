"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, KeyRound, Trash2 } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

export default function AccountSecurityActions() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageTone, setPasswordMessageTone] = useState<"default" | "danger">("default");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteMessageTone, setDeleteMessageTone] = useState<"default" | "danger">("default");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();
  const passwordTooShort = trimmedPassword.length > 0 && trimmedPassword.length < 8;
  const passwordsMismatch =
    trimmedPassword.length > 0 &&
    trimmedConfirmPassword.length > 0 &&
    trimmedPassword !== trimmedConfirmPassword;
  const canSubmitPassword =
    trimmedPassword.length >= 8 &&
    trimmedConfirmPassword.length >= 8 &&
    !passwordsMismatch;

  const handlePasswordUpdate = async () => {
    if (trimmedPassword.length < 8) {
      setPasswordMessage("Use at least 8 characters for the new password.");
      setPasswordMessageTone("danger");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setPasswordMessage("The new password and confirmation do not match.");
      setPasswordMessageTone("danger");
      return;
    }

    setIsSavingPassword(true);
    setPasswordMessage("");
    setPasswordMessageTone("default");

    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password: trimmedPassword }),
    });

    const payload = await response.json().catch(() => ({}));
    setIsSavingPassword(false);

    if (!response.ok) {
      setPasswordMessage(payload.error || "Could not change password.");
      setPasswordMessageTone("danger");
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordMessage("Password updated.");
    setPasswordMessageTone("default");
    router.refresh();
  };

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
      <div className={APP_EYEBROW_CLASS}>Security</div>
      <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
        Password and account access
      </h2>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className={`${APP_SOFT_CARD_CLASS} p-4`}>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#2d3b44]">
            <KeyRound className="h-4 w-4 text-[#71828c]" />
            Change password
          </div>
          <p className="mt-2 text-sm text-[#637079]">
            Set a new password for this account.
          </p>
          <p className="mt-1 text-xs text-[#7d8991]">
            Use at least 8 characters.
          </p>

          <div className="mt-4 space-y-3">
            <label className="block">
              <div className={`mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                New password
              </div>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-[16px] border border-[#d6dee4] bg-white px-4 py-3 text-sm text-[#2f3a42] outline-none transition focus:border-[#bcc8d0] focus:ring-2 focus:ring-[#dce5eb]"
                autoComplete="new-password"
              />
              {passwordTooShort ? (
                <div className="mt-1.5 text-xs font-medium text-[#8a6458]">
                  Use at least 8 characters.
                </div>
              ) : null}
            </label>

            <label className="block">
              <div className={`mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${APP_SUBTLE_TEXT_CLASS}`}>
                Confirm password
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-[16px] border border-[#d6dee4] bg-white px-4 py-3 text-sm text-[#2f3a42] outline-none transition focus:border-[#bcc8d0] focus:ring-2 focus:ring-[#dce5eb]"
                autoComplete="new-password"
              />
              {passwordsMismatch ? (
                <div className="mt-1.5 text-xs font-medium text-[#8a6458]">
                  Passwords do not match.
                </div>
              ) : null}
            </label>
          </div>

          <button
            type="button"
            onClick={() => void handlePasswordUpdate()}
            disabled={isSavingPassword || !canSubmitPassword}
            className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_PRIMARY_CLASS}`}
          >
            <KeyRound className="h-4 w-4" />
            {isSavingPassword ? "Updating..." : "Change password"}
          </button>

          {passwordMessage ? (
            <div
              className={`mt-4 rounded-[18px] px-4 py-3 text-sm font-medium ${
                passwordMessageTone === "danger"
                  ? "border border-[#eaded8] bg-[linear-gradient(180deg,#fffdfc_0%,#f7f0ed_100%)] text-[#775f55]"
                  : `${APP_SOFT_CARD_CLASS} text-[#55626a]`
              }`}
            >
              {passwordMessage}
            </div>
          ) : null}
        </div>

        <div className={`${APP_SOFT_CARD_CLASS} p-4`}>
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
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
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
        </div>
      </div>
    </section>
  );
}
