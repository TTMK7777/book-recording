import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// Supabase クライアントをモック化（exchangeCodeForSession は常に成功扱い）
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: vi.fn(async () => ({ error: null })),
    },
  })),
}));

// route.ts はモジュールロード時に process.env を参照しないが、安全のため import を遅延させる。
async function loadHandler() {
  const mod = await import("@/app/auth/callback/route");
  return mod.GET;
}

describe("auth/callback GET — H-1 Host Header Injection 対策", () => {
  const originalEnv = process.env.NEXT_PUBLIC_SITE_URL;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = originalEnv;
    // @ts-expect-error allow reset for tests
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("Host: evil.com で来ても NEXT_PUBLIC_SITE_URL のドメインへリダイレクトする", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";

    const GET = await loadHandler();
    const req = new NextRequest("https://evil.com/auth/callback?code=abc&next=/books", {
      headers: { host: "evil.com" },
    });

    const res = await GET(req);
    const location = res.headers.get("location");
    expect(location).toBe("https://app.example.com/books");
  });

  it("末尾スラッシュ付き NEXT_PUBLIC_SITE_URL でも正しく結合される", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com/";

    const GET = await loadHandler();
    const req = new NextRequest("https://evil.com/auth/callback?code=abc&next=/books", {
      headers: { host: "evil.com" },
    });

    const res = await GET(req);
    expect(res.headers.get("location")).toBe("https://app.example.com/books");
  });

  it("next が不正値 (//evil.com) の場合は DEFAULT_REDIRECT (/books) に正規化される", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";

    const GET = await loadHandler();
    const req = new NextRequest(
      "https://app.example.com/auth/callback?code=abc&next=//evil.com/steal",
    );

    const res = await GET(req);
    expect(res.headers.get("location")).toBe("https://app.example.com/books");
  });

  it("code が無い場合は /login?error=auth_callback_failed に正規 origin でリダイレクト", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://app.example.com";

    const GET = await loadHandler();
    const req = new NextRequest("https://evil.com/auth/callback", {
      headers: { host: "evil.com" },
    });

    const res = await GET(req);
    expect(res.headers.get("location")).toBe(
      "https://app.example.com/login?error=auth_callback_failed",
    );
  });

  it("development 環境で NEXT_PUBLIC_SITE_URL 未設定なら localhost:3000 にフォールバック", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    // @ts-expect-error allow override for tests
    process.env.NODE_ENV = "development";

    const GET = await loadHandler();
    const req = new NextRequest("https://evil.com/auth/callback?code=abc&next=/books", {
      headers: { host: "evil.com" },
    });

    const res = await GET(req);
    expect(res.headers.get("location")).toBe("http://localhost:3000/books");
  });

  it("production 環境で NEXT_PUBLIC_SITE_URL 未設定なら例外を投げる (Host header fallback 削除)", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    // @ts-expect-error allow override for tests
    process.env.NODE_ENV = "production";

    const GET = await loadHandler();
    const req = new NextRequest("https://evil.com/auth/callback?code=abc&next=/books", {
      headers: { host: "evil.com" },
    });

    await expect(GET(req)).rejects.toThrow(/NEXT_PUBLIC_SITE_URL/);
  });
});
