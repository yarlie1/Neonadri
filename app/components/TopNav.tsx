"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
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
  Settings2,
  Plus,
  MessageCircleMore,
} from "lucide-react";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "../../lib/userTimeZone";
import {
  APP_PILL_ACTIVE_CLASS,
  APP_PILL_INACTIVE_CLASS,
} from "../designSystem";

type SimpleUser = {
  id: string;
  email?: string | null;
} | null;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      className={`inline-flex min-w-[18px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none shadow-[0_10px_18px_rgba(118,126,133,0.16)] ${APP_PILL_ACTIVE_CLASS}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

function NewChatBadge({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <span
      className={`relative inline-flex h-5 w-5 items-center justify-center rounded-full ${APP_PILL_INACTIVE_CLASS}`}
      aria-label="New chat activity"
      title="New chat activity"
    >
      <MessageCircleMore className="h-3 w-3" />
      <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full border border-white bg-[#7b8790]" />
    </span>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLabel({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      {icon}
      <span>{children}</span>
    </>
  );
}

export default function TopNav() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<SimpleUser>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [acceptedSentCount, setAcceptedSentCount] = useState(0);
  const [hasNewChatActivity, setHasNewChatActivity] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [currentSearch, setCurrentSearch] = useState("");
  const menuRef = useRef<HTMLDivElement | null>(null);
  const loggingOutRef = useRef(false);
  const pathname = usePathname();
  const isHomeTest = pathname.startsWith("/home-test");
  const isSilverHome = true;
  
  const currentPathWithSearch = useMemo(() => {
    return currentSearch ? `${pathname}${currentSearch}` : pathname;
  }, [pathname, currentSearch]);

  const loginHref =
    pathname === "/login"
      ? "/login"
      : `/login?next=${encodeURIComponent(currentPathWithSearch)}`;
  const dashboardHref =
    user && acceptedSentCount > 0
      ? "/dashboard?tab=sent"
      : user && pendingCount > 0
      ? "/dashboard?tab=received"
      : "/dashboard";

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

    const syncSearch = () => {
      setCurrentSearch(window.location.search || "");
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function (...args) {
      const result = originalPushState(...args);
      syncSearch();
      return result;
    };

    window.history.replaceState = function (...args) {
      const result = originalReplaceState(...args);
      syncSearch();
      return result;
    };

    syncSearch();
    window.addEventListener("popstate", syncSearch);

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", syncSearch);
    };
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    let refreshChannel: ReturnType<typeof supabase.channel> | null = null;

    const resetSignedOutState = () => {
      setUser(null);
      setPendingCount(0);
      setAcceptedSentCount(0);
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

    const loadAcceptedSentCount = async (userId: string) => {
      const { count } = await supabase
        .from("match_requests")
        .select("*", { count: "exact", head: true })
        .eq("requester_user_id", userId)
        .eq("status", "accepted");

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

    const refreshIndicators = async (userId: string) => {
      const [count, acceptedCount, hasNewChat] = await Promise.all([
        loadPendingCount(userId),
        loadAcceptedSentCount(userId),
        loadHasNewChatActivity(userId),
      ]);

      if (!mounted || loggingOutRef.current) return;
      setPendingCount(count);
      setAcceptedSentCount(acceptedCount);
      setHasNewChatActivity(hasNewChat);
    };

    const attachRefreshChannel = (userId: string) => {
      refreshChannel?.unsubscribe();
      refreshChannel = supabase
        .channel(`topnav-badges-${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_requests",
            filter: `post_owner_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_requests",
            filter: `requester_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_chats",
            filter: `host_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "match_chats",
            filter: `guest_user_id=eq.${userId}`,
          },
          () => {
            void refreshIndicators(userId);
          }
        )
        .subscribe();
    };

    const loadUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted || loggingOutRef.current) return;

        const user = session?.user ?? null;
        const nextUser = user ? { id: user.id, email: user.email } : null;
        setUser(nextUser);

        if (user) {
          attachRefreshChannel(user.id);
          await refreshIndicators(user.id);
        } else {
          refreshChannel?.unsubscribe();
          refreshChannel = null;
          setPendingCount(0);
          setAcceptedSentCount(0);
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
          refreshChannel?.unsubscribe();
          refreshChannel = null;
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
          attachRefreshChannel(session.user.id);
          await refreshIndicators(session.user.id);
        } else {
          refreshChannel?.unsubscribe();
          refreshChannel = null;
          setPendingCount(0);
          setAcceptedSentCount(0);
          setHasNewChatActivity(false);
        }
      } catch (error) {
        console.error("TopNav auth change error:", error);
      }
    });

    return () => {
      mounted = false;
      window.clearInterval(pollId);
      refreshChannel?.unsubscribe();
      subscription.unsubscribe();
    };
  }, [supabase]);

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
    setAcceptedSentCount(0);
    setHasNewChatActivity(false);

    try {
      sessionStorage.clear();
    } catch (error) {
      console.error("TopNav session storage clear error:", error);
    }

    const target = `/?signed_out=${Date.now()}`;
    window.location.assign(
      `/api/auth/logout?redirect=${encodeURIComponent(target)}`
    );
  };

  const closeMenu = () => setMenuOpen(false);

  const navBtn = (active: boolean) =>
    `inline-flex items-center gap-2 rounded-[18px] border px-3 py-2.5 text-sm font-medium transition ${
      isSilverHome
        ? active
          ? "border-[#e6edf1] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(240,244,246,0.995)_100%)] text-[#26343d] shadow-[0_12px_24px_rgba(118,126,133,0.11),inset_0_1px_0_rgba(255,255,255,0.99)]"
          : "border-[#e6edf1] bg-[linear-gradient(180deg,rgba(253,253,253,0.98)_0%,rgba(243,246,248,0.98)_100%)] text-[#4f5f68] shadow-[0_8px_18px_rgba(118,126,133,0.06)] hover:border-[#dbe3e8] hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,248,250,1)_100%)] hover:text-[#33434c]"
        : active
        ? "border-[#dfcaba] bg-[linear-gradient(180deg,#fffdf9_0%,#f3e7db_100%)] text-[#3f3226] shadow-[0_12px_28px_rgba(120,86,52,0.10)]"
        : "border-[#e5d8cb] bg-[linear-gradient(180deg,#fffdfb_0%,#f8f0e7_100%)] text-[#5a5149] shadow-[0_8px_18px_rgba(93,68,48,0.04)] hover:bg-[#f6eee6]"
    }`;

  const primary = isSilverHome
    ? "inline-flex items-center gap-2 rounded-[18px] border border-[#e6edf1] bg-[linear-gradient(135deg,#ffffff_0%,#eef3f6_100%)] px-3 py-2.5 text-sm font-medium text-[#2f3f48] shadow-[0_14px_28px_rgba(118,126,133,0.1),inset_0_1px_0_rgba(255,255,255,0.99)] transition hover:border-[#dbe3e8] hover:text-[#223039]"
    : "inline-flex items-center gap-2 rounded-full border border-[#d8bcaa] bg-[linear-gradient(135deg,#3a2d28_0%,#9a6d5d_100%)] px-4 py-2.5 text-sm font-medium text-white shadow-[0_14px_30px_rgba(108,77,48,0.18)] transition hover:brightness-[1.02]";

  const mobileItem = isSilverHome
    ? "inline-flex items-center gap-2 rounded-[16px] px-3 py-2.25 text-sm font-medium text-[#52616a] transition hover:bg-[#f4f7f9] hover:text-[#33434c]"
    : "inline-flex items-center gap-2 rounded-[18px] px-4 py-3 text-sm font-medium text-[#5a5149] transition hover:bg-[#f4ece4]";

  return (
    <header
      className={`sticky top-0 z-50 backdrop-blur-xl ${
        isSilverHome
          ? "border-b border-[#eef3f6] bg-[rgba(248,250,251,0.84)]"
          : "border-b border-[#ebdfd4] bg-[rgba(255,250,245,0.84)]"
      }`}
    >
      <div
        className={
          isSilverHome
            ? "border-b border-[#eef3f6] bg-[linear-gradient(180deg,rgba(253,253,253,0.97),rgba(244,247,249,0.92))]"
            : "border-b border-[#f1e4d7] bg-[linear-gradient(180deg,rgba(255,252,248,0.95),rgba(249,240,232,0.88))]"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-base font-bold tracking-[-0.05em] text-white ${
                isSilverHome
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
                className={`flex flex-col items-start justify-center gap-[1px] sm:h-10 sm:justify-center sm:gap-[1px] ${
                  isHomeTest ? "shrink-0" : "min-w-0"
                }`}
              >
                <Link
                  href="/"
                  className={`block ${isHomeTest ? "" : "w-full"} text-[20px] font-extrabold leading-none tracking-[-0.05em] sm:text-[24px] ${
                  isSilverHome ? "" : "text-[#1f1b18]"
                  }`}
                  style={
                    isSilverHome
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
                  className={`block ${isSilverHome ? "" : "w-full truncate"} text-[9px] font-medium uppercase leading-none tracking-[0.16em] sm:text-[10px] sm:tracking-[0.16em] ${
                    isSilverHome ? "text-[#80898f]" : "text-[#8d7d71]"
                  }`}
                >
                  AI-generated social space
                </div>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <Link href="/" className={navBtn(isActivePath(pathname, "/"))}>
              <NavLabel icon={<House className="h-4 w-4" />}>Home</NavLabel>
            </Link>

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className={`${navBtn(isActivePath(pathname, "/dashboard"))} relative pr-12`}
                >
                  <NavLabel icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </NavLabel>
                  <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5">
                    <NewChatBadge visible={hasNewChatActivity} />
                    <CountBadge count={acceptedSentCount} />
                    <CountBadge count={pendingCount} />
                  </span>
                </Link>

                <Link
                  href="/profile"
                  className={navBtn(pathname === "/profile" || pathname.startsWith("/profile/"))}
                >
                  <NavLabel icon={<UserCircle2 className="h-4 w-4" />}>Profile</NavLabel>
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
                  <NavLabel icon={<LogIn className="h-4 w-4" />}>Log In</NavLabel>
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
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[18px] border transition ${
                isSilverHome
                  ? "border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] text-[#68767e] shadow-[0_10px_22px_rgba(118,126,133,0.09)] hover:bg-[#f6f9fb]"
                  : "border-[#e3d5c8] bg-[linear-gradient(180deg,#fffdfb_0%,#f6ede5_100%)] text-[#5a5149] shadow-[0_10px_24px_rgba(90,70,48,0.10)] hover:bg-[#f4ece4]"
              }`}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {menuOpen && (
              <div
                className={`absolute right-0 top-12 z-50 w-[15.25rem] overflow-hidden rounded-[22px] border ${
                  isSilverHome
                    ? "border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6f8_100%)] shadow-[0_24px_46px_rgba(118,126,133,0.16)]"
                    : "border-[#e7ddd2] bg-[linear-gradient(180deg,#fffdfb_0%,#f7efe7_100%)] shadow-[0_24px_50px_rgba(80,60,40,0.16)]"
                }`}
              >
                <div
                  className={`border-b px-3.5 py-2.5 ${
                    isSilverHome
                      ? "border-[#e7edf1] bg-[linear-gradient(180deg,#ffffff,#f5f8fa)]"
                      : "border-[#efe3d8] bg-[linear-gradient(180deg,#fff8f0,#fffdf8)]"
                  }`}
                >
                  <div className={`text-[11px] font-semibold uppercase tracking-[0.28em] ${isSilverHome ? "text-[#78838b]" : "text-[#b27f61]"}`}>
                    Neonadri
                  </div>
                  <div className={`mt-1 text-[15px] font-semibold ${isSilverHome ? "text-[#26343d]" : "text-[#2d231d]"}`}>
                    {isSilverHome
                      ? "AI-softened social discovery."
                      : "Meet someone new without the awkward start."}
                  </div>
                  <div className={`mt-1 text-[13px] leading-5 ${isSilverHome ? "text-[#6f7a82]" : "text-[#786b61]"}`}>
                    {isSilverHome
                      ? "Cyber-chill surfaces, same routes, same structure."
                      : "Warm meetups, clear plans, and a softer way to begin."}
                  </div>
                </div>

                <div className="flex flex-col p-2">
                  <Link
                    href="/"
                    onClick={closeMenu}
                    className={`${mobileItem} ${
                      isActivePath(pathname, "/")
                          ? isSilverHome
                            ? "bg-[#eef4f7] text-[#33434c]"
                          : "bg-[#f4e6d8] text-[#3f3226]"
                        : ""
                    }`}
                  >
                    <NavLabel icon={<House className="h-4 w-4" />}>Home</NavLabel>
                  </Link>

                  {user ? (
                    <>
                      <Link
                        href={dashboardHref}
                        onClick={closeMenu}
                        className={`${mobileItem} ${
                          isActivePath(pathname, "/dashboard")
                            ? isSilverHome
                              ? "bg-[#eef4f7] text-[#33434c]"
                              : "bg-[#f4e6d8] text-[#3f3226]"
                            : ""
                        }`}
                        >
                        <NavLabel icon={<LayoutDashboard className="h-4 w-4" />}>
                          Dashboard
                        </NavLabel>
                        <span className="ml-auto inline-flex items-center gap-2">
                          <NewChatBadge visible={hasNewChatActivity} />
                          <CountBadge count={acceptedSentCount} />
                          <CountBadge count={pendingCount} />
                        </span>
                      </Link>

                      <Link
                        href="/profile"
                        onClick={closeMenu}
                        className={`${mobileItem} ${
                          pathname === "/profile" || pathname.startsWith("/profile/")
                            ? isSilverHome
                              ? "bg-[#eef4f7] text-[#33434c]"
                              : "bg-[#f4e6d8] text-[#3f3226]"
                            : ""
                        }`}
                      >
                        <NavLabel icon={<UserCircle2 className="h-4 w-4" />}>Profile</NavLabel>
                      </Link>

                      <Link
                        href="/account"
                        onClick={closeMenu}
                        className={`${mobileItem} ${
                          isActivePath(pathname, "/account")
                            ? isSilverHome
                              ? "bg-[#eef4f7] text-[#33434c]"
                              : "bg-[#f4e6d8] text-[#3f3226]"
                            : ""
                        }`}
                      >
                        <NavLabel icon={<Settings2 className="h-4 w-4" />}>Account</NavLabel>
                      </Link>

                      <Link
                        href="/write"
                        onClick={closeMenu}
                        className={`mt-1 inline-flex items-center gap-2 rounded-[16px] px-3 py-2.25 text-sm font-medium transition ${
                          isSilverHome
                            ? "border border-[#eef3f6] bg-[linear-gradient(135deg,#ffffff_0%,#f1f5f7_100%)] text-[#34424b] shadow-[0_12px_24px_rgba(146,154,162,0.12)] hover:bg-[#f7fafb]"
                            : "bg-[#a48f7a] text-white hover:bg-[#927d69]"
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Create Meetup
                      </Link>

                      <div
                        className={`my-1 border-t ${
                          isSilverHome ? "border-[#eef3f6]" : "border-[#f0e8de]"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`inline-flex items-center gap-2 rounded-[16px] px-3 py-2.25 text-left text-sm font-medium transition ${
                          isSilverHome
                            ? "text-[#52616a] hover:bg-[#f3f6f8]"
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
                            ? isSilverHome
                              ? "bg-[#eef4f7] text-[#33434c]"
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
                        className={`mt-1 inline-flex items-center gap-2 rounded-[16px] px-3 py-2.25 text-sm font-medium transition ${
                          isSilverHome
                            ? "border border-[#eef3f6] bg-[linear-gradient(135deg,#ffffff_0%,#f1f5f7_100%)] text-[#34424b] shadow-[0_12px_24px_rgba(146,154,162,0.12)] hover:bg-[#f7fafb]"
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
