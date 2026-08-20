"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const INPUT_CLASS =
  "w-full rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-4 focus:ring-[#111111]/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[8px] border border-[#111111] bg-white px-6 py-7 text-[#111111] shadow-none sm:px-8 sm:py-9";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"default" | "danger">(
    "default"
  );
  const [isSending, setIsSending] = useState(false);

  const handleResetEmail = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setMessage("Enter the email address you used for this account.");
      setMessageTone("danger");
      return;
    }

    setIsSending(true);
    setMessage("");
    setMessageTone("default");

    const redirectTo =
      typeof window === "undefined"
        ? undefined
        : `${window.location.origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(
      normalizedEmail,
      redirectTo ? { redirectTo } : undefined
    );

    setIsSending(false);

    if (error) {
      setMessage(error.message || "Could not send reset email.");
      setMessageTone("danger");
      return;
    }

    setMessage(
      "Reset link sent."
    );
    setMessageTone("default");
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={HERO_SURFACE_CLASS}>            <div className="relative">
              <div className={`inline-flex items-center rounded-[8px] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
                Password help
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[40px]">
                Reset your password without losing your place.
              </h1>
              <p className={`mt-3 max-w-lg sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
                We will email a reset link.
              </p>
              <div className={`mt-4 inline-flex rounded-[8px] px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                The reset link opens a secure Neonadri page.
              </div>
            </div>
          </section>

          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>Reset password</div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              Send reset link
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Enter your Neonadri email.
            </p>
            <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              The email can take a minute or two to arrive.
            </p>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#333333]">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={INPUT_CLASS}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleResetEmail()}
                disabled={isSending}
                className={`rounded-[8px] border px-5 py-3 text-sm font-medium transition disabled:opacity-60 ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                {isSending ? "Sending..." : "Email reset link"}
              </button>

              <Link
                href="/login"
                className={`rounded-[8px] px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Back to login
              </Link>
            </div>

            {message ? (
              <p
                className={`mt-4 rounded-[8px] px-4 py-3 text-sm ${
                  messageTone === "danger"
                    ? "border border-[#111111] bg-white text-[#775f55]"
                    : "border border-[#111111] bg-white text-[#333333]"
                }`}
              >
                {message}
              </p>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  );
}
