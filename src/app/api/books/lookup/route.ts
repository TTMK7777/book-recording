import type { NextRequest } from "next/server";

import { lookupBookByIsbn, normalizeIsbn } from "@/lib/books";

export async function GET(request: NextRequest) {
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
