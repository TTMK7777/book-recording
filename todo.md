# TODO

## 進行中

- なし（Phase 1 機能実装完了、実機検証待ち）

## 次セッションで着手

### 🎯 最優先: Phase 1 実機検証

1. **Supabase プロジェクト作成**
   - https://supabase.com で新規プロジェクト
   - リージョン Tokyo 推奨
   - DB Password 控える

2. **認証情報を `.env.local` に設定**
   - `NEXT_PUBLIC_SUPABASE_URL` (Settings → API)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Settings → API → anon public)
   - `DATABASE_URL` (Settings → Database → Transaction pooler)

3. **Auth 設定**
   - Email Provider 有効化（デフォルト ON）
   - Site URL: `http://localhost:3000`
   - Redirect URLs に `http://localhost:3000/**` 追加

4. **動作確認**
   - `npm run db:push` でスキーマ反映
   - `npm run dev` で起動
   - `/login` → magic link → `/books/new` で和書 ISBN を登録
   - `/books` 一覧表示、`/books/[isbn]` 詳細編集を確認

### Phase 2 実装（実機検証後）

- Kindle `My Clippings.txt` パーサ
- ハイライト取り込み画面 `/books/[isbn]/import`
- ハイライト一覧表示
- (任意) Gmail API 連携で自動取り込み

## 完了

### 2026-04-25

- ✅ リポジトリ `TTMK7777/book-recording` クローン
- ✅ Phase 1 実装計画策定（仮置き質問の回答含む）
- ✅ Next.js 16.2.4 + React 19 + Tailwind v4 + Turbopack scaffold
- ✅ shadcn/ui 初期化 + 9コンポーネント (button/input/label/card/textarea/table/dialog/sonner/badge)
- ✅ Drizzle ORM + postgres + @supabase/ssr セットアップ
- ✅ 書誌APIラッパー (openBD → Google Books fallback、ISBN-10→13 正規化)
- ✅ スキーマ定義 (books / reading_logs / highlights) + 初期マイグレーション
- ✅ `/api/books/lookup` Route Handler
- ✅ `/books/new`（ISBN 入力 → プレビュー → Server Action 登録）
- ✅ `/books`（自分の本棚一覧）
- ✅ `/books/[isbn]`（書誌＋読書ログ編集: ★/感想/公開/日付）
- ✅ `/login` + `/auth/callback`（Supabase Email magic link）
- ✅ `src/middleware.ts` 認証必須ルート保護
- ✅ DB クライアントを Lazy Proxy 化 (env 未設定でも import 可)
- ✅ PR #2 (.gitignore リッチ版) マージ
- ✅ PR #3 (Phase 1 MVP) マージ
- ✅ 旧 PR #1 / `chore/add-gitignore-2026-04-22` ブランチ整理

## 残課題（Phase 2 以降）

- LinkedIn 投稿下書き生成（Claude API）
- 診断士試験タグの 7科目体系定義
- ストリーク（連続読書日数）計算ロジック
- OGP 画像自動生成 (`@vercel/og`)
- 公開/非公開ページの切り分け（is_public が true の本のみ匿名アクセス可）
- ジャンルカバレッジレーダー
- 四半期振り返り AI 生成
- (任意) Obsidian エクスポート / MCP サーバー化
