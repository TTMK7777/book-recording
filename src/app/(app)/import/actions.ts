"use server";

import { parseAmazonNotebookLenient } from "@/lib/import/parsers/amazon-notebook";
import { parseMyClippingsLenient } from "@/lib/import/parsers/my-clippings";
import type { ImportSource } from "@/lib/import/types";

export type ImportResult = {
  ok: boolean;
  imported: number;
  skipped: number;
  mock?: boolean;
  message: string;
};

export type ImportClippingsInput = {
  /** ファイル本文 (my-clippings は .txt 文字列、amazon-notebook は JSON 文字列)。 */
  fileText: string;
  /** 取り込み元の形式。クライアントのプレビューは信頼せずサーバーで正とする。 */
  source: ImportSource;
  /** my-clippings の書き出し日時 (ISO8601)。未指定なら現在時刻を使う。 */
  exportedAt?: string;
};

// サーバー側で改めてパースし、book 数 / highlight 数 / skip 数を集計する。
// クライアントのプレビュー結果は信頼せず、ここで再パースした値を正とする。
function reparse(input: ImportClippingsInput): {
  books: number;
  highlights: number;
  skipped: number;
} {
  const { fileText, source } = input;

  if (source === "my-clippings") {
    const exportedAt = input.exportedAt ?? new Date().toISOString();
    const { payload, skipped } = parseMyClippingsLenient(fileText, exportedAt);
    const highlights = payload.books.reduce(
      (sum, b) => sum + b.highlights.length,
      0,
    );
    return { books: payload.books.length, highlights, skipped: skipped.length };
  }

  if (source === "amazon-notebook") {
    // amazon-notebook は JSON 文字列。パース失敗は呼び出し側で catch する。
    const json: unknown = JSON.parse(fileText);
    const { payload, skipped } = parseAmazonNotebookLenient(json);
    const highlights = payload.books.reduce(
      (sum, b) => sum + b.highlights.length,
      0,
    );
    return { books: payload.books.length, highlights, skipped: skipped.length };
  }

  // kindle-email は本フォーム未対応 (ImportSource には含まれるが UI からは渡さない)。
  throw new Error(`未対応の取り込み元です: ${source}`);
}

/**
 * Kindle ハイライトの取り込みアクション。
 *
 * 現状は DATABASE_URL 未設定 (Supabase 未接続) を前提に、サーバーで再パースした
 * 集計値だけを返すモック実装。DB への永続化は Supabase 接続後に実装する。
 */
export async function importClippings(
  input: ImportClippingsInput,
): Promise<ImportResult> {
  let parsed: { books: number; highlights: number; skipped: number };
  try {
    parsed = reparse(input);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "取り込みに失敗しました。";
    return { ok: false, imported: 0, skipped: 0, message };
  }

  const imported = parsed.highlights;

  // DATABASE_URL が無ければモック応答 (プレビューのみ)。
  if (!process.env.DATABASE_URL) {
    return {
      ok: true,
      imported,
      skipped: parsed.skipped,
      mock: true,
      message: `プレビューのみ(DB未接続): ${parsed.books}冊・${imported}件を取り込み対象として確認しました。`,
    };
  }

  // TODO: Supabase 接続後に requireUserId() で認証必須化し、ここで本実装する。
  // TODO: Supabase 接続後に実装
  //   - requireUserId() で userId を取得
  //   - books / highlights テーブルへ upsert (onConflictDoUpdate)
  //   - revalidatePath("/books") 等で一覧を更新
  // 現状は型を通すためのスタブ。DATABASE_URL があっても永続化はまだ行わない。
  return {
    ok: true,
    imported,
    skipped: parsed.skipped,
    message: `${parsed.books}冊・${imported}件の取り込みを受け付けました。(DB保存は未実装)`,
  };
}
