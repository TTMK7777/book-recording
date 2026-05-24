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

/**
 * H-1 対策: Host Header Injection によるオープンリダイレクトを防止するため、
 * リクエストの Host ヘッダ由来の `request.nextUrl.origin` ではなく、
 * 環境変数 `NEXT_PUBLIC_SITE_URL` を正規 origin として使用する。
 * 本番環境で未設定の場合は即時エラー (移行期フォールバックは security review #34 で削除)。
 */
function getTrustedOrigin(_request: NextRequest): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is not set. Required in production to prevent open redirect via Host header injection."
    );
  }
  // 非本番環境 (development / test) のみフォールバック許可
  return "http://localhost:3000";
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = getTrustedOrigin(request);
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
