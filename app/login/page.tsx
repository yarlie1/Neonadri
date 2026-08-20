"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_BUTTON_PRIMARY_CLASS,
  APP_BUTTON_SECONDARY_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [nextPath, setNextPath] = useState<string | null>(null);
  const [showSignupCue, setShowSignupCue] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const nextValue = params.get("next");
    const utmSource = params.get("utm_source")?.toLowerCase();
    const utmMedium = params.get("utm_medium")?.toLowerCase();
    const utmCampaign = params.get("utm_campaign")?.toLowerCase();
    const referrer = document.referrer.toLowerCase();
    const isRedditVisitor =
      utmSource === "reddit" ||
      !!utmMedium?.includes("reddit") ||
      !!utmCampaign?.includes("reddit") ||
      referrer.includes("reddit.com");

    setNextPath(nextValue);
    setShowSignupCue(isRedditVisitor || !!nextValue?.startsWith("/posts/"));
    if (params.get("message") === "password-reset") {
      setMessage("Password reset. Log in again.");
    }
  }, []);

  const redirectPath = useMemo(() => {
    return nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";
  }, [nextPath]);

  const signupHref = useMemo(() => {
    const params = new URLSearchParams({ postingBetaRequired: "0" });
    if (redirectPath !== "/") {
      params.set("next", redirectPath);
    }
    return `/signup?${params.toString()}`;
  }, [redirectPath]);

  const handleLogin = async () => {
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.replace(redirectPath);
  };

  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-lg">
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <style jsx global>{`
              @keyframes neonadri-signup-pulse {
                0%, 100% {
                  box-shadow: 0 0 0 3px #ffffff, 0 0 0 7px #111111;
                }
                50% {
                  box-shadow: 0 0 0 4px #ffffff, 0 0 0 11px #111111;
                }
              }
            `}</style>
            <div className={APP_EYEBROW_CLASS}>
              Log In
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              Continue to request
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Log in, or create an account to request this meetup.
            </p>
            <p className={`mt-2 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              By using Neonadri, you confirm that you are 18 or older.
            </p>
            <div className={`mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${APP_SUBTLE_TEXT_CLASS}`}>
              <Link href="/terms" className="transition hover:text-[#24323c]">
                Terms
              </Link>
              <Link href="/privacy" className="transition hover:text-[#24323c]">
                Privacy
              </Link>
              <Link href="/community" className="transition hover:text-[#24323c]">
                Community
              </Link>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#52616a]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-[#52616a]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#6a7a84] transition hover:text-[#24323c]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className={INPUT_CLASS}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleLogin}
                className={`rounded-[8px] border px-5 py-3 text-sm font-bold transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Log In
              </button>

              <div className="relative inline-flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                {showSignupCue ? (
                  <div className="max-w-[250px] rounded-[8px] border-2 border-[#111111] bg-white px-4 py-3 text-sm leading-5 text-[#111111] sm:absolute sm:bottom-[calc(100%+12px)] sm:left-0 sm:z-10">
                    <div className="font-semibold text-[#111111]">New here?</div>
                    <div className="mt-1 text-[#333333]">
                      Create an account first, then send your request.
                    </div>
                    <div className="absolute -bottom-2 left-7 hidden h-4 w-4 rotate-45 border-b-2 border-r-2 border-[#111111] bg-white sm:block" />
                  </div>
                ) : null}
                <Link
                  href={signupHref}
                  className={`rounded-[8px] border px-5 py-3 text-base font-black transition ${APP_BUTTON_PRIMARY_CLASS} ${
                    showSignupCue
                      ? "border-[#111111] [animation:neonadri-signup-pulse_1.45s_ease-in-out_infinite]"
                      : ""
                  }`}
                >
                  Create account
                </Link>
              </div>
            </div>

            {message && (
              <p className="mt-4 rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#333333]">
                {message}
              </p>
            )}
          </section>
      </div>
    </main>
  );
}
