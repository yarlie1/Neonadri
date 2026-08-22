"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import {
  APP_BODY_TEXT_CLASS,
  APP_EYEBROW_CLASS,
  APP_PAGE_BG_CLASS,
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const nextValue = params.get("next");
    setNextPath(nextValue);
    if (params.get("message") === "password-reset") {
      setMessage("Password reset. Log in again.");
    } else if (params.get("message") === "google-login-failed") {
      setMessage("Google login could not be completed. Please try again.");
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

  const handleGoogleLogin = async () => {
    setMessage("");

    if (typeof window === "undefined") return;

    const callbackUrl = new URL("/auth/callback", window.location.origin);
    callbackUrl.searchParams.set("next", redirectPath);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl.toString(),
      },
    });

    if (error) {
      setMessage(error.message || "Could not start Google login.");
    }
  };
  return (
    <main className={`min-h-screen ${APP_PAGE_BG_CLASS} px-4 py-6 sm:px-6 sm:py-8`}>
      <div className="mx-auto max-w-lg">
          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>
              Log In
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#111111]">
              Log in to continue
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Use your account to continue.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="group inline-flex min-h-[60px] w-full cursor-pointer items-center justify-center gap-3 rounded-[8px] border-[3px] border-[#111111] bg-white px-5 py-3 text-base font-black text-[#111111] shadow-[0_5px_0_#111111] transition hover:-translate-y-0.5 hover:shadow-[0_7px_0_#111111] active:translate-y-1 active:shadow-[0_2px_0_#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#111111] bg-white text-sm font-black text-[#111111]">
                  G
                </span>
                <span>Continue with Google</span>
                <span className="text-lg leading-none transition group-hover:translate-x-0.5">&gt;</span>
              </button>
            </div>

            <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#555555]">
              <div className="h-px bg-[#111111]" />
              <span>or</span>
              <div className="h-px bg-[#111111]" />
            </div>

            <div className="space-y-4">
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
              <button
                onClick={handleLogin}
                className="inline-flex min-h-[52px] items-center justify-center rounded-[8px] border border-[#111111] bg-[#111111] px-5 py-3 text-base font-black text-white shadow-none transition hover:bg-[#333333]"
              >
                Log In
              </button>
              <div className="text-sm text-[#333333]">
                New here?{" "}
                <Link href={signupHref} className="font-bold underline underline-offset-4">
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
