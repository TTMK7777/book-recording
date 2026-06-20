"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { books, readingLogs } from "@/db/schema";
import { requireUserId } from "@/lib/auth";
import { lookupBookByIsbn, normalizeIsbn } from "@/lib/books";

export type RegisterFailure = { ok: false; error: string };

export async function registerBookByIsbn(
  rawIsbn: string,
): Promise<RegisterFailure | undefined> {
  const userId = await requireUserId();

  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) {
    return { ok: false, error: "ISBN の形式が不正です。" };
  }

  const info = await lookupBookByIsbn(isbn);
  if (!info) {
    return { ok: false, error: "書誌情報が見つかりませんでした。" };
  }

  await db
    .insert(books)
    .values({
      isbn: info.isbn,
      title: info.title,
      authors: info.authors,
      publisher: info.publisher,
      pageCount: info.pageCount,
      coverUrl: info.coverUrl,
      source: info.source,
    })
    .onConflictDoUpdate({
      target: books.isbn,
      set: {
        title: info.title,
        authors: info.authors,
        publisher: info.publisher,
        pageCount: info.pageCount,
        coverUrl: info.coverUrl,
        source: info.source,
        updatedAt: new Date(),
      },
    });

  const existing = await db
    .select({ id: readingLogs.id })
    .from(readingLogs)
    .where(
      and(eq(readingLogs.isbn, info.isbn), eq(readingLogs.userId, userId)),
    )
    .limit(1);

  if (existing.length === 0) {
    await db.insert(readingLogs).values({
      userId,
      isbn: info.isbn,
      status: "want_to_read",
    });
  }

  revalidatePath("/books");
  redirect(`/books/${info.isbn}`);
}
