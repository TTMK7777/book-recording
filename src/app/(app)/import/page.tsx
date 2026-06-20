import { ImportForm } from "./import-form";

export const metadata = {
  title: "ハイライトを取り込む | book-recording",
  description:
    "Kindle の My Clippings.txt や Amazon ノートブックのエクスポートから、本とハイライトを一括取り込みします。",
};

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          ハイライトを取り込む
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
          Kindle の{" "}
          <code className="rounded bg-zinc-100 px-1 py-0.5 text-xs dark:bg-zinc-800">
            My Clippings.txt
          </code>{" "}
          またはAmazonノートブックのJSONから、本とハイライトをまとめて取り込めます。
          ファイルを選ぶか貼り付けるとブラウザ上でプレビューできます。取り込みボタンを押すまでデータは送信されません。
        </p>
      </div>

      <ImportForm />
    </div>
  );
}
