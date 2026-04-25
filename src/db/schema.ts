import {
  boolean,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const books = pgTable("books", {
  isbn: text("isbn").primaryKey(),
  title: text("title").notNull(),
  authors: text("authors").array().notNull().default([]),
  publisher: text("publisher"),
  pageCount: integer("page_count"),
  coverUrl: text("cover_url"),
  source: text("source", { enum: ["openbd", "google", "manual"] })
    .notNull()
    .default("manual"),
  genreTags: text("genre_tags").array().notNull().default([]),
  examTags: text("exam_tags").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const readingLogs = pgTable("reading_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull(),
  isbn: text("isbn")
    .notNull()
    .references(() => books.isbn),
  status: text("status", {
    enum: ["want_to_read", "reading", "finished", "abandoned"],
  })
    .notNull()
    .default("reading"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  rating: smallint("rating"),
  reviewMd: text("review_md"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").primaryKey().defaultRandom(),
  readingLogId: uuid("reading_log_id")
    .notNull()
    .references(() => readingLogs.id, { onDelete: "cascade" }),
  location: text("location"),
  text: text("text").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Book = typeof books.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type ReadingLog = typeof readingLogs.$inferSelect;
export type NewReadingLog = typeof readingLogs.$inferInsert;
export type Highlight = typeof highlights.$inferSelect;
export type NewHighlight = typeof highlights.$inferInsert;
