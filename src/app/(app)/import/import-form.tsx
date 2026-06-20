"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
// パーサは zod のみに依存する純関数で server-only な依存を持たないため、
// クライアントから直接 import してブラウザ上でプレビューをパースできる。
// (server-only 依存が混入してビルドが落ちる場合は Server Action 経由に切り替える。)
import { parseAmazonNotebookLenient } from "@/lib/import/parsers/amazon-notebook";
import { parseMyClippingsLenient } from "@/lib/import/parsers/my-clippings";
import type { ParseWarning } from "@/lib/import/parsers/amazon-notebook";
import type { ImportedBook } from "@/lib/import/types";

import { importClippings } from "./actions";

// 本フォームが扱う取り込み元 (kindle-email は未対応なので除外)。
type FormSource = "my-clippings" | "amazon-notebook";

// プレビューで保持する正規化済みの結果。
type PreviewData = {
  source: FormSource;
  books: ImportedBook[];
  totalHighlights: number;
  skipped: ParseWarning[];
  warnings: ParseWarning[];
  dedupRemoved: number;
};

// skip 理由の日本語ラベル。reason はパーサが付ける文字列 (truncated/bookmark/empty 等)。
const SKIP_REASON_LABELS: Record<string, string> = {
  truncated: "截断",
  bookmark: "ブックマーク",
  empty: "空",
};

function skipReasonLabel(reason: string): string {
  return SKIP_REASON_LABELS[reason] ?? "その他";
}

// 表示用に skip を理由カテゴリ別に集計する。zod 由来の長文 reason は「その他」へ寄せる。
function summarizeSkips(skipped: ParseWarning[]): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of skipped) {
    const label = skipReasonLabel(s.reason);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return Array.from(counts.entries()).map(([label, count]) => ({ label, count }));
}

// 拡張子から取り込み元を推定する。
function inferSource(fileName: string): FormSource | null {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".txt")) return "my-clippings";
  if (lower.endsWith(".json")) return "amazon-notebook";
  return null;
}

export function ImportForm() {
  const [source, setSource] = useState<FormSource>("my-clippings");
  const [fileText, setFileText] = useState("");
  // my-clippings の exported_at に渡す ISO 文字列。File.lastModified 由来 or 未設定。
  const [exportedAt, setExportedAt] = useState<string | undefined>(undefined);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // text と source からプレビューをパースする (ブラウザ側)。
  function runPreview(text: string, src: FormSource, exported: string | undefined) {
    setParseError(null);
    setExpandedKey(null);

    if (text.trim() === "") {
      setPreview(null);
      return;
    }

    try {
      if (src === "my-clippings") {
        const exp = exported ?? new Date().toISOString();
        const { payload, skipped, warnings, dedupRemoved } =
          parseMyClippingsLenient(text, exp);
        const totalHighlights = payload.books.reduce(
          (sum, b) => sum + b.highlights.length,
          0,
        );
        setPreview({
          source: src,
          books: payload.books,
          totalHighlights,
          skipped,
          warnings,
          dedupRemoved,
        });
      } else {
        const json: unknown = JSON.parse(text);
        const { payload, skipped } = parseAmazonNotebookLenient(json);
        const totalHighlights = payload.books.reduce(
          (sum, b) => sum + b.highlights.length,
          0,
        );
        setPreview({
          source: src,
          books: payload.books,
          totalHighlights,
          skipped,
          warnings: [],
          dedupRemoved: 0,
        });
      }
    } catch (error) {
      setPreview(null);
      const message =
        error instanceof Error
          ? error.message
          : "内容を解析できませんでした。形式を確認してください。";
      setParseError(message);
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const inferred = inferSource(file.name);
    const nextSource = inferred ?? source;
    if (inferred) setSource(inferred);

    const text = await file.text();
    // my-clippings の exported_at は File.lastModified を ISO 化して渡す。
    const exported =
      file.lastModified > 0
        ? new Date(file.lastModified).toISOString()
        : new Date().toISOString();

    setFileText(text);
    setExportedAt(exported);
    runPreview(text, nextSource, exported);
  }

  function handleTextChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = event.target.value;
    setFileText(text);
    // 貼り付け時は lastModified が無いので現在時刻にフォールバックする。
    setExportedAt(undefined);
    runPreview(text, source, undefined);
  }

  function handleSourceChange(next: FormSource) {
    setSource(next);
    runPreview(fileText, next, exportedAt);
  }

  function handleImport() {
    if (!preview) return;
    startTransition(async () => {
      const result = await importClippings({
        fileText,
        source: preview.source,
        exportedAt,
      });
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  // 表示用に本をハイライト数の多い順に並べ替える。
  const sortedBooks = useMemo(() => {
    if (!preview) return [];
    return [...preview.books].sort(
      (a, b) => b.highlights.length - a.highlights.length,
    );
  }, [preview]);

  const TOP_N = 20;
  const topBooks = sortedBooks.slice(0, TOP_N);
  const restCount = Math.max(0, sortedBooks.length - TOP_N);

  const skipSummary = preview ? summarizeSkips(preview.skipped) : [];
  const canImport = preview != null && preview.totalHighlights > 0 && !isPending;

  return (
    <div className="space-y-6">
      {/* 入力エリア: ファイル + 取り込み元切替 + テキスト貼り付け */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="import-file">ファイルを選ぶ</Label>
            <input
              id="import-file"
              ref={fileInputRef}
              type="file"
              accept=".txt,.json"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-foreground file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-muted file:px-2 file:py-1 file:text-sm file:font-medium hover:file:bg-muted/70 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none"
            />
            <p className="text-xs text-muted-foreground">
              .txt → My Clippings / .json → Amazon ノートブック
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-source">取り込み元</Label>
            <select
              id="import-source"
              value={source}
              onChange={(event) =>
                handleSourceChange(event.target.value as FormSource)
              }
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="my-clippings">My Clippings (.txt)</option>
              <option value="amazon-notebook">Amazon ノートブック (.json)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              拡張子から自動判定します。必要なら手動で切り替えてください。
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="import-text">またはテキストを貼り付ける</Label>
          <Textarea
            id="import-text"
            value={fileText}
            onChange={handleTextChange}
            placeholder={
              source === "my-clippings"
                ? "My Clippings.txt の内容を貼り付け…"
                : "Amazon ノートブックの JSON を貼り付け…"
            }
            className="min-h-40 font-mono text-xs"
          />
        </div>
      </div>

      {parseError && (
        <Card className="border-destructive/40">
          <CardContent className="py-1 text-sm text-destructive">
            解析に失敗しました: {parseError}
          </CardContent>
        </Card>
      )}

      {preview && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-lg">
              {preview.books.length}冊・{preview.totalHighlights}件を取り込みます
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* (b) skip 内訳 + dedup */}
            {(skipSummary.length > 0 || preview.dedupRemoved > 0) && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">スキップ:</span>
                {skipSummary.map((s) => (
                  <Badge key={s.label} variant="secondary">
                    {s.label} {s.count}
                  </Badge>
                ))}
                {preview.dedupRemoved > 0 && (
                  <Badge variant="outline">重複統合 {preview.dedupRemoved}</Badge>
                )}
                {preview.warnings.length > 0 && (
                  <Badge variant="outline">切り詰め {preview.warnings.length}</Badge>
                )}
              </div>
            )}

            {/* (c) 本ごとのテーブル (ハイライト多い順) */}
            {topBooks.length > 0 ? (
              <div className="space-y-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>タイトル</TableHead>
                      <TableHead>著者</TableHead>
                      <TableHead className="text-right">ハイライト数</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topBooks.map((book, index) => {
                      const key = `${book.title}__${book.author ?? ""}__${index}`;
                      const isExpanded = expandedKey === key;
                      return (
                        <TableRow key={key}>
                          <TableCell className="max-w-[18rem] truncate whitespace-normal font-medium">
                            {book.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {book.author ?? "—"}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {book.highlights.length}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() =>
                                setExpandedKey(isExpanded ? null : key)
                              }
                              disabled={book.highlights.length === 0}
                            >
                              {isExpanded ? "閉じる" : "表示"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {restCount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    他 {restCount} 冊
                  </p>
                )}

                {/* (d) 1冊展開してハイライト本文サンプル (最大5件) */}
                {expandedKey != null &&
                  (() => {
                    const idx = topBooks.findIndex(
                      (book, index) =>
                        `${book.title}__${book.author ?? ""}__${index}` ===
                        expandedKey,
                    );
                    if (idx < 0) return null;
                    const book = topBooks[idx];
                    const samples = book.highlights.slice(0, 5);
                    return (
                      <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                        <p className="text-xs font-medium text-muted-foreground">
                          「{book.title}」のハイライト（先頭{samples.length}件）
                        </p>
                        <ul className="space-y-2">
                          {samples.map((h, i) => (
                            <li
                              key={i}
                              className="border-l-2 border-border pl-3 text-sm"
                            >
                              {h.text}
                              {h.location && (
                                <span className="ml-2 text-xs text-muted-foreground">
                                  ({h.location})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                        {book.highlights.length > samples.length && (
                          <p className="text-xs text-muted-foreground">
                            ほか {book.highlights.length - samples.length} 件
                          </p>
                        )}
                      </div>
                    );
                  })()}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                取り込めるハイライトがありませんでした。
              </p>
            )}

            <div className="pt-1">
              <Button onClick={handleImport} disabled={!canImport}>
                {isPending ? "取り込み中…" : "取り込む"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
