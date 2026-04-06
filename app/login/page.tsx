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

    router.push("/");
  };

  return (
    <main className="min-h-screen bg-[#f7f1ea] text-[#2f2a26]">
      <div className="mx-auto max-w-xl px-6 py-8">
        <div className="rounded-[2rem] border border-[#e7ddd2] bg-[#fffaf5] p-8 shadow-[0_10px_30px_rgba(80,60,40,0.08)]">
          <h1 className="text-3xl font-semibold text-[#2f2a26]">Log In</h1>

          <div className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-2xl border border-[#dccfc2] bg-white px-4 py-3 text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleLogin}
              className="rounded-2xl bg-[#a48f7a] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#927d69]"
            >
              Log In
            </button>

            <a
              href="/signup"
              className="rounded-2xl border border-[#dccfc2] bg-[#f4ece4] px-5 py-3 text-sm font-medium text-[#5a5149]"
            >
              Sign Up
            </a>
          </div>

          {message && (
            <p className="mt-4 rounded-2xl border border-[#e7ddd2] bg-[#f4ece4] px-4 py-3 text-sm text-[#6b5f52]">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}