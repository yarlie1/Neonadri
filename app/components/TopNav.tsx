"use client";

type Props = {
  userEmail: string;
  onLogout?: () => void;
};

export default function TopNav({ userEmail, onLogout }: Props) {
  return (
    <div className="sticky top-0 z-30 border-b border-[#e7ddd2] bg-[#f7f1ea]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a
          href="/"
          className="text-lg font-semibold tracking-tight text-[#2f2a26]"
        >
          Neonadri
        </a>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/map"
            className="rounded-xl bg-[#6b5f52] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5b5046]"
          >
            Map View
          </a>

          {userEmail ? (
            <>
              <a
                href="/write"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Create Meetup
              </a>

              <a
                href="/dashboard"
                className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
              >
                Dashboard
              </a>

              <button
                onClick={onLogout}
                className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                className="rounded-xl bg-[#a48f7a] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#927d69]"
              >
                Log In
              </a>

              <a
                href="/signup"
                className="rounded-xl border border-[#dccfc2] bg-[#f4ece4] px-4 py-2 text-sm font-medium text-[#5a5149] transition hover:bg-[#ede3da]"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
