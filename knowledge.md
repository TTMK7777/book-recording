# Knowledge

技術判断・検証結果・知見の集積。

## 2026-04-25

### Next.js 16 + 新版 shadcn/ui は base-ui ベース

- `@base-ui/react/button` をラップしているため、`asChild` プロパティは存在しない
- Slot 化したい場合は `render={<Link href="..." />} nativeButton={false}` を使う
- 旧 Radix Slot パターン (`<Button asChild>`) は型エラーになる
- 適用箇所: `src/app/page.tsx`, `src/app/books/new/page.tsx`, `src/app/books/[isbn]/page.tsx`

参照: `node_modules/@base-ui/react/button/Button.d.ts`、`@base-ui/react/internals/types.d.ts` の `BaseUIComponentProps.render`

### Next.js 16 Route Handler 仕様

- `Response.json(...)` を使う（旧 `NextResponse.json` ではない）
- `request: NextRequest` で `request.nextUrl.searchParams` 等にアクセス
- 動的ルートの params は `Promise<{...}>` 型 → `await params` で取得
- `RouteContext<'/users/[id]'>` という新ヘルパ型あり
- 参照: `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/route.md`

### shadcn/ui 初期化フラグの変化

- 新版 shadcn では `--base-color` フラグ廃止
- 代わりに `-d` (`--defaults`) で `--template=next --preset=base-nova` が適用される
- `npm exec --yes -- shadcn@latest init -d -y` で対話なし初期化可能

### Drizzle クライアントを Lazy Proxy 化する利点

- モジュール import 時に `DATABASE_URL` 必須にすると、env 未設定でビルドや lint が落ちる
- Proxy で初回メソッド呼び出し時に init する形にすると import は通り、実 query 時のみ throw
- 実装は `src/db/index.ts` の `new Proxy({} as DrizzleDb, { get(...) { cached ??= init(); ... }})`

### ISBN-10 → 13 変換アルゴリズム

- ISBN-10 のチェックサム: `Σ digit[i] * (10-i) mod 11 == 0`、最終桁 X = 10
- ISBN-13 の base: `"978" + isbn10.slice(0, 9)`、新チェックサム計算 `(10 - sum mod 10) mod 10`
- ISBN-13 のチェックサム: 偶数位置×3 + 奇数位置×1 の合計が 10 の倍数
- 実装: `src/lib/books/isbn.ts`

### openBD / Google Books の fallback パターン

- 和書カバレッジは openBD が圧倒的（国会図書館連携）
- 洋書は Google Books が優位
- → `lookupBookByIsbn(isbn)` で openBD 優先 → なければ Google Books に fallback
- Google Books の `imageLinks.thumbnail` は `http://` で返ることがあるので `https://` に置換が必要

### `.gitignore` の env 例外

- create-next-app デフォルトは `.env*` 一括除外
- `.env.example` を追跡したい場合は `!.env.example` 例外を追加
- ただし Phase 1 で PR #2 にマージしたリッチ版は `.env*.local` 形式なので例外不要

### gh CLI Windows native のパス処理

- Windows native の `gh` は `--body-file` に POSIX 形式 `/tmp/...` を渡しても解釈しない
- 必ず Windows 形式 `C:/Users/.../AppData/Local/Temp/...` を渡す
- Bash 内の Write も Windows パス指定が確実

### GitHub MCP 認証 → gh CLI フォールバック

- private リポでは MCP の `mcp__github__*` ツールが `Authentication Failed` / `Not Found` を返すケースがある
- ローカル `gh auth status` で認証済みなら `gh pr create` 等で代替可能
- 既知パス: `gh version 2.89.0` 利用可能

### Drizzle スキーマ → マイグレーション生成

- `npm run db:generate` 実行時に config 内の `dbCredentials.url` が undefined だと失敗
- 暫定で `DATABASE_URL=postgresql://placeholder@localhost:5432/placeholder` を環境変数に渡せば generate のみは通る
- `db:push` / `db:migrate` は実 DB が必須

### Server Action から redirect する書き方

- 正常系で `redirect()` を呼ぶと throw で関数を抜ける
- 戻り値型は `Promise<{ ok: false; error: string } | undefined>` にして、Client 側で `result && !result.ok` でエラー判定
- redirect は `next/cache.revalidatePath(...)` の後に呼ぶ

### Auth 連携: requireUserId() ヘルパ

- `src/lib/auth.ts` で `await createClient()` → `supabase.auth.getUser()` → 未ログインなら `redirect("/login")`
- Server Component / Server Action の冒頭で `const userId = await requireUserId()` するパターン
- middleware で `/books` 配下を保護しているが、Server Action からの直叩きにも備えて二重チェック
