"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export default function TopNav() {
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* 왼쪽 로고 */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[#2f2a26]"
        >
          Meetup
        </Link>

        {/* 오른쪽 버튼 */}
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              {/* 지도 */}
              <Link
                href="/map"
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] hover:bg-[#f4ece4]"
              >
                Map
              </Link>

              {/* 글쓰기 */}
              <Link
                href="/write"
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] hover:bg-[#f4ece4]"
              >
                Create
              </Link>

              {/* 대시보드 */}
              <Link
                href="/dashboard"
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] hover:bg-[#f4ece4]"
              >
                Dashboard
              </Link>

              {/* ✅ Account 버튼 */}
              <Link
                href="/account"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white hover:bg-[#927d69]"
              >
                Account
              </Link>

              {/* 로그아웃 */}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] hover:bg-[#f4ece4]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm text-[#5a5149] hover:bg-[#f4ece4]"
              >
                Login
              </Link>

              <Link
                href="/signup"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white hover:bg-[#927d69]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
