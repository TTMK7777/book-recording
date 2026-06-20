import Link from "next/link";
import { BookOpen, Upload, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Upload,
    title: "Kindleから一括取り込み",
    description:
      "My Clippings.txt を選ぶだけ。何百件ものハイライトを自動で書籍ごとに分類し、重複も除去します。",
  },
  {
    icon: BookOpen,
    title: "本棚で一元管理",
    description:
      "ISBN から書誌を自動取得。読了・積読・読書中のステータスと感想をまとめて記録します。",
  },
  {
    icon: Sparkles,
    title: "AIで振り返り（準備中）",
    description:
      "ローカル LLM がハイライトを要約し、読書傾向を分析。気づきを知識として定着させます。",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      {/* Hero */}
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-zinc-50 to-white px-6 py-28 dark:from-zinc-950 dark:to-zinc-900">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3.5 py-1 text-xs font-medium text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <BookOpen className="h-3 w-3" />
            個人向け読書記録アプリ
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            Kindle のハイライトを、
            <br />
            <span className="text-zinc-400 dark:text-zinc-500">知識に変える。</span>
          </h1>

          <p className="mx-auto max-w-lg text-pretty text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            My Clippings.txt を貼るだけで書籍とハイライトを一括インポート。
            読書ログと感想をまとめて管理し、読書習慣を可視化します。
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/import" />} size="lg">
              ハイライトを取り込む
            </Button>
            <Button render={<Link href="/books" />} size="lg" variant="outline">
              本棚を見る
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-100 bg-zinc-50 px-6 py-20 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-5 sm:grid-cols-3">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="border-zinc-200/80 shadow-none dark:border-zinc-800"
              >
                <CardContent className="space-y-3 p-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <feature.icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
