"use client";

import Link from "next/link";

export default function TopNav({
  userEmail,
  onLogout,
}: {
  userEmail: string;
  onLogout: () => void;
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e7ddd2] bg-[#fffaf5]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold text-[#2f2a26]"
        >
          Neonadri
        </Link>

        {/* Right */}
        <div className="flex items-center gap-3">
          {!userEmail ? (
            <>
              <Link
                href="/login"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white"
              >
                Log In
              </Link>

              <Link
                href="/signup"
                className="rounded-xl border border-[#dccfc2] px-4 py-2 text-sm"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-xs text-[#7a6f65]">
                {userEmail}
              </span>

              <button
                onClick={onLogout}
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}