"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import {
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

export default function AccountPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordMessageTone, setPasswordMessageTone] = useState<"default" | "danger">("default");

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

  return (
    <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
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

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handlePasswordUpdate()}
          disabled={isSavingPassword || !canSubmitPassword}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_PRIMARY_CLASS}`}
        >
          <KeyRound className="h-4 w-4" />
          {isSavingPassword ? "Updating..." : "Change password"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/account")}
          className={`inline-flex items-center rounded-full px-4 py-2.5 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
        >
          Back to account
        </button>
      </div>

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
    </section>
  );
}
