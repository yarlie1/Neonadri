"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_PILL_INACTIVE_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../../designSystem";

const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-8";

type OtpType =
  | "signup"
  | "invite"
  | "magiclink"
  | "recovery"
  | "email_change"
  | "email";

const OTP_TYPES = new Set<OtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
]);

function AuthConfirmContent() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Verifying your link...");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;

    const verify = async () => {
      const tokenHash = searchParams.get("token_hash")?.trim() || "";
      const typeValue = searchParams.get("type")?.trim() || "";
      const nextParam = searchParams.get("next") || "/";

      const safeNext =
        nextParam.startsWith("/") && !nextParam.startsWith("//")
          ? nextParam
          : "/";

      if (!tokenHash || !OTP_TYPES.has(typeValue as OtpType)) {
        if (!active) return;
        setMessage("");
        setErrorMessage("This confirmation link is missing or invalid.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: typeValue as OtpType,
      });

      if (!active) return;

      if (error) {
        setMessage("");
        setErrorMessage(
          error.message || "This link expired or could not be verified."
        );
        return;
      }

      setMessage("Confirmed. Taking you to the next step...");
      window.setTimeout(() => {
        router.replace(safeNext);
      }, 250);
    };

    void verify();

    return () => {
      active = false;
    };
  }, [router, searchParams, supabase]);

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-3xl space-y-4">
        <section className={HERO_SURFACE_CLASS}>
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
          <div className="relative">
            <div
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}
            >
              Secure link
            </div>
            <h1 className="mt-4 text-[30px] font-extrabold leading-[0.98] tracking-[-0.05em] text-[#22303a] sm:text-[34px]">
              Confirming your request.
            </h1>
            <p className={`mt-3 max-w-xl ${APP_BODY_TEXT_CLASS}`}>
              We are checking the link from your email and moving you to the right place.
            </p>
          </div>
        </section>

        <section className={`${APP_SURFACE_CARD_CLASS} p-5 sm:p-6`}>
          <div className={APP_EYEBROW_CLASS}>Auth</div>
          {message ? (
            <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>{message}</p>
          ) : null}
          {errorMessage ? (
            <>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-[#24323c]">
                We couldn't verify that link.
              </h2>
              <p className={`mt-2 text-sm ${APP_BODY_TEXT_CLASS}`}>
                {errorMessage}
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/forgot-password"
                  className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Request another reset link
                </Link>
                <Link
                  href="/login"
                  className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
                >
                  Back to login
                </Link>
              </div>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense
      fallback={
        <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
          <div className="mx-auto max-w-3xl">
            <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
              <div className={APP_EYEBROW_CLASS}>Auth</div>
              <div className="mt-3 text-sm text-[#55626a]">Preparing confirmation...</div>
            </section>
          </div>
        </main>
      }
    >
      <AuthConfirmContent />
    </Suspense>
  );
}
