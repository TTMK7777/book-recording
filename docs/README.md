# Documentation Map / ドキュメント目次

book-recording のドキュメント一覧です。読者ロール別の入口と、リポジトリに実在するドキュメントの一覧を示します。

---

## 日本語

### ロール別の入口

- **利用者（アプリを使いたい）** — まず [`README.md`](../README.md) のセットアップ手順を読み、ローカルで起動してください。
- **運用者（デプロイ・運用したい）** — [`docs/ops/deployment.md`](./ops/deployment.md) を一度通しで実行してください。
- **開発者（コードを読む・変える）** — [`docs/dev/architecture.md`](./dev/architecture.md) で全体構成を把握し、[`CONTRIBUTING.md`](../CONTRIBUTING.md) の開発フローに従ってください。

### ドキュメント一覧

| ドキュメント | 種別 (Diátaxis) | 内容 |
|---|---|---|
| [`README.md`](../README.md) | Tutorial / Reference | プロジェクト概要・技術スタック・セットアップ・スクリプト一覧 |
| [`docs/ops/deployment.md`](./ops/deployment.md) | How-to | Vercel + Supabase へのデプロイ／ローカル実行手順 |
| [`docs/dev/architecture.md`](./dev/architecture.md) | Explanation | アーキテクチャ・モジュール構成・データモデル・設計判断 |
| [`docs/import/amazon-notebook-investigation.md`](./import/amazon-notebook-investigation.md) | Reference | Kindle Web ノートブックの DOM 構造調査メモ（Phase 2 取り込み） |
| [`plan.md`](../plan.md) | Explanation | フェーズ計画と設計決定ログ |
| [`IDEAS.md`](../IDEAS.md) | Explanation | 企画背景・差別化方針 |
| [`CHANGELOG.md`](../CHANGELOG.md) | Reference | 変更履歴（Keep a Changelog 準拠） |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | How-to | コントリビュート手順・ブランチ運用 |
| [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md) | Reference | 行動規範 |
| [`SECURITY.md`](../SECURITY.md) | Reference | 脆弱性報告ポリシー |

---

## English

### Entry points by role

- **Users (want to run the app)** — start with the setup steps in [`README.en.md`](../README.en.md) and run it locally.
- **Operators (want to deploy/operate)** — walk through [`docs/ops/deployment.md`](./ops/deployment.md) once.
- **Developers (read/change the code)** — read [`docs/dev/architecture.md`](./dev/architecture.md) for the big picture, then follow the workflow in [`CONTRIBUTING.md`](../CONTRIBUTING.md).

### Document index

| Document | Type (Diátaxis) | Contents |
|---|---|---|
| [`README.en.md`](../README.en.md) | Tutorial / Reference | Overview, tech stack, setup, scripts (English mirror) |
| [`docs/ops/deployment.md`](./ops/deployment.md) | How-to | Deploy to Vercel + Supabase / run locally |
| [`docs/dev/architecture.md`](./dev/architecture.md) | Explanation | Architecture, module layout, data model, design decisions |
| [`docs/import/amazon-notebook-investigation.md`](./import/amazon-notebook-investigation.md) | Reference | DOM investigation notes for the Kindle Web Notebook import (Phase 2) |
| [`CHANGELOG.md`](../CHANGELOG.md) | Reference | Change history (Keep a Changelog) |
| [`CONTRIBUTING.md`](../CONTRIBUTING.md) | How-to | Contribution and branch workflow |
| [`SECURITY.md`](../SECURITY.md) | Reference | Vulnerability reporting policy |

> The Japanese documents `plan.md` and `IDEAS.md` are the canonical source for project planning and rationale and are not mirrored in English.
