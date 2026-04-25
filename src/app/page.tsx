import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 dark:bg-zinc-950">
      <main className="w-full max-w-xl space-y-8 text-center">
        <div className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
            book-recording
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            読書をモチベに変える、個人の本棚。
          </h1>
          <p className="text-pretty text-zinc-600 dark:text-zinc-400">
            ISBN を入れるだけで書誌を取得し、感想とハイライトをまとめて記録します。
            和書は openBD、洋書は Google Books でカバーします。
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link href="/books" />} size="lg" nativeButton={false}>
            本棚を見る
          </Button>
          <Button
            render={<Link href="/books/new" />}
            size="lg"
            variant="outline"
            nativeButton={false}
          >
            本を登録する
          </Button>
        </div>

        <p className="text-xs text-zinc-500">
          Phase 1 セットアップ完了 — 機能実装はこれから。
        </p>
      </main>
    </div>
  );
}
