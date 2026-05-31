# コントリビューションガイド (Contributing)

book-recording へのコントリビュートに興味を持っていただきありがとうございます。本プロジェクトは [MIT ライセンス](./LICENSE) のもとで公開されているオープンソースソフトウェアです。バグ報告・機能提案・ドキュメント改善・コード貢献など、どんな形の貢献も歓迎します。

## Issue 報告

バグ報告や機能要望は GitHub の Issue でお願いします。

- **バグ報告**: 再現手順、期待される挙動、実際の挙動、環境（OS / Node.js バージョン / ブラウザ）、エラーメッセージやスタックトレースを含めてください。
- **機能要望**: 解決したい課題と、提案する機能の概要・ユースケースを記載してください。

可能であれば、既存の Issue と重複していないか事前に確認してください。

## 開発環境セットアップ

本プロジェクトは Next.js 16 + React 19 + Tailwind CSS v4 + Drizzle ORM + Supabase Postgres で構成されています。

```bash
# 1. 依存をインストール
npm install

# 2. 環境変数を設定（.env.example をコピーして値を埋める）
cp .env.example .env.local
#   - NEXT_PUBLIC_SUPABASE_URL       (Supabase Settings → API)
#   - NEXT_PUBLIC_SUPABASE_ANON_KEY  (Supabase Settings → API → anon public)
#   - DATABASE_URL                    (Supabase Settings → Database → Transaction pooler)
#   ※ 値そのものをコミットしないでください（.env.local は Git 管理外です）

# 3. DBスキーマを反映
npm run db:push

# 4. 開発サーバを起動
npm run dev

# 5. テストを実行（Vitest）
npm test
```

その他のスクリプトは [README.md](./README.md) のスクリプト一覧を参照してください。

## プルリクエストの流れ

1. `main` ブランチから作業ブランチを分岐します（例: `feature/xxx`、`fix/xxx`、`docs/xxx`）。
2. `main` への直接 push は禁止です。必ずプルリクエスト経由で変更を提案してください。
3. 1つの PR では目的を1つに絞ってください（無関係な変更を混在させない）。
4. コミットメッセージは変更内容が分かるよう簡潔に記述してください。
5. 提出前に `npm test` が通ること、`npm run lint` と `npm run typecheck` がエラーなく完了することを確認してください。
6. PR の説明には、変更の目的・内容・確認方法を記載してください。

## コーディング規約

- 言語は **TypeScript** を使用します。型は可能な限り明示し、`any` の濫用は避けてください。
- 既存のコードスタイル・ディレクトリ構成・命名規則に合わせてください。
- Lint は `npm run lint`（ESLint / eslint-config-next）、型チェックは `npm run typecheck`（`tsc --noEmit`）で実行します。両方ともエラーがない状態を維持してください。

## ライセンス

本プロジェクトに貢献いただいたコードは、[MIT ライセンス](./LICENSE) のもとで受け入れられます。プルリクエストを送ることで、あなたの貢献が MIT ライセンスで配布されることに同意したものとみなされます。

## 行動規範

本プロジェクトへの参加にあたっては [行動規範 (CODE_OF_CONDUCT.md)](./CODE_OF_CONDUCT.md) の遵守をお願いします。
