import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  normalizeUserTimeZone,
  USER_TIME_ZONE_COOKIE,
} from "./lib/userTimeZone";
import { isAdultConfirmedUser } from "./lib/adultGate";

const PROTECTED_PATHS = [
  "/dashboard",
  "/write",
  "/account",
  "/reviews/write",
  "/matches",
  "/chats",
];
const ADULT_CHECK_PATH = "/adult-check";

function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const existingTimeZone = request.cookies.get(USER_TIME_ZONE_COOKIE)?.value;
  const headerTimeZone = request.headers.get("x-vercel-ip-timezone");
  const resolvedTimeZone = normalizeUserTimeZone(
    existingTimeZone || headerTimeZone
  );

  if (existingTimeZone !== resolvedTimeZone) {
    response.cookies.set({
      name: USER_TIME_ZONE_COOKIE,
      value: resolvedTimeZone,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value,
            ...(options as any),
          });
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({
            name,
            value: "",
            ...(options as any),
            maxAge: 0,
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && isProtectedPath(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.pathname = "/login";
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", requestedPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isProtectedPath(request.nextUrl.pathname) && !isAdultConfirmedUser(user)) {
    const redirectUrl = request.nextUrl.clone();
    const requestedPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    redirectUrl.pathname = ADULT_CHECK_PATH;
    redirectUrl.search = "";
    redirectUrl.searchParams.set("next", requestedPath);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    user &&
    request.nextUrl.pathname === ADULT_CHECK_PATH &&
    isAdultConfirmedUser(user)
  ) {
    const requestedNext = request.nextUrl.searchParams.get("next") || "/";
    const safeNext =
      requestedNext.startsWith("/") && !requestedNext.startsWith("//")
        ? requestedNext
        : "/";
    return NextResponse.redirect(new URL(safeNext, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/write/:path*",
    "/account/:path*",
    "/reviews/write/:path*",
    "/matches/:path*",
    "/chats/:path*",
    "/adult-check",
  ],
};
