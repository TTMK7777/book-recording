# book-recording

読書履歴を有効に管理し、読書モチベを高めるための個人向けWebアプリ。

詳細な企画背景・差別化方針は [`IDEAS.md`](./IDEAS.md)、運用ルールは [`plan.md`](./plan.md) を参照。

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** (base-ui ベース)
- **Drizzle ORM** + **Supabase Postgres**
- **Supabase Auth** (`@supabase/ssr`) — Email magic link
- **Vercel** デプロイ前提

## 機能（Phase 1 実装済み）

| エンドポイント / ページ | 役割 |
|------------------------|------|
| `GET /api/books/lookup?isbn=xxx` | openBD → Google Books fallback で書誌取得 |
| `/login` | Email magic link でログイン |
| `/auth/callback` | Supabase OAuth callback |
| `/books` | 自分の本棚一覧（auth required） |
| `/books/new` | ISBN 入力 → プレビュー → 登録 |
| `/books/[isbn]` | 書誌＋読書ログ編集（★ / 感想 / 公開トグル / 日付） |

## ディレクトリ構成

```
src/
├── app/
│   ├── api/books/lookup/    # 書誌ルックアップ API
│   ├── auth/callback/       # Supabase 認証 callback
│   ├── books/               # 一覧 / 登録 / 詳細
│   └── login/               # ログインページ
├── components/ui/           # shadcn/ui コンポーネント
├── db/
│   ├── index.ts             # Drizzle client (Lazy Proxy)
│   └── schema.ts            # books / reading_logs / highlights
├── lib/
│   ├── auth.ts              # requireUserId() ヘルパ
│   ├── books/               # openBD / Google Books / ISBN 正規化
│   ├── supabase/            # server / client / middleware
│   └── utils.ts             # cn ユーティリティ
└── middleware.ts            # 認証ガード
drizzle/                     # マイグレーション
```

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数を埋める
cp .env.example .env.local
#   - NEXT_PUBLIC_SUPABASE_URL          (Supabase Settings → API)
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY     (Supabase Settings → API → anon public)
#   - DATABASE_URL                       (Supabase Settings → Database → Transaction pooler)

# 3. Supabase Auth 設定
#   - Authentication → Providers → Email を有効化（デフォルト ON）
#   - Authentication → URL Configuration → Site URL: http://localhost:3000
#                                          Redirect URLs に http://localhost:3000/** を追加

# 4. DBスキーマを反映
npm run db:push

# 5. 開発サーバ起動
npm run dev
```

開いたら `/login` から magic link を送り、メールのリンクをクリック → `/books/new` で ISBN を登録。

## スクリプト

| コマンド | 用途 |
|---------|------|
| `npm run dev` | 開発サーバ (Turbopack) |
| `npm run build` | プロダクションビルド |
| `npm run start` | プロダクション起動 |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | スキーマからマイグレーション生成 |
| `npm run db:push` | スキーマをDBに直接反映 (開発初期向け) |
| `npm run db:migrate` | マイグレーションを適用 |
| `npm run db:studio` | Drizzle Studio でDBを覗く |

## 実装フェーズ

| Phase | 内容 | 状態 |
|-------|------|------|
| **Phase 1** | ISBN登録 → 書誌取得 → 一覧/詳細 → ★/感想 + Auth | ✅ コード完了 / ⏳ 実機検証待ち |
| Phase 2 | Kindle ハイライト取り込み (`My Clippings.txt` / Gmail) | 未着手 |
| Phase 3 | LinkedIn 投稿下書き生成 / 診断士試験タグ / ストリーク | 未着手 |
| Phase 4 | OGP 画像 / 公開ページ / ジャンルレーダー | 未着手 |
| Phase 5 (任意) | Obsidian / MCP 連携 | 未着手 |

## ライセンス

private (本人利用想定)
