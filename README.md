# book-recording

読書履歴を有効に管理し、読書モチベを高めるための個人向けWebアプリ。

詳細な企画背景・差別化方針は [`IDEAS.md`](./IDEAS.md) を参照。

## 技術スタック

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **shadcn/ui** (Radix UI ベース)
- **Drizzle ORM** + **Supabase Postgres**
- **Supabase Auth** (`@supabase/ssr`)
- **Vercel** デプロイ前提

## ディレクトリ構成

```
src/
├── app/                 # App Router (page / layout / route handlers)
├── components/
│   └── ui/              # shadcn/ui コンポーネント
├── db/
│   ├── index.ts         # Drizzle client
│   └── schema.ts        # スキーマ定義
└── lib/
    ├── books/           # 書誌APIラッパー (openBD / Google Books)
    ├── supabase/        # Supabase クライアント (server / client / middleware)
    └── utils.ts         # shadcn 既定の cn ユーティリティ
```

## セットアップ

```bash
# 1. 依存インストール
npm install

# 2. 環境変数を埋める
cp .env.example .env.local
#   - NEXT_PUBLIC_SUPABASE_URL
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY
#   - DATABASE_URL  (Supabase pooler 推奨)

# 3. DBスキーマを反映 (Phase 1 開始時)
npm run db:push

# 4. 開発サーバ起動
npm run dev
```

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

| Phase | 内容 |
|-------|------|
| **Phase 1** (現在) | ISBN登録 → 書誌取得 → 一覧/詳細 → ★/感想 |
| Phase 2 | Kindle ハイライト取り込み (`My Clippings.txt` / Gmail) |
| Phase 3 | LinkedIn 投稿下書き生成 / 診断士試験タグ / ストリーク |
| Phase 4 | OGP 画像 / 公開ページ / ジャンルレーダー |
| Phase 5 (任意) | Obsidian / MCP 連携 |

## ライセンス

private (本人利用想定)
