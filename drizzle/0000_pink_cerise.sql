CREATE TABLE "books" (
	"isbn" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"authors" text[] DEFAULT '{}' NOT NULL,
	"publisher" text,
	"page_count" integer,
	"cover_url" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"genre_tags" text[] DEFAULT '{}' NOT NULL,
	"exam_tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "highlights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reading_log_id" uuid NOT NULL,
	"location" text,
	"text" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reading_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"isbn" text NOT NULL,
	"status" text DEFAULT 'reading' NOT NULL,
	"started_at" timestamp with time zone,
	"finished_at" timestamp with time zone,
	"rating" smallint,
	"review_md" text,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "highlights" ADD CONSTRAINT "highlights_reading_log_id_reading_logs_id_fk" FOREIGN KEY ("reading_log_id") REFERENCES "public"."reading_logs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_logs" ADD CONSTRAINT "reading_logs_isbn_books_isbn_fk" FOREIGN KEY ("isbn") REFERENCES "public"."books"("isbn") ON DELETE no action ON UPDATE no action;