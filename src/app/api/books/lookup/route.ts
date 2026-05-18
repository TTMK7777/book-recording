import type { NextRequest } from "next/server";

import { lookupBookByIsbn, normalizeIsbn } from "@/lib/books";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  // Require authentication to prevent GOOGLE_BOOKS_API_KEY quota abuse (Issue #24 M-2)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const rawIsbn = request.nextUrl.searchParams.get("isbn");
  if (!rawIsbn) {
    return Response.json({ error: "isbn is required" }, { status: 400 });
  }

  const isbn = normalizeIsbn(rawIsbn);
  if (!isbn) {
    return Response.json({ error: "invalid isbn" }, { status: 400 });
  }

  const book = await lookupBookByIsbn(isbn);
  if (!book) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  return Response.json(book);
}
