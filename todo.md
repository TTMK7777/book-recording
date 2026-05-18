# TODO

## 進行中

- なし（Phase 2 取り込み基盤 PR #5 マージ完了、次は実 JSON 入手 + UI 実装）

## 次セッションで着手

### 並列可能 (3つのうちどれから着手しても OK)

- **(a) ユーザー実機検証**: `read.amazon.co.jp/notebook` でブックマークレット動作確認 → 1冊スキャンモードで JSON 取得 → `tests/fixtures/amazon-notebook-valid.json` を実データに置き換え PR
- **(b) `/import` UI 実装** (Supabase 不要): JSON ペースト/ファイルアップロード → `parseAmazonNotebookLenient` でプレビュー → Server Action はモック
- **(c) Phase 1 実機検証** (Supabase 必要): 下記「Phase 1 実機検証」手順

### 🎯 Phase 1 実機検証

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

雛形完了 (PR #5, 2026-04-26):

- ✅ 取り込み中間表現の型定義 `src/lib/import/types.ts`
- ✅ Webノートブック HTML 構造の調査メモ `docs/import/amazon-notebook-investigation.md`
- ✅ ブックマークレット `public/bookmarklet/amazon-notebook.js`
- ✅ パーサ `src/lib/import/parsers/amazon-notebook.ts` (Strict / Lenient / 位置抽出)
- ✅ Vitest 4.1 導入 + ユニットテスト 17件

次セッションで着手:

- 取り込みUI `/import` (JSON ペースト or ファイルアップロード → プレビュー)
- 実 JSON 取得 → fixture 置き換え

実機検証後 (Supabase 必要):

- Server Action で books / highlights を upsert
- ハイライト一覧表示 `/books/[isbn]` 拡張

フォローアップ (任意):

- `My Clippings.txt` パーサ (A 経路)
- HTML メール添付パーサ (D 経路, 同じ正規化レイヤを通す)

## 完了

### 2026-04-26

- ✅ 診断士試験タグをスコープ外に整理 (IDEAS.md / plan.md / メモリ)
- ✅ Phase 2 着手: 取り込み中間表現 + ブックマークレット + 構造調査メモ
- ✅ CISO レビュー実施、HIGH-1 / MEDIUM-2 / LOW-1〜3 修正 (MEDIUM-1 規約は OSS 公開前タスクへ移管)
- ✅ パーサ `parseAmazonNotebookStrict` / `parseAmazonNotebookLenient` / `extractLocationNumber` 実装
- ✅ Vitest 4.1 + @vitest/coverage-v8 導入、`npm test` で 17/17 pass
- ✅ 合成 fixture 3件 (valid / with-bad-book / malicious-cover)
- ✅ PR #4 (docs/handover-2026-04-25) マージ
- ✅ PR #5 (Phase 2 取り込み基盤) マージ

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

## セキュリティ backlog（2026-05-18 自動記録 / 着手できない要判断項目）

- [ ] **[security-review] #24 M-2**: `/api/books/lookup` 認証必須化（GOOGLE_BOOKS_API_KEY クォータ枯渇攻撃防止）
  - ファイル: `/api/books/lookup` エンドポイント（約8行 supabase.auth.getUser → 401 返却の修正）
  - なぜ自動対応不可: 未ログインユーザーの書籍検索を許容するか否かの UX 判断待ち。修正コードは closed PR #26 ブランチ `security/fix-issue-24` に保持済み
  - 必要な決定/次アクション: 「未ログインでの書籍検索を許可するか」の UX 方針を決定後、ブランチ `security/fix-issue-24` の PR を再オープンしてマージ
  - 関連 Issue: #24

- [ ] **[security-review] #24 M-1**: postcss CVE（GHSA-qx2v-qp2m-jg99）— Next.js 内蔵バンドルのため external override 不可
  - ファイル: `package.json`（Next.js バージョン更新が必要）
  - なぜ自動対応不可: postcss≥8.5.10 を同梱する Next.js へのアップグレードが必要だが、破壊的変更を含むため回帰確認が必要
  - 必要な決定/次アクション: Next.js を postcss≥8.5.10 を同梱するバージョンへアップグレードし、回帰テスト実施後にマージ
  - 関連 Issue: #24
