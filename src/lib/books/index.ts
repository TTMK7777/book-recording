import { fetchFromGoogleBooks } from "./google-books";
import { normalizeIsbn } from "./isbn";
import { fetchFromOpenBd } from "./openbd";
import type { BookInfo } from "./types";

export { normalizeIsbn } from "./isbn";
export type { BookInfo, BookSource } from "./types";

/**
 * ISBN から書誌情報を取得する。
 * 和書カバレッジを優先するため openBD を先に試し、見つからなければ Google Books に fallback する。
 */
export async function lookupBookByIsbn(
  rawIsbn: string,
): Promise<BookInfo | null> {
  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) return null;

  const fromOpenBd = await fetchFromOpenBd(isbn).catch(() => null);
  if (fromOpenBd) return fromOpenBd;

  const fromGoogle = await fetchFromGoogleBooks(isbn).catch(() => null);
  return fromGoogle;
}
