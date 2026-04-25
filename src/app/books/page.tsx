import { desc, eq } from "drizzle-orm";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { books, readingLogs } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "本棚 | book-recording",
};

const STATUS_LABEL: Record<string, string> = {
  want_to_read: "積読",
  reading: "読書中",
  finished: "読了",
  abandoned: "中断",
};

export default async function BooksPage() {
  const userId = await requireUserId();

  const rows = await db
    .select({
      log: readingLogs,
      book: books,
    })
    .from(readingLogs)
    .innerJoin(books, eq(readingLogs.isbn, books.isbn))
    .where(eq(readingLogs.userId, userId))
    .orderBy(desc(readingLogs.updatedAt));

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">本棚</h1>
          <p className="text-sm text-zinc-500">
            登録: {rows.length} 冊
          </p>
        </div>
        <Button render={<Link href="/books/new" />} nativeButton={false}>
          本を登録する
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
          まだ本が登録されていません。
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map(({ log, book }) => (
            <li key={log.id}>
              <Link href={`/books/${book.isbn}`} className="block">
                <Card className="h-full transition-colors hover:border-zinc-400 dark:hover:border-zinc-600">
                  <CardHeader className="flex flex-row gap-4">
                    {book.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="h-24 w-auto rounded-sm border border-zinc-200 dark:border-zinc-800"
                      />
                    ) : (
                      <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-sm border border-zinc-200 text-xs text-zinc-400 dark:border-zinc-800">
                        no cover
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <CardTitle className="truncate text-base">
                        {book.title}
                      </CardTitle>
                      <p className="truncate text-sm text-zinc-500">
                        {book.authors.join(", ") || "—"}
                      </p>
                      <Badge variant="secondary">
                        {STATUS_LABEL[log.status] ?? log.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  {log.rating != null && (
                    <CardContent className="text-sm text-amber-600">
                      {"★".repeat(log.rating)}
                      {"☆".repeat(5 - log.rating)}
                    </CardContent>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
