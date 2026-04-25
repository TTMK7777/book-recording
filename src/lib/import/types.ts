import { z } from "zod";

export const ImportSourceSchema = z.enum([
  "amazon-notebook",
  "my-clippings",
  "kindle-email",
]);
export type ImportSource = z.infer<typeof ImportSourceSchema>;

export const HighlightColorSchema = z.enum(["yellow", "blue", "pink", "orange"]);
export type HighlightColor = z.infer<typeof HighlightColorSchema>;

export const ImportedHighlightSchema = z.object({
  text: z.string().min(1),
  location: z.string().optional(),
  note: z.string().optional(),
  color: HighlightColorSchema.optional(),
  highlighted_at: z.string().optional(),
});
export type ImportedHighlight = z.infer<typeof ImportedHighlightSchema>;

export const ImportedBookSchema = z.object({
  asin: z.string().optional(),
  isbn: z.string().optional(),
  title: z.string().min(1),
  author: z.string().optional(),
  cover_url: z.string().url().optional(),
  highlights: z.array(ImportedHighlightSchema).default([]),
});
export type ImportedBook = z.infer<typeof ImportedBookSchema>;

export const ImportPayloadSchema = z.object({
  source: ImportSourceSchema,
  exported_at: z.string(),
  books: z.array(ImportedBookSchema),
});
export type ImportPayload = z.infer<typeof ImportPayloadSchema>;
