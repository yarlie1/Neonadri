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
  "w-full rounded-[8px] border border-[#111111] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#111111] focus:ring-1 focus:ring-[#111111]";

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
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              Log in to continue
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Use your account to continue.
            </p>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#333333]">
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
                  <label className="block text-sm font-medium text-[#333333]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[#6a7a84] transition hover:text-[#111111]"
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

            <div className="mt-6 grid gap-3">
              {showSignupCue ? (
                <>
                  <div className="relative">
                    <div className="mb-3 max-w-[280px] rounded-[8px] border-2 border-[#111111] bg-white px-4 py-3 text-sm leading-5 text-[#111111]">
                      <div className="font-black text-[#111111]">New here?</div>
                      <div className="mt-1 text-[#333333]">
                        Create an account first, then send your request.
                      </div>
                    </div>
                    <Link
                      href={signupHref}
                      className={`inline-flex min-h-[52px] w-full items-center justify-center rounded-[8px] border px-5 py-3 text-base font-black transition ${APP_BUTTON_PRIMARY_CLASS} border-[#111111] [animation:neonadri-signup-pulse_1.45s_ease-in-out_infinite]`}
                    >
                      Create account
                    </Link>
                  </div>
                  <button
                    onClick={handleLogin}
                    className={`inline-flex min-h-[48px] items-center justify-center rounded-[8px] border px-5 py-3 text-sm font-bold transition ${APP_BUTTON_SECONDARY_CLASS}`}
                  >
                    Log in instead
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className={`inline-flex min-h-[52px] items-center justify-center rounded-[8px] border px-5 py-3 text-base font-black transition ${APP_BUTTON_PRIMARY_CLASS}`}
                  >
                    Log In
                  </button>
                  <div className="text-sm text-[#333333]">
                    New here?{" "}
                    <Link href={signupHref} className="font-bold underline underline-offset-4">
                      Create account
                    </Link>
                  </div>
                </>
              )}
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
