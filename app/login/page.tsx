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
  APP_PILL_INACTIVE_CLASS,
  APP_SUBTLE_TEXT_CLASS,
  APP_SURFACE_CARD_CLASS,
} from "../designSystem";

const INPUT_CLASS =
  "w-full rounded-[20px] border border-[#d6dee4] bg-[linear-gradient(180deg,#ffffff_0%,#f3f6f8_100%)] px-4 py-3 text-sm text-[#24323c] outline-none transition focus:border-[#b9c7d0] focus:ring-4 focus:ring-[#c8d3da]/30";
const HERO_SURFACE_CLASS =
  "relative overflow-hidden rounded-[32px] border border-[#dce5eb] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.99)_0%,rgba(241,246,249,0.96)_44%,rgba(225,232,237,0.95)_100%)] px-6 py-7 text-[#24323c] shadow-[0_24px_60px_rgba(118,126,133,0.14)] sm:px-8 sm:py-9";

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
      setMessage("Password reset complete. Log in with your new password.");
    }
  }, []);

  const redirectPath = useMemo(() => {
    return nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/";
  }, [nextPath]);

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
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className={HERO_SURFACE_CLASS}>
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/45 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#d6e0e6]/45 blur-2xl" />
            <div className="relative">
              <div className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${APP_PILL_INACTIVE_CLASS}`}>
                Welcome back
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#22303a] sm:text-[40px]">
                Pick up the conversation where you left it.
              </h1>
              <p className={`mt-3 max-w-lg sm:text-[15px] ${APP_BODY_TEXT_CLASS}`}>
                Check your requests, confirm matches, and jump back into nearby meetups without losing the warm tone of the app.
              </p>
              <div className={`mt-4 inline-flex rounded-full px-3 py-2 text-xs font-medium ${APP_PILL_INACTIVE_CLASS}`}>
                Neonadri is for adults 18+ only.
              </div>

              <div className="mt-6 grid grid-cols-3 gap-2.5">
                <div className={`${APP_SURFACE_CARD_CLASS} rounded-[22px] px-3 py-3 shadow-sm backdrop-blur`}>
                  <div className={`text-[11px] uppercase tracking-[0.12em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Vibe
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#24323c]">Cozy</div>
                </div>
                <div className={`${APP_SURFACE_CARD_CLASS} rounded-[22px] px-3 py-3 shadow-sm backdrop-blur`}>
                  <div className={`text-[11px] uppercase tracking-[0.12em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Meetups
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#24323c]">Nearby</div>
                </div>
                <div className={`${APP_SURFACE_CARD_CLASS} rounded-[22px] px-3 py-3 shadow-sm backdrop-blur`}>
                  <div className={`text-[11px] uppercase tracking-[0.12em] ${APP_SUBTLE_TEXT_CLASS}`}>
                    Mood
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#24323c]">Warm</div>
                </div>
              </div>
            </div>
          </section>

          <section className={`${APP_SURFACE_CARD_CLASS} p-6 sm:p-8`}>
            <div className={APP_EYEBROW_CLASS}>
              Log In
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#24323c]">
              Back to your matches
            </h2>
            <p className={`mt-2 ${APP_BODY_TEXT_CLASS}`}>
              Sign in to manage requests, review hosts, and keep your next meetup moving.
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

              <a
                href="/signup"
                className={`rounded-full px-5 py-3 text-sm font-medium transition ${APP_BUTTON_SECONDARY_CLASS}`}
              >
                Create account
              </a>
            </div>

            {message && (
              <p className="mt-4 rounded-[20px] border border-[#d7dfe5] bg-[linear-gradient(180deg,#ffffff_0%,#edf3f6_100%)] px-4 py-3 text-sm text-[#55626a]">
                {message}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
