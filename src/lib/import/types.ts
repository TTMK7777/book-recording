import { z } from "zod";

export const ImportSourceSchema = z.enum([
  "amazon-notebook",
  "my-clippings",
  "kindle-email",
]);
export type ImportSource = z.infer<typeof ImportSourceSchema>;

export const HighlightColorSchema = z.enum(["yellow", "blue", "pink", "orange"]);
export type HighlightColor = z.infer<typeof HighlightColorSchema>;

// http(s) 限定 + 長さ制限 (data:/javascript: URI を弾く)
const SafeHttpUrlSchema = z
  .string()
  .url()
  .refine((s) => /^https?:\/\//i.test(s), {
    message: "URL must start with http:// or https://",
  })
  .refine((s) => s.length <= 2048, { message: "URL too long (max 2048)" });

// ASIN: 10文字英数大文字 (例: B0XXXXXXXX, 4XXXXXXXXX)
const AsinSchema = z.string().regex(/^[A-Z0-9]{10}$/);

// ISBN-10 / ISBN-13 (どちらも10/13桁、ISBN-10 末尾は X 許容)
const IsbnSchema = z.string().regex(/^(?:97[89])?\d{9}[\dX]$/);

export const ImportedHighlightSchema = z.object({
  text: z.string().min(1).max(10_000),
  location: z.string().max(100).optional(),
  note: z.string().max(2_000).optional(),
  color: HighlightColorSchema.optional(),
  highlighted_at: z.string().datetime().optional(),
});
export type ImportedHighlight = z.infer<typeof ImportedHighlightSchema>;

export const ImportedBookSchema = z.object({
  asin: AsinSchema.optional(),
  isbn: IsbnSchema.optional(),
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(200).optional(),
  cover_url: SafeHttpUrlSchema.optional(),
  highlights: z.array(ImportedHighlightSchema).max(10_000).default([]),
});
export type ImportedBook = z.infer<typeof ImportedBookSchema>;

export const ImportPayloadSchema = z.object({
  source: ImportSourceSchema,
  exported_at: z.string().datetime(),
  books: z.array(ImportedBookSchema).max(10_000),
});
export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
