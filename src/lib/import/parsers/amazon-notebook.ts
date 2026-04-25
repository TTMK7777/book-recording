import { z } from "zod";
import {
  ImportPayloadSchema,
  ImportedBookSchema,
  type ImportPayload,
  type ImportedBook,
} from "../types";

export type ParseWarning = {
  bookIndex: number;
  asin?: string;
  title?: string;
  reason: string;
};

export type LenientParseResult = {
  payload: ImportPayload;
  skipped: ParseWarning[];
};

// 厳格モード: 1箇所でも壊れていれば全体を reject。zod のエラーをそのまま投げる
export function parseAmazonNotebookStrict(input: unknown): ImportPayload {
  return ImportPayloadSchema.parse(input);
}

// 寛容モード: 壊れた書籍だけ skip して残りを通す。/import 画面で使う想定
export function parseAmazonNotebookLenient(input: unknown): LenientParseResult {
  const envelope = z
    .object({
      source: z.literal("amazon-notebook"),
      exported_at: z.string().datetime(),
      books: z.array(z.unknown()),
    })
    .parse(input);

  const skipped: ParseWarning[] = [];
  const goodBooks: ImportedBook[] = [];

  envelope.books.forEach((rawBook, index) => {
    const result = ImportedBookSchema.safeParse(rawBook);
    if (result.success) {
      goodBooks.push(result.data);
      return;
    }
    const probe =
      typeof rawBook === "object" && rawBook !== null
        ? (rawBook as Record<string, unknown>)
        : {};
    skipped.push({
      bookIndex: index,
      asin: typeof probe.asin === "string" ? probe.asin : undefined,
      title: typeof probe.title === "string" ? probe.title : undefined,
      reason: result.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    });
  });

  return {
    payload: {
      source: "amazon-notebook",
      exported_at: envelope.exported_at,
      books: goodBooks,
    },
    skipped,
  };
}

// "位置 No.1234" / "Location 1234" / "ページ 56" / "Page 56" → 数値抽出
// 取れない場合は undefined。表示用の生文字列は別途 location フィールドに残す
export function extractLocationNumber(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const match = raw.match(/(\d[\d,]*)/);
  if (!match) return undefined;
  const n = Number(match[1].replace(/,/g, ""));
  return Number.isFinite(n) ? n : undefined;
}
