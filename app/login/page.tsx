"use client";

import { useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

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

    router.replace("/");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8f1_0%,#f8eee4_42%,#f7f1ea_100%)] px-4 py-6 text-[#2f2a26] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="relative overflow-hidden rounded-[32px] border border-[#ead7c8] bg-[radial-gradient(circle_at_top_left,#fff7ef_0%,#f6d8cb_38%,#e9b7a6_100%)] px-6 py-7 text-[#2a211d] shadow-[0_24px_60px_rgba(120,76,52,0.16)] sm:px-8 sm:py-9">
            <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/35 blur-2xl" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-full bg-[#7b3f31]/10 blur-2xl" />
            <div className="relative">
              <div className="inline-flex items-center rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5647]">
                Welcome back
              </div>
              <h1 className="mt-4 max-w-md text-[34px] font-black leading-[0.96] tracking-[-0.05em] text-[#2b1f1a] sm:text-[40px]">
                Pick up the conversation where you left it.
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f453b] sm:text-[15px]">
                Check your requests, confirm matches, and jump back into nearby meetups without losing the warm tone of the app.
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2.5">
                <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                    Vibe
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#2b1f1a]">Cozy</div>
                </div>
                <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                    Meetups
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#2b1f1a]">Nearby</div>
                </div>
                <div className="rounded-[22px] border border-white/70 bg-white/70 px-3 py-3 shadow-sm backdrop-blur">
                  <div className="text-[11px] uppercase tracking-[0.12em] text-[#906556]">
                    Mood
                  </div>
                  <div className="mt-1 text-sm font-bold text-[#2b1f1a]">Warm</div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[32px] border border-[#eadfd3] bg-white/90 p-6 shadow-[0_16px_40px_rgba(92,69,52,0.08)] backdrop-blur sm:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9d7362]">
              Log In
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#2f2a26]">
              Back to your matches
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#7a6b61]">
              Sign in to manage requests, review hosts, and keep your next meetup moving.
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#5a5149]">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full rounded-[20px] border border-[#dccfc2] bg-[#fffdfa] px-4 py-3 text-sm text-[#2f2a26] outline-none transition focus:border-[#c8ad96] focus:ring-4 focus:ring-[#a48f7a]/12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleLogin}
                className="rounded-full bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Log In
              </button>

              <a
                href="/signup"
                className="rounded-full border border-[#dccfc2] bg-[#f6eee6] px-5 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#efe4d9]"
              >
                Create account
              </a>
            </div>

            {message && (
              <p className="mt-4 rounded-[20px] border border-[#eadfd3] bg-[#f9f1e9] px-4 py-3 text-sm text-[#6b5f52]">
                {message}
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
