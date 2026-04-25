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

### Phase 2 実装（Kindle 一括取り込み, C 主軸）

並行可能 (Supabase 不要のうちに先行できるもの):

- 取り込み中間表現の型定義 `src/lib/import/types.ts`
- Webノートブック (read.amazon.co.jp/notebook) HTML 構造の調査メモ
- ブックマークレット (`public/bookmarklet.js`) — 全書籍を順次開いて JSON で吐き出す
- HTML/JSON パーサ `src/lib/import/parsers/amazon-notebook.ts`
- パーサのユニットテスト (Vitest, fixture HTML を `tests/fixtures/`)
- 取り込みUI `/import` (JSON ペースト or ファイルアップロード → プレビュー)

実機検証後 (Supabase 必要):

- Server Action で books / highlights を upsert
- ハイライト一覧表示 `/books/[isbn]` 拡張

フォローアップ (任意):

- `My Clippings.txt` パーサ (A 経路)
- HTML メール添付パーサ (D 経路, 同じ正規化レイヤを通す)

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

## 残課題（Phase 3 以降）

- LinkedIn 投稿下書き生成（Claude API）
- ストリーク（連続読書日数）計算ロジック
- OGP 画像自動生成 (`@vercel/og`)
- 公開/非公開ページの切り分け（is_public が true の本のみ匿名アクセス可）
- ジャンルカバレッジレーダー
- 四半期振り返り AI 生成
- (任意) Obsidian エクスポート / MCP サーバー化
- (外向け公開時) D-Gmail API 連携取り込みアダプタ

## OSS 公開前の必須対応

> 出典: 2026-04-26 CISO レビュー (MEDIUM-1) — 当面の本人利用ではスキップしているが、リポジトリを public 化する前に必ず潰すこと。

- [ ] `public/bookmarklet/amazon-notebook.js` 冒頭に DISCLAIMER ブロックを追加
  - 本人アカウントの本人データ抽出に限定
  - Amazon 利用規約上のグレーゾーンであり自己責任
  - アカウント停止リスク (BOT 検知)
  - 第三者データへの使用禁止 / 取得データの再配布禁止
- [ ] `README.md` (or `DISCLAIMER.md`) に同等の英文 DISCLAIMER を追加
- [ ] LICENSE に MIT/Apache-2.0 + 追加 DISCLAIMER 条項を併記
- [ ] `docs/import/amazon-notebook-investigation.md` にも法務注意書きを冒頭追加
