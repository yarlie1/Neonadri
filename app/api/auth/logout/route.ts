import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

async function buildLogoutResponse(request: Request, response: NextResponse) {
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

  const { error } = await supabase.auth.signOut({ scope: "global" });

  if (error) {
    console.error("Logout route signOut error", error);
  }

  return response;
}

export async function POST(request: Request) {
  return buildLogoutResponse(request, NextResponse.json({ success: true }));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectTo = url.searchParams.get("redirect") || "/";
  return buildLogoutResponse(request, NextResponse.redirect(new URL(redirectTo, url)));
}
