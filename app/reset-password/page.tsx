"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SOFT_CARD_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-9";

function hasRecoveryMarker() {
  if (typeof window === "undefined") return false;

  const query = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return (
    query.get("type") === "recovery" ||
    hash.get("type") === "recovery" ||
    query.has("code") ||
    query.has("token_hash")
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ResetPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("Checking your reset link...");
  const [messageTone, setMessageTone] = useState<"default" | "danger">(
    "default"
  );
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const trimmedPassword = password.trim();
  const trimmedConfirmPassword = confirmPassword.trim();
  const passwordTooShort =
    trimmedPassword.length > 0 && trimmedPassword.length < 8;
  const passwordsMismatch =
    trimmedPassword.length > 0 &&
    trimmedConfirmPassword.length > 0 &&
    trimmedPassword !== trimmedConfirmPassword;
  const canSubmit =
    isReady &&
    trimmedPassword.length >= 8 &&
    trimmedConfirmPassword.length >= 8 &&
    !passwordsMismatch &&
    !isSaving;

  useEffect(() => {
    let active = true;

    const resolveRecoverySession = async () => {
      let sessionResult = await supabase.auth.getSession();

      if (!sessionResult.data.session) {
        await wait(350);
        sessionResult = await supabase.auth.getSession();
      }

      if (!active) return;

      if (sessionResult.data.session) {
        setIsReady(true);
        setMessage("Choose your new password.");
        setMessageTone("default");
        return;
      }

      const recoveryLink = hasRecoveryMarker();
      if (!recoveryLink) {
        if (!active) return;
        setIsReady(false);
        setMessage("Open this page from the password reset link in your email.");
        setMessageTone("danger");
        return;
      }

      const currentUrl = new URL(window.location.href);
      const code = currentUrl.searchParams.get("code");
      const tokenHash = currentUrl.searchParams.get("token_hash");
      const typeValue = currentUrl.searchParams.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!active) return;

        if (error) {
          setIsReady(false);
          setMessage(error.message || "This reset link is no longer valid.");
          setMessageTone("danger");
          return;
        }

        currentUrl.searchParams.delete("code");
        currentUrl.searchParams.delete("type");
        currentUrl.searchParams.delete("next");
        window.history.replaceState(
          {},
          "",
          `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
        );
      }

      if (tokenHash && typeValue === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });

        if (!active) return;

        if (error) {
          setIsReady(false);
          setMessage(error.message || "This reset link is no longer valid.");
          setMessageTone("danger");
          return;
        }

        currentUrl.searchParams.delete("token_hash");
        currentUrl.searchParams.delete("type");
        currentUrl.searchParams.delete("next");
        window.history.replaceState(
          {},
          "",
          `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`
        );
      }

      if (sessionResult.error || !sessionResult.data.session) {
        setIsReady(false);
        setMessage("This reset link is missing or expired. Request a new one.");
        setMessageTone("danger");
        return;
      }

      setIsReady(true);
      setMessage("Choose your new password.");
      setMessageTone("default");
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" || (session && hasRecoveryMarker())) {
        setIsReady(true);
        setMessage("Choose your new password.");
        setMessageTone("default");
      }
    });

    void resolveRecoverySession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handlePasswordReset = async () => {
    if (trimmedPassword.length < 8) {
      setMessage("Use at least 8 characters for the new password.");
      setMessageTone("danger");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setMessage("The new password and confirmation do not match.");
      setMessageTone("danger");
      return;
    }

    setIsSaving(true);
    setMessage("");
    setMessageTone("default");

    const { error } = await supabase.auth.updateUser({
      password: trimmedPassword,
    });

    if (error) {
      setIsSaving(false);
      setMessage(error.message || "Could not reset password.");
      setMessageTone("danger");
      return;
    }

    const redirectTarget = encodeURIComponent("/login?message=password-reset");
    window.location.replace(`/api/auth/logout?redirect=${redirectTarget}`);
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={HERO_SURFACE_CLASS}>
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
            <div className="relative">
              <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
                Secure reset
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[40px]">
                Choose a new password and jump back in.
              </h1>
              <p className={`mt-3 max-w-lg sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
                This page only works from the reset link we emailed you. Once you save a new password, you can log in again right away.
              </p>
            </div>
          </section>

          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>New password</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              Reset password
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Use at least 8 characters. A fresh password will replace the old one immediately.
            </p>
            <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              For safety, this page requires the reset link from your email.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  New password
                </label>
                <input
                  type="password"
                  className={INPUT_CLASS}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={!isReady || isSaving}
                />
                {passwordTooShort ? (
                  <div className="mt-1.5 text-xs font-medium text-[#8a6458]">
                    Use at least 8 characters.
                  </div>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Confirm password
                </label>
                <input
                  type="password"
                  className={INPUT_CLASS}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                  disabled={!isReady || isSaving}
                />
                {passwordsMismatch ? (
                  <div className="mt-1.5 text-xs font-medium text-[#8a6458]">
                    Passwords do not match.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handlePasswordReset()}
                disabled={!canSubmit}
                className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                <KeyRound className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save new password"}
              </button>

              <Link
                href="/forgot-password"
                className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Request another link
              </Link>
            </div>

            {message ? (
              <div
                className={`mt-4 rounded-[18px] px-4 py-3 text-sm font-medium ${
                  messageTone === "danger"
                    ? "border border-[#eaded8] bg-[linear-gradient(180deg,#fffdfc_0%,#f7f0ed_100%)] text-[#775f55]"
                    : `${APP_SOFT_CARD_CLASS} text-[#55626a]`
                }`}
              >
                {message}
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
