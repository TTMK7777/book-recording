export type BookSource = "openbd" | "google" | "manual";

export type BookInfo = {
  isbn: string;
  title: string;
  authors: string[];
  publisher?: string;
  pageCount?: number;
  coverUrl?: string;
  source: BookSource;
};
