import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT = "/books";

function sanitizeNext(raw: string | null): string {
  if (!raw) return DEFAULT_REDIRECT;
  // RFC 3986 userinfo (`@`) や protocol-relative URL (`//`), 絶対URL を遮断。
  // 単一スラッシュ始まり + 英数記号のみのパスに限定する。
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("@") || raw.includes("\\")) {
    return DEFAULT_REDIRECT;
  }
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
