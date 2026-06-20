"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { readingLogs } from "@/db/schema";
import { requireUserId } from "@/lib/auth";

export type ReadingStatus =
  | "want_to_read"
  | "reading"
  | "finished"
  | "abandoned";

export type UpdateLogInput = {
  logId: string;
  isbn: string;
  status: ReadingStatus;
  rating: number | null;
  startedAt: string | null;
  finishedAt: string | null;
  reviewMd: string;
  isPublic: boolean;
};

export type UpdateLogResult = { ok: true } | { ok: false; error: string };

export async function updateReadingLog(
  input: UpdateLogInput,
): Promise<UpdateLogResult> {
  const userId = await requireUserId();

  if (input.rating != null && (input.rating < 1 || input.rating > 5)) {
    return { ok: false, error: "★は 1〜5 の範囲で指定してください。" };
  }

  await db
    .update(readingLogs)
    .set({
      status: input.status,
      rating: input.rating,
      startedAt: input.startedAt ? new Date(input.startedAt) : null,
      finishedAt: input.finishedAt ? new Date(input.finishedAt) : null,
      reviewMd: input.reviewMd,
      isPublic: input.isPublic,
      updatedAt: new Date(),
    })
    .where(
      and(eq(readingLogs.id, input.logId), eq(readingLogs.userId, userId)),
    );

  revalidatePath("/books");
  revalidatePath(`/books/${input.isbn}`);

  return { ok: true };
}
