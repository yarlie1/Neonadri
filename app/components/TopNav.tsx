"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  House,
  UserCircle2,
  Plus,
  MessageCircleMore,
} from "lucide-react";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../lib/userTimeZone";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

function PendingBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span className="inline-flex min-w-[18px] items-center justify-center rounded-full bg-[#c96f5d] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NewChatBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span
      className="relative inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#ead9cb] bg-[#fff7ef] text-[#9a5d49]"
      aria-label="New chat activity"
      title="New chat activity"
    >
      <MessageCircleMore className="h-3 w-3" />
      <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-[#c96f5d]" />
    </span>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopNav() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SimpleUser>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [hasNewChatActivity, setHasNewChatActivity] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loggingOutRef = useRef(false);
  const pathname = usePathname();
  const isHomeTest = pathname.startsWith("/home-test");
  
  const currentPathWithSearch = useMemo(() => {
    return currentSearch ? `${pathname}${currentSearch}` : pathname;
  }, [pathname, currentSearch]);

  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?next=${encodeURIComponent(currentPathWithSearch)}`;

  useEffect(() => {
    const browserTimeZone = normalizeUserTimeZone(
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
    document.cookie = `${USER_TIME_ZONE_COOKIE}=${encodeURIComponent(
      browserTimeZone
    )}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCurrentSearch(window.location.search || "");
  }, [pathname]);

  useEffect(() => {
    let mounted = true;

    const resetSignedOutState = () => {
      setUser(null);
      setPendingCount(0);
      setHasNewChatActivity(false);
      setMenuOpen(false);
      setIsLoggingOut(false);
      loggingOutRef.current = false;
    };

    const loadPendingCount = async (userId: string) => {
      const { count } = await supabase
        .from("match_requests")
        .select("*", { count: "exact", head: true })
        .eq("post_owner_user_id", userId)
        .eq("status", "pending");

      return count || 0;
    };

    const loadHasNewChatActivity = async (userId: string) => {
      const { data, error } = await supabase
        .from("match_chats")
        .select(
          "host_user_id,guest_user_id,last_chat_activity_at,last_seen_by_host_at,last_seen_by_guest_at"
        )
        .or(`host_user_id.eq.${userId},guest_user_id.eq.${userId}`);

      if (error) {
        console.error("TopNav loadHasNewChatActivity error:", error);
        return false;
      }

      return (data || []).some((row) => {
        if (!row.last_chat_activity_at) return false;

        const lastActivity = new Date(row.last_chat_activity_at).getTime();
        if (Number.isNaN(lastActivity)) return false;

        const lastSeen =
          row.host_user_id === userId ? row.last_seen_by_host_at : row.last_seen_by_guest_at;

        if (!lastSeen) return true;

        const lastSeenTime = new Date(lastSeen).getTime();
        if (Number.isNaN(lastSeenTime)) return true;

        return lastActivity > lastSeenTime;
      });
    };

    const loadUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!mounted || loggingOutRef.current) return;

        const nextUser = user ? { id: user.id, email: user.email } : null;
        setUser(nextUser);

        if (user) {
          const [count, hasNewChat] = await Promise.all([
            loadPendingCount(user.id),
            loadHasNewChatActivity(user.id),
          ]);
          if (!mounted || loggingOutRef.current) return;
          setPendingCount(count);
          setHasNewChatActivity(hasNewChat);
        } else {
          setPendingCount(0);
          setHasNewChatActivity(false);
        }
      } catch (error) {
        console.error("TopNav loadUser error:", error);
      }
    };

    loadUser();
    const pollId = window.setInterval(() => {
      void loadUser();
    }, 30000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (!mounted) return;

        if (_event === "SIGNED_OUT") {
          resetSignedOutState();
          return;
        }

        if (!session?.user) {
          resetSignedOutState();
          return;
        }

        if (loggingOutRef.current) return;

        const nextUser = session?.user
          ? { id: session.user.id, email: session.user.email }
          : null;

        setUser(nextUser);
        setMenuOpen(false);

        if (session?.user) {
          const [count, hasNewChat] = await Promise.all([
            loadPendingCount(session.user.id),
            loadHasNewChatActivity(session.user.id),
          ]);
          if (!mounted || loggingOutRef.current) return;
          setPendingCount(count);
          setHasNewChatActivity(hasNewChat);
        } else {
          setPendingCount(0);
          setHasNewChatActivity(false);
        }
      } catch (error) {
        console.error("TopNav auth change error:", error);
      }
    });

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      subscription.unsubscribe();
    };
  }, [pathname, supabase]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, { passive: true });
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    loggingOutRef.current = true;
    setIsLoggingOut(true);
    setMenuOpen(false);
    setUser(null);
    setPendingCount(0);
    setHasNewChatActivity(false);

    try {
      sessionStorage.clear();
      const [localLogoutResult, serverLogoutResult] = await Promise.allSettled([
        supabase.auth.signOut({ scope: "local" }),
        fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      if (localLogoutResult.status === "rejected") {
        console.error("TopNav local logout error:", localLogoutResult.reason);
      }

      if (serverLogoutResult.status === "rejected") {
        console.error("TopNav server logout error:", serverLogoutResult.reason);
      } else if (!serverLogoutResult.value.ok) {
        console.error(
          "TopNav server logout response error:",
          await serverLogoutResult.value.text()
        );
      }
    } catch (error) {
      console.error("TopNav logout error:", error);
    } finally {
      window.location.replace(`/?signed_out=${Date.now()}`);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const navBtn = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition ${
      isHomeTest
        ? active
          ? "border-[#f4f7f9] bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(241,245,247,0.99)_100%)] text-[#2d3a43] shadow-[0_14px_28px_rgba(146,154,162,0.14),inset_0_1px_0_rgba(255,255,255,0.99)]"
          : "border-[#edf1f4] bg-[linear-gradient(180deg,rgba(253,253,253,0.96)_0%,rgba(243,246,248,0.96)_100%)] text-[#7a8389] shadow-[0_10px_24px_rgba(146,154,162,0.08)] hover:border-[#e3e8eb] hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.99)_0%,rgba(246,249,251,0.99)_100%)] hover:text-[#606d75]"
        : active
        ? "border-[#dfcaba] bg-[linear-gradient(180deg,#fffdf9_0%,#f3e7db_100%)] text-[#3f3226] shadow-[0_12px_28px_rgba(120,86,52,0.10)]"
        : "border-[#e5d8cb] bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e7_100%)] text-[#5a5149] shadow-[0_8px_18px_rgba(93,68,48,0.04)] hover:bg-[#f6eee6]"
    }`;

  const primary = isHomeTest
    ? "inline-flex items-center gap-2 rounded-[18px] border border-[#eef2f5] bg-[linear-gradient(135deg,#ffffff_0%,#f1f5f7_100%)] px-4 py-2.5 text-sm font-medium text-[#34424b] shadow-[0_16px_34px_rgba(146,154,162,0.13),inset_0_1px_0_rgba(255,255,255,0.99)] transition hover:border-[#e4e9ec] hover:text-[#2a3740]"
    : "inline-flex items-center gap-2 rounded-full border border-[#d8bcaa] bg-[linear-gradient(135deg,#3a2d28_0%,#9a6d5d_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(108,77,48,0.18)] transition hover:brightness-[1.02]";

  const mobileItem = isHomeTest
    ? "inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#707b82] transition hover:bg-[#f1f3f4] hover:text-[#4f5b64]"
    : "inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]";

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl ${
        isHomeTest
          ? "border-b border-[#eef2f5] bg-[rgba(248,250,251,0.84)]"
          : "border-b border-[#ebdfd4] bg-[rgba(255,250,245,0.84)]"
      }`}
    >
      <div
        className={
          isHomeTest
            ? "border-b border-[#eef2f5] bg-[linear-gradient(180deg,rgba(253,253,253,0.97),rgba(244,247,249,0.92))]"
            : "border-b border-[#f1e4d7] bg-[linear-gradient(180deg,rgba(255,252,248,0.95),rgba(249,240,232,0.88))]"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base font-bold tracking-[-0.05em] text-white ${
                isHomeTest
                  ? "border-[#f7fbfd] bg-[radial-gradient(circle_at_top,_#ffffff,_#eef3f6_34%,_#9ea8b2_82%)] shadow-[0_18px_32px_rgba(146,154,162,0.16)]"
                  : "border-[#e6cdbb] bg-[radial-gradient(circle_at_top,_#f6e5d6,_#c99679_80%)] shadow-[0_14px_30px_rgba(160,111,82,0.18)]"
              }`}
              onClick={closeMenu}
              aria-label="Neonadri home"
            >
              N
            </Link>

            <div className={`flex items-center ${isHomeTest ? "shrink-0" : "min-w-0 flex-1"}`}>
              <div
                className={`flex flex-col items-start justify-center gap-[2px] sm:h-10 sm:justify-between sm:gap-0 ${
                  isHomeTest ? "shrink-0" : "min-w-0"
                }`}
              >
                <Link
                  href="/"
                  className={`block ${isHomeTest ? "" : "w-full"} text-[20px] font-extrabold leading-none tracking-[-0.05em] sm:text-[25px] ${
                    isHomeTest ? "" : "text-[#1f1b18]"
                  }`}
                  style={
                    isHomeTest
                      ? {
                          color: "#303b44",
                          textShadow:
                            "0 1px 0 rgba(255,255,255,0.9), 0 0 16px rgba(255,255,255,0.22)",
                        }
                      : undefined
                  }
                  onClick={closeMenu}
                >
                  Neonadri
                </Link>
                <div
                  className={`block ${isHomeTest ? "" : "w-full truncate"} text-[9px] font-medium uppercase leading-none tracking-[0.16em] sm:text-[10px] sm:tracking-[0.18em] ${
                    isHomeTest ? "text-[#7f878d]" : "text-[#8d7d71]"
                  }`}
                >
                  AI-generated social space
                </div>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/" className={navBtn(isActivePath(pathname, "/"))}>
              <House className="h-4 w-4" />
              Home
            </Link>

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={navBtn(isActivePath(pathname, "/dashboard"))}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  <PendingBadge count={pendingCount} />
                  <NewChatBadge visible={hasNewChatActivity} />
                </Link>

                <Link
                  href="/profile"
                  className={navBtn(pathname === "/profile" || pathname.startsWith("/profile/"))}
                >
                  <UserCircle2 className="h-4 w-4" />
                  Profile
                </Link>

                <Link href="/write" className={primary}>
                  <Plus className="h-4 w-4" />
                  Create
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className={`${navBtn(false)} ${
                    isLoggingOut
                      ? "cursor-not-allowed opacity-60"
                      : ""
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref} className={navBtn(isActivePath(pathname, "/login"))}>
                  <LogIn className="h-4 w-4" />
                  Log In
                </Link>

                <Link href="/signup" className={primary}>
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="relative sm:hidden" ref={menuRef}>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${
                isHomeTest
                  ? "border-[#74d4ff33] bg-[linear-gradient(180deg,#10253c_0%,#0b1828_100%)] text-[#9cefff] shadow-[0_10px_24px_rgba(14,87,140,0.22)] hover:bg-[#102840]"
                  : "border-[#e3d5c8] bg-[linear-gradient(180deg,#fffdfb_0%,#f6ede5_100%)] text-[#5a5149] shadow-[0_10px_24px_rgba(90,70,48,0.10)] hover:bg-[#f4ece4]"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-[30px] border ${
                  isHomeTest
                    ? "border-[#74d4ff33] bg-[linear-gradient(180deg,#10253c_0%,#081321_100%)] shadow-[0_24px_50px_rgba(8,69,113,0.28)]"
                    : "border-[#e7ddd2] bg-[linear-gradient(180deg,#fffdfb_0%,#f7efe7_100%)] shadow-[0_24px_50px_rgba(80,60,40,0.16)]"
                }`}
              >
                <div
                  className={`border-b px-5 py-4 ${
                    isHomeTest
                      ? "border-[#74d4ff1f] bg-[linear-gradient(180deg,#132c47,#0a1624)]"
                      : "border-[#efe3d8] bg-[linear-gradient(180deg,#fff8f0,#fffdf8)]"
                  }`}
                >
                  <div className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isHomeTest ? "text-[#7edcff]" : "text-[#b27f61]"}`}>
                    Neonadri
                  </div>
                  <div className={`mt-1 text-base font-semibold ${isHomeTest ? "text-[#edfaff]" : "text-[#2d231d]"}`}>
                    {isHomeTest
                      ? "AI-softened social discovery."
                      : "Meet someone new without the awkward start."}
                  </div>
                  <div className={`mt-1 text-sm ${isHomeTest ? "text-[#93b9cb]" : "text-[#786b61]"}`}>
                    {isHomeTest
                      ? "Cyber-chill surfaces, same routes, same structure."
                      : "Warm meetups, clear plans, and a softer way to begin."}
                  </div>
                </div>

                <div className="flex flex-col p-3">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`${mobileItem} ${
                      isActivePath(pathname, "/")
                        ? isHomeTest
                          ? "bg-[#14304d] text-[#effdff]"
                          : "bg-[#f4e6d8] text-[#3f3226]"
                        : ""
                    }`}
                  >
                    <House className="h-4 w-4" />
                    Home
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={closeMenu}
                        className={`inline-flex items-center justify-between gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                          isActivePath(pathname, "/dashboard")
                            ? "bg-[#f4e6d8] text-[#3f3226]"
                            : "text-[#5a5149] hover:bg-[#f4ece4]"
                        } ${
                          isHomeTest && isActivePath(pathname, "/dashboard")
                            ? "!bg-[#14304d] !text-[#effdff]"
                            : isHomeTest
                            ? "!text-[#9cd4e6] hover:!bg-[#102840]"
                            : ""
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Dashboard
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <PendingBadge count={pendingCount} />
                          <NewChatBadge visible={hasNewChatActivity} />
                        </span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className={`${mobileItem} ${
                          pathname === "/profile" || pathname.startsWith("/profile/")
                            ? isHomeTest
                              ? "bg-[#14304d] text-[#effdff]"
                              : "bg-[#f4e6d8] text-[#3f3226]"
                            : ""
                        }`}
                      >
                        <UserCircle2 className="h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        href="/write"
                        onClick={closeMenu}
                        className={`mt-1 inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                          isHomeTest
                            ? "bg-[linear-gradient(135deg,#173b5f_0%,#0d2138_100%)] text-[#dffbff] hover:brightness-[1.06]"
                            : "bg-[#a48f7a] text-white hover:bg-[#927d69]"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Create Meetup
                      </Link>

                      <div
                        className={`my-3 border-t ${
                          isHomeTest ? "border-[#74d4ff1f]" : "border-[#f0e8de]"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-left text-sm font-medium transition ${
                          isHomeTest
                            ? "text-[#90d8eb] hover:bg-[#102840]"
                            : "text-[#8b5e3c] hover:bg-[#f8efe7]"
                        } ${
                          isLoggingOut ? "cursor-not-allowed opacity-60" : ""
                        }`}
                      >
                        <LogOut className="h-4 w-4" />
                        {isLoggingOut ? "Logging out..." : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href={loginHref}
                        onClick={closeMenu}
                        className={`${mobileItem} ${
                          isActivePath(pathname, "/login")
                            ? isHomeTest
                              ? "bg-[#14304d] text-[#effdff]"
                              : "bg-[#f4e6d8] text-[#3f3226]"
                            : ""
                        }`}
                      >
                        <LogIn className="h-4 w-4" />
                        Log In
                      </Link>

                      <Link
                        href="/signup"
                        onClick={closeMenu}
                        className={`mt-1 inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium transition ${
                          isHomeTest
                            ? "bg-[linear-gradient(135deg,#173b5f_0%,#0d2138_100%)] text-[#dffbff] hover:brightness-[1.06]"
                            : "bg-[#a48f7a] text-white hover:bg-[#927d69]"
                        }`}
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
