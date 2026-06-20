**日本語** | [English](./README.en.md)

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

## 機能

| エンドポイント / ページ | 役割 |
|------------------------|------|
| `/` | ランディングページ |
| `GET /api/books/lookup?isbn=xxx` | openBD → Google Books fallback で書誌取得 |
| `/login` | Email magic link でログイン |
| `/auth/callback` | Supabase OAuth callback |
| `/books` | 自分の本棚一覧（auth required） |
| `/books/new` | ISBN 入力 → プレビュー → 登録 |
| `/books/[isbn]` | 書誌＋読書ログ編集（★ / 感想 / 公開トグル / 日付） |
| `/import` | Kindle My Clippings.txt / Amazon ノートブック JSON から一括取り込み |

## ディレクトリ構成

```
src/
├── app/
│   ├── (app)/               # ナビ付きアプリシェル (route group)
│   │   ├── books/           # 一覧 / 登録 / 詳細
│   │   ├── import/          # Kindle ハイライト取り込みページ
│   │   └── layout.tsx       # sticky ナビヘッダ共通レイアウト
│   ├── api/books/lookup/    # 書誌ルックアップ API
│   ├── auth/callback/       # Supabase 認証 callback
│   ├── login/               # ログインページ
│   └── page.tsx             # ランディングページ
├── components/
│   ├── nav-header.tsx       # アプリナビゲーション
│   └── ui/                  # shadcn/ui コンポーネント
├── db/
│   ├── index.ts             # Drizzle client (Lazy Proxy)
│   └── schema.ts            # books / reading_logs / highlights
├── lib/
│   ├── auth.ts              # requireUserId() ヘルパ
│   ├── books/               # openBD / Google Books / ISBN 正規化
│   ├── import/              # 取り込みパイプライン
│   │   ├── types.ts         # 中間表現スキーマ (zod)
│   │   └── parsers/
│   │       ├── amazon-notebook.ts   # Amazon ノートブック JSON (Strict / Lenient)
│   │       └── my-clippings.ts      # Kindle My Clippings.txt (Strict / Lenient)
│   ├── supabase/            # server / client / middleware
│   └── utils.ts             # cn ユーティリティ
└── middleware.ts            # 認証ガード
drizzle/                     # マイグレーション
public/bookmarklet/          # Kindle Webノートブック抽出ブックマークレット
docs/import/                 # 取り込み経路の DOM 構造調査メモ
tests/                       # Vitest ユニットテスト + fixture
vitest.config.ts             # Vitest 設定
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
| `npm test` | Vitest (1回実行) |
| `npm run test:watch` | Vitest watch モード |
| `npm run test:coverage` | Vitest + v8 カバレッジ |
| `npm run db:generate` | スキーマからマイグレーション生成 |
| `npm run db:push` | スキーマをDBに直接反映 (開発初期向け) |
| `npm run db:migrate` | マイグレーションを適用 |
| `npm run db:studio` | Drizzle Studio でDBを覗く |

## 実装フェーズ

| Phase | 内容 | 状態 |
|-------|------|------|
| **Phase 1** | ISBN登録 → 書誌取得 → 一覧/詳細 → ★/感想 + Auth | ✅ コード完了 / ⏳ 実機検証待ち (Supabase 接続後) |
| **Phase 2** | Kindle 一括取り込み (`My Clippings.txt` パーサー + `/import` UI) | ✅ UI 完成 / ⏳ DB upsert 実装待ち (Supabase 接続後) |
| Phase 3 | LinkedIn 投稿下書き生成 / ストリーク | 未着手 |
| Phase 4 | OGP 画像 / 公開ページ / ジャンルレーダー | 未着手 |
| Phase 5 (任意) | Obsidian / MCP 連携 / 外向け公開 (D-Gmail 連携) | 未着手 |

## ライセンス

個人利用を想定した読書記録アプリ
