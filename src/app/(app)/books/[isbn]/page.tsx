import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { books, readingLogs } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

import { LogForm } from "./log-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ isbn: string }>;
};

function toIsoDate(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

export default async function BookDetailPage({ params }: PageProps) {
  const userId = await requireUserId();
  const { isbn } = await params;

  const [row] = await db
    .select({ book: books, log: readingLogs })
    .from(books)
    .innerJoin(readingLogs, eq(readingLogs.isbn, books.isbn))
    .where(and(eq(books.isbn, isbn), eq(readingLogs.userId, userId)))
    .limit(1);

  if (!row) notFound();

  const { book, log } = row;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <Button render={<Link href="/books" />} variant="ghost" nativeButton={false}>
          ← 本棚
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row">
          {book.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-48 w-auto self-start rounded-md border border-zinc-200 dark:border-zinc-800"
            />
          ) : (
            <div className="flex h-48 w-32 shrink-0 items-center justify-center self-start rounded-md border border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
              no cover
            </div>
          )}
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {book.authors.join(", ") || "—"}
            </p>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {book.publisher && (
                <>
                  <dt className="text-zinc-500">出版社</dt>
                  <dd>{book.publisher}</dd>
                </>
              )}
              {book.pageCount != null && (
                <>
                  <dt className="text-zinc-500">ページ数</dt>
                  <dd>{book.pageCount}</dd>
                </>
              )}
              <dt className="text-zinc-500">ISBN</dt>
              <dd className="font-mono text-xs">{book.isbn}</dd>
              <dt className="text-zinc-500">取得元</dt>
              <dd className="text-xs uppercase">{book.source}</dd>
            </dl>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">読書ログ</h2>
      <LogForm
        initial={{
          logId: log.id,
          isbn: book.isbn,
          status: log.status as "want_to_read" | "reading" | "finished" | "abandoned",
          rating: log.rating,
          startedAt: toIsoDate(log.startedAt),
          finishedAt: toIsoDate(log.finishedAt),
          reviewMd: log.reviewMd ?? "",
          isPublic: log.isPublic,
        }}
      />
    </div>
  );
}
