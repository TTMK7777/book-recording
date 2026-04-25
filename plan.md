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
| **Phase 2** | Kindle ハイライト取り込み (`My Clippings.txt` / Gmail) | 未着手 |
| **Phase 3** | LinkedIn 投稿下書き / 診断士試験タグ / ストリーク | 未着手 |
| **Phase 4** | OGP / 公開ページ / ジャンルレーダー | 未着手 |
| **Phase 5** (任意) | Obsidian / MCP 連携 | 未着手 |

## 設計決定ログ

### 2026-04-25: Phase 1 設計の仮置き回答（IDEAS.md §3 の質問）

| 質問 | 回答 |
|------|------|
| 読書形態の比率 | Kindle中心、物理本も取り込めるとベター |
| 現状の記録手段 | なし前提（Greenfield） |
| モチベの定義 | **継続（ストリーク）** + **アウトプット連携（LinkedIn 下書き）** |
| PKM 環境 | Obsidian 併用も視野（Phase 5 で連携） |
| 試験/発信連携 | **狙う**（独自価値の核） |
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

## 独自価値の3点セット (IDEAS.md §4 から)

1. **和書カバレッジ強い** (openBD / カーリル / 国会図書館)
2. **ハイライト → SNS 発信の自動ブリッジ** (Phase 3 で実装)
3. **診断士試験タグ連携** (Phase 3 で実装)

これらは Readwise 系では代替不可。

## リポジトリ運用ルール

- **main 直 push 禁止**（ガード発動も実運用としても）
- 機能ブランチ → PR → GitHub UI でマージ → ローカル sync
- PR タイトル: `feat:` `chore:` `docs:` `fix:` の prefix を使う
