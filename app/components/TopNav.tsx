"use client";

type Props = {
  userEmail: string;
  onLogout?: () => void;
};

export default function TopNav({ userEmail, onLogout }: Props) {
  return (
    <div className="sticky top-0 z-30 border-b border-[#e7ddd2] bg-[#f7f1ea]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-lg font-semibold text-[#2f2a26]">
          Neonadri
        </a>

        <div className="flex gap-2">
          <a
            href="/map"
            className="rounded-xl bg-[#6b5f52] px-4 py-2 text-sm text-white"
          >
            Map View
          </a>

          {userEmail ? (
            <>
              <a
                href="/write"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white"
              >
                Create Meetup
              </a>

              <a
                href="/dashboard"
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Dashboard
              </a>

              <button
                onClick={onLogout}
                className="rounded-xl border px-4 py-2 text-sm"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm text-white">
                Log In
              </a>
              <a href="/signup" className="rounded-xl border px-4 py-2 text-sm">
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}