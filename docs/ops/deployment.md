# Deployment / デプロイ・実行手順

> ⚠️ このランブックは、本番運用で依存する前に必ず一度通しで実行（ドライラン）してから利用してください。環境固有の差異（Supabase のプール URL 形式やリダイレクト URL 設定など）は実行時に確認が必要です。

book-recording は **Vercel** へのデプロイを前提とし、データベースと認証に **Supabase** を使います。Dockerfile / cloudbuild は同梱していません。

## 前提

- Node.js（`@types/node` は v20 系を想定）と npm
- Supabase プロジェクト（Postgres + Auth）
- Vercel アカウント（本番デプロイ時）

## 環境変数

`.env.example` をコピーして設定します。値は Supabase ダッシュボードから取得します。

| 変数 | 必須 | 取得元 / 用途 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | はい | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | はい | Supabase → Settings → API → anon public |
| `DATABASE_URL` | はい | Supabase → Settings → Database → Connection pooling (Transaction pooler) の URL |
| `NEXT_PUBLIC_SITE_URL` | 本番で必須 | 公開ドメイン。認証リダイレクトと Host Header 対策に使用 |
| `GOOGLE_BOOKS_API_KEY` | 任意 | 未設定でも検索は動作。レート制限が気になる場合のみ |
| `ANTHROPIC_API_KEY` | 任意 | Phase 3 で使用 |

> シークレットはコミットしないでください。`.gitignore` で `.env.local` 等は除外済みです。

## ローカル実行

```bash
# 1. 依存インストール
npm install

# 2. 環境変数を埋める
cp .env.example .env.local
# NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / DATABASE_URL を設定

# 3. Supabase Auth 設定（ダッシュボード）
#   - Authentication → Providers → Email を有効化（デフォルト ON）
#   - Authentication → URL Configuration
#       Site URL: http://localhost:3000
#       Redirect URLs に http://localhost:3000/** を追加

# 4. DB スキーマを反映（開発初期向け）
npm run db:push

# 5. 開発サーバ起動
npm run dev
```

起動後 `/login` から magic link を送り、メールのリンクをクリック → `/books/new` で ISBN を登録します。

## マイグレーション運用

| コマンド | 用途 |
|---|---|
| `npm run db:generate` | `src/db/schema.ts` からマイグレーション SQL を生成（出力先 `drizzle/`） |
| `npm run db:push` | スキーマを DB に直接反映（開発初期向け、マイグレーション履歴を残さない） |
| `npm run db:migrate` | 生成済みマイグレーションを適用（本番・チーム運用向け） |
| `npm run db:studio` | Drizzle Studio で DB を確認 |

本番では `db:push` ではなく、`db:generate` で生成したマイグレーションを `db:migrate` で適用する運用を推奨します。

## デプロイ前チェック

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit
npm test            # Vitest（1回実行）
npm run build       # プロダクションビルド
```

`DATABASE_URL` 未設定でも DB クライアントは Lazy Proxy のため build / lint / typecheck は通ります（実クエリ時のみ env が必要）。CI では CodeQL 解析（`.github/workflows/codeql.yml`）と Dependabot 自動マージ（`.github/workflows/dependabot-automerge.yml`）が動作します。

## Vercel デプロイ

1. Vercel プロジェクトに本リポジトリを接続（フレームワークは Next.js 自動検出）。
2. 上記の環境変数を Vercel の Environment Variables に登録（`NEXT_PUBLIC_SITE_URL` は本番ドメインを設定）。
3. Supabase の Authentication → URL Configuration の Site URL / Redirect URLs を本番ドメインに合わせて更新。
4. Build Command は既定の `next build`、Output は Next.js デフォルトのままで動作します。
5. デプロイ後、`/login` → magic link → `/books/new` の流れで疎通を確認します。

> Phase 1 は「コード完了 / 実機検証待ち」の段階です。初回デプロイ時は認証フローとリダイレクト URL の整合を重点的に確認してください。
