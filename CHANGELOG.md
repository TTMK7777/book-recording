# Changelog

このプロジェクトの注目すべき変更点を記録します。

フォーマットは [Keep a Changelog 1.1.0](https://keepachangelog.com/ja/1.1.0/) に準拠し、
バージョニングは [Semantic Versioning](https://semver.org/lang/ja/) に従います。

## [Unreleased]

### Planned

- Phase 2: Kindle Web ノートブックからの実 JSON 取得と取り込み UI の完成（書誌＋ハイライト＋メモ）。
- Phase 3: ハイライトを起点とした LinkedIn 投稿下書きの生成と読書ストリーク。
- Phase 4: OGP 画像生成・公開ページ・ジャンルレーダー。

## [0.1.0] - 2026-06-06

ISBN を起点に読書履歴を記録する個人向け Web アプリの初期実装。Phase 1 はコード完了（実機検証待ち）、Phase 2 の取り込みパイプラインは雛形まで実装済み。

### Added

- ISBN ルックアップ API (`GET /api/books/lookup?isbn=xxx`)。openBD を優先し、ヒットしない場合は Google Books へフォールバック。
- 本棚機能: 一覧 (`/books`)、新規登録 (`/books/new`、ISBN 入力 → プレビュー → 登録)、詳細・編集 (`/books/[isbn]`、★評価 / 感想 Markdown / 公開トグル / 日付)。
- Supabase Auth による Email magic link ログイン (`/login`、`/auth/callback`) と、`middleware` + Server Action `requireUserId()` の二重認証ガード。
- Drizzle ORM スキーマ: `books` / `reading_logs` / `highlights`（Supabase Postgres）。マイグレーション `drizzle/0000_pink_cerise.sql` を同梱。
- Phase 2 取り込み基盤: zod 中間表現スキーマ (`src/lib/import/types.ts`) と Amazon Web ノートブック用パーサ (`src/lib/import/parsers/amazon-notebook.ts`、Strict / Lenient / 位置抽出)。
- Kindle Web ノートブック (`read.amazon.co.jp/notebook`) をローカルで JSON 化するブックマークレット (`public/bookmarklet/amazon-notebook.js`)。
- Vitest によるユニットテストと fixture（`tests/`）、v8 カバレッジ計測スクリプト。
- 公開リポジトリ向けメタ整備: `LICENSE` (MIT)、`SECURITY.md`、`CONTRIBUTING.md`、`CODE_OF_CONDUCT.md`。
- CI: CodeQL 解析と Dependabot 自動マージ（non-major）ワークフロー。

### Changed

- DB クライアントを Lazy Proxy 化し、`DATABASE_URL` 未設定でも import / build / lint / typecheck が通るように（実クエリ時のみ env を要求）。
- GitHub Actions をコミット SHA でピン留めし、サプライチェーンを硬化。

### Fixed

- 認証コールバックのオープンリダイレクト（`next=@evil.com`）を修正し、リダイレクト先を `NEXT_PUBLIC_SITE_URL` ベースに固定 (H-1)。
- `getTrustedOrigin` の本番 Host ヘッダフォールバックを削除し、Host Header Injection を防止 (H-1)。
- 取り込み中間表現で `cover_url` を http(s) スキーム・長さ 2048 に限定し、`data:` / `javascript:` URI を遮断 (M-3)。
- text / note / location / title / author の長さ上限と books / highlights 配列の上限 (10,000) を導入、ASIN / ISBN を正規表現で検証 (CISO レビュー HIGH/MEDIUM/LOW)。
- postcss・esbuild の MEDIUM 脆弱性を `overrides` で解消し、`npm audit` の指摘を削減。

---

> なお、このチェンジログ導入以前の履歴は記録対象外です。詳細は `git log` を参照してください。

[Unreleased]: https://github.com/TTMK7777/book-recording/compare/main...HEAD
[0.1.0]: https://github.com/TTMK7777/book-recording/commits/main
