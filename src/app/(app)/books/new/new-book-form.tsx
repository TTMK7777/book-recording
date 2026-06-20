"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookInfo } from "@/lib/books";

import { registerBookByIsbn } from "./actions";

export function NewBookForm() {
  const [isbn, setIsbn] = useState("");
  const [preview, setPreview] = useState<BookInfo | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleLookup() {
    if (!isbn.trim()) return;
    setIsLooking(true);
    setPreview(null);
    try {
      const res = await fetch(
        `/api/books/lookup?isbn=${encodeURIComponent(isbn)}`,
      );
      if (!res.ok) {
        const err: { error?: string } = await res.json().catch(() => ({}));
        toast.error(err.error ?? "書誌を取得できませんでした");
        return;
      }
      const data = (await res.json()) as BookInfo;
      setPreview(data);
    } catch {
      toast.error("書誌APIへのリクエストに失敗しました");
    } finally {
      setIsLooking(false);
    }
  }

  function handleRegister() {
    if (!preview) return;
    startTransition(async () => {
      const result = await registerBookByIsbn(preview.isbn);
      if (result && !result.ok) {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="isbn">ISBN</Label>
        <div className="flex gap-2">
          <Input
            id="isbn"
            value={isbn}
            onChange={(event) => setIsbn(event.target.value)}
            placeholder="978-..."
            inputMode="numeric"
            disabled={isLooking}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleLookup();
              }
            }}
          />
          <Button
            onClick={handleLookup}
            disabled={isLooking || !isbn.trim()}
          >
            {isLooking ? "取得中…" : "書誌を取得"}
          </Button>
        </div>
        <p className="text-xs text-zinc-500">
          openBD（和書優先）→ Google Books の順で検索します。
        </p>
      </div>

      {preview && (
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            {preview.coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview.coverUrl}
                alt={preview.title}
                className="h-32 w-auto rounded-md border border-zinc-200 dark:border-zinc-800"
              />
            )}
            <div className="flex-1 space-y-1">
              <CardTitle className="text-lg">{preview.title}</CardTitle>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {preview.authors.join(", ") || "—"}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {preview.publisher && <p>出版社: {preview.publisher}</p>}
            {preview.pageCount != null && <p>{preview.pageCount} ページ</p>}
            <p className="text-xs text-zinc-500">
              ISBN: {preview.isbn} / 取得元: {preview.source}
            </p>
            <div className="pt-3">
              <Button onClick={handleRegister} disabled={isPending}>
                {isPending ? "登録中…" : "本棚に登録する"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
