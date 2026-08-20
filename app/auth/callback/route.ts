import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

function getSafeNext(nextValue: string | null) {
  return nextValue && nextValue.startsWith("/") && !nextValue.startsWith("//")
    ? nextValue
    : "/";
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const safeNext = getSafeNext(requestUrl.searchParams.get("next"));
  const redirectUrl = new URL(safeNext, requestUrl.origin);

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("next", safeNext);
    loginUrl.searchParams.set("message", "google-login-failed");
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(redirectUrl);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookieMap = new Map<string, string>();

  cookieHeader.split(";").forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const name = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    cookieMap.set(name, value);
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieMap.get(name);
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const loginUrl = new URL("/login", requestUrl.origin);
    loginUrl.searchParams.set("next", safeNext);
    loginUrl.searchParams.set("message", "google-login-failed");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}