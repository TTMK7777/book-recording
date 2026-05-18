import type { BookInfo } from "./types";

type OpenBdSummary = {
  isbn: string;
  title: string;
  volume?: string;
  series?: string;
  publisher?: string;
  pubdate?: string;
  cover?: string;
  author?: string;
};

type OpenBdRecord = {
  summary: OpenBdSummary;
  onix?: {
    DescriptiveDetail?: {
      Extent?: Array<{ ExtentValue?: string; ExtentType?: string }>;
    };
  };
};

const OPENBD_ENDPOINT = "https://api.openbd.jp/v1/get";

export async function fetchFromOpenBd(isbn: string): Promise<BookInfo | null> {
  const url = `${OPENBD_ENDPOINT}?isbn=${encodeURIComponent(isbn)}`;
  const res = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as Array<OpenBdRecord | null>;
  const record = data?.[0];
  if (!record) return null;

  const { summary, onix } = record;
  const authors = summary.author
    ? summary.author.split("／").map((a) => a.trim()).filter(Boolean)
    : [];

  const pageExtent = onix?.DescriptiveDetail?.Extent?.find(
    (e) => e.ExtentType === "11",
  )?.ExtentValue;
  const pageCount = pageExtent ? Number(pageExtent) : undefined;

  return {
    isbn: summary.isbn,
    title: summary.title,
    authors,
    publisher: summary.publisher,
    pageCount: Number.isFinite(pageCount) ? pageCount : undefined,
    // Validate scheme to prevent data:/javascript: URI injection (Issue #24 M-3)
    coverUrl: summary.cover && /^https?:\/\//i.test(summary.cover)
      ? summary.cover
      : undefined,
    source: "openbd",
  };
}
