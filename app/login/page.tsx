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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    setNextPath(params.get("next"));
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
            <div className={APP_EYEBROW_CLASS}>
              Log In
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              Enter your account
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Use your email and password.
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
                className={`rounded-full border px-5 py-3 text-sm font-medium transition ${APP_BUTTON_PRIMARY_CLASS}`}
              >
                Log In
              </button>

              <Link
                href={signupHref}
                className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Create account
              </Link>
            </div>

            {message && (
              <p className="mt-4 rounded-[20px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                {message}
              </p>
            )}
          </section>
      </div>
    </main>
  );
}
