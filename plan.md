# Plan

プロジェクト方向性・フェーズ計画・大きな設計決定。

## プロジェクト概要

読書履歴を有効に管理し、読書モチベを高めるための個人向け Web アプリ。
詳細は [`IDEAS.md`](./IDEAS.md) 参照。

## 技術スタック決定 (2026-04-21 確定)

- **Next.js 16** + **React 19** + **App Router** + **Turbopack**
- **Tailwind CSS v4** + **shadcn/ui** (base-ui ベース)
- **Drizzle ORM** + **Supabase Postgres**
- **Supabase Auth** (`@supabase/ssr`) - Email magic link
- **Vercel** デプロイ前提

不採用: Streamlit（URL 設計不可・OGP 不可のため）

## フェーズ計画

| Phase | 内容 | 状態 |
|-------|------|------|
| **Phase 0** | 計画・scaffold | ✅ 完了 (2026-04-25) |
| **Phase 1** | ISBN登録 → 書誌取得 → 一覧/詳細 → ★/感想 + Auth | ✅ コード完了 (2026-04-25) / ⏳ 実機検証待ち |
| **Phase 2** | Kindle 一括取り込み (Webノートブック C 主軸: 書籍+ハイライト+メモ) | 着手中 (2026-04-26) |
| **Phase 3** | LinkedIn 投稿下書き / ストリーク | 未着手 |
| **Phase 4** | OGP / 公開ページ / ジャンルレーダー | 未着手 |
| **Phase 5** (任意) | Obsidian / MCP 連携 / 外向け公開（D-Gmail 連携で量産） | 未着手 |

## 設計決定ログ

### 2026-04-25: Phase 1 設計の仮置き回答（IDEAS.md §3 の質問）

| 質問 | 回答 |
|------|------|
| 読書形態の比率 | Kindle中心、物理本も取り込めるとベター |
| 現状の記録手段 | なし前提（Greenfield） |
| モチベの定義 | **継続（ストリーク）** + **アウトプット連携（LinkedIn 下書き）** |
| PKM 環境 | Obsidian 併用も視野（Phase 5 で連携） |
| 発信連携 | **狙う**（LinkedIn 下書き生成、独自価値の核） |
| 投下時間 | 週末プロト（Phase 1 は 2 週間相当の粒度） |

### 2026-04-25: 1 user 1 book 1 reading_log

- Phase 1 段階では再読を別レコードで持たない
- 将来再読要件が出たら `cycle` カラム追加 or 別テーブル化

### 2026-04-25: 書誌取得は openBD 優先 → Google Books fallback

- 和書カバレッジ (openBD) > 全書籍 (Google Books)
- 個人ユーザーが読む本の大半は和書という前提

### 2026-04-25: DB クライアント Lazy Proxy 化

- `DATABASE_URL` 未設定でも import 可、ビルド・lint・typecheck が通る
- 実 query 時のみ env 必須

### 2026-04-25: Auth は middleware + Server Action 二重チェック

- middleware で `/books` 配下を redirect ガード
- Server Action / Server Component 冒頭で `requireUserId()` ヘルパで再確認
- env 未設定の middleware は素通し（dev 初期セットアップで /login にループしないため）

### 2026-04-26: Phase 2 取り込みは「入力アダプタ分離 + 共通正規化」設計

- 入力源: **C** (read.amazon.co.jp/notebook をブックマークレットで JSON 化) を当面の主軸
- フォールバック: **A** (`My Clippings.txt` アップロード)、**D** (HTMLメール添付アップロード)
- 共通正規化レイヤ: `{book: {asin, title, author, cover_url}, highlights: [{text, location, note?, color?}]}` を中間表現に
- 外向け公開時は **D-Gmail API 連携** に置き換え（規約クリーン・自動化可・サービス側リスク最小）
- C のサーバー側スクレイピング（Readwise型）は採用しない: 規約違反・認証情報預かりリスク・Amazon BAN リスク

### 2026-04-26: 不採用 - 中小企業診断士試験タグ連携

- 当初 IDEAS.md で独自価値3点セットの一角としていたが、本アプリのスコープから外す
- 理由: 試験対策アプリではなく読書履歴アプリとしての汎用性を優先
- 学習進捗管理が必要なら別アプリで対応

### 2026-04-26: CISO レビュー結果と対応方針

- 観点: ブックマークレット/中間表現/調査ドキュメント 3点に対するセキュリティ評価
- 評価: ⚠️ Conditionally Approved (コア設計は安全。innerText 一択・完全ローカル動作・Cookie 不参照は high-quality)
- 対応済 (このコミットで)
  - HIGH-1: cover_url を http(s) 限定 + 長さ 2048 制限
  - MEDIUM-2: text/note/location/title/author の長さ上限、books/highlights 配列上限 10000
  - LOW-1: exported_at / highlighted_at を ISO 8601 datetime 検証
  - LOW-2: ASIN / ISBN の正規表現バリデーション
  - LOW-3: ブックマークレットに read.amazon.* 起動ドメインチェック
- スキップ → todo.md 「OSS 公開前の必須対応」に移管
  - MEDIUM-1: Amazon 利用規約 DISCLAIMER の追加 (当面の本人利用範囲ではスキップ、public 化前に必ず対応)

## 独自価値の2点セット (IDEAS.md §4 から)

1. **和書カバレッジ強い** (openBD / カーリル / 国会図書館)
2. **ハイライト → SNS 発信の自動ブリッジ** (Phase 3 で実装)

これらは Readwise 系では代替不可。

## リポジトリ運用ルール

- **main 直 push 禁止**（ガード発動も実運用としても）
- 機能ブランチ → PR → GitHub UI でマージ → ローカル sync
- PR タイトル: `feat:` `chore:` `docs:` `fix:` の prefix を使う
