import type { BookInfo } from "./types";

type GoogleBooksVolume = {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publisher?: string;
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{ type: string; identifier: string }>;
  };
};

type GoogleBooksResponse = {
  totalItems: number;
  items?: GoogleBooksVolume[];
};

const ENDPOINT = "https://www.googleapis.com/books/v1/volumes";

export async function fetchFromGoogleBooks(
  isbn: string,
): Promise<BookInfo | null> {
  const params = new URLSearchParams({ q: `isbn:${isbn}` });
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (apiKey) params.set("key", apiKey);

  const res = await fetch(`${ENDPOINT}?${params.toString()}`, {
    next: { revalidate: 60 * 60 * 24 },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as GoogleBooksResponse;
  const item = data.items?.[0]?.volumeInfo;
  if (!item || !item.title) return null;

  const cover = item.imageLinks?.thumbnail ?? item.imageLinks?.smallThumbnail;

  return {
    isbn,
    title: item.title,
    authors: item.authors ?? [],
    publisher: item.publisher,
    pageCount: item.pageCount,
    // Validate scheme before http→https upgrade to reject data:/javascript: URIs (Issue #24 M-3)
    coverUrl: cover && /^https?:\/\//i.test(cover)
      ? cover.replace(/^http:\/\//, "https://")
      : undefined,
    source: "google",
  };
}
