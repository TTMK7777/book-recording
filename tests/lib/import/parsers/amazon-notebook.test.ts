import { describe, it, expect } from "vitest";
import {
  parseAmazonNotebookStrict,
  parseAmazonNotebookLenient,
  extractLocationNumber,
} from "@/lib/import/parsers/amazon-notebook";
import validFixture from "../../../fixtures/amazon-notebook-valid.json";
import withBadBookFixture from "../../../fixtures/amazon-notebook-with-bad-book.json";
import maliciousCoverFixture from "../../../fixtures/amazon-notebook-malicious-cover.json";

describe("parseAmazonNotebookStrict", () => {
  it("正常な JSON をパースして ImportPayload を返す", () => {
    const result = parseAmazonNotebookStrict(validFixture);
    expect(result.source).toBe("amazon-notebook");
    expect(result.books).toHaveLength(2);
    expect(result.books[0].title).toBe("シン・ニホン");
    expect(result.books[0].highlights).toHaveLength(2);
  });

  it("data: URI が cover_url に含まれていれば例外を投げる", () => {
    expect(() => parseAmazonNotebookStrict(maliciousCoverFixture)).toThrow();
  });

  it("text が長さ上限 (10000) を超えると reject", () => {
    const huge = {
      source: "amazon-notebook",
      exported_at: "2026-04-26T00:00:00.000Z",
      books: [
        {
          asin: "B000000000",
          title: "huge",
          highlights: [{ text: "x".repeat(10_001) }],
        },
      ],
    };
    expect(() => parseAmazonNotebookStrict(huge)).toThrow();
  });

  it("source が想定外なら reject", () => {
    const bad = { ...validFixture, source: "unknown-source" };
    expect(() => parseAmazonNotebookStrict(bad)).toThrow();
  });

  it("exported_at が ISO8601 でなければ reject", () => {
    const bad = { ...validFixture, exported_at: "yesterday" };
    expect(() => parseAmazonNotebookStrict(bad)).toThrow();
  });
});

describe("parseAmazonNotebookLenient", () => {
  it("正常 JSON は skipped 0 で全件返す", () => {
    const { payload, skipped } = parseAmazonNotebookLenient(validFixture);
    expect(payload.books).toHaveLength(2);
    expect(skipped).toHaveLength(0);
  });

  it("壊れた書籍だけ skip し、残りを通す", () => {
    const { payload, skipped } = parseAmazonNotebookLenient(withBadBookFixture);
    expect(payload.books).toHaveLength(1);
    expect(payload.books[0].title).toBe("正常な書籍");
    expect(skipped).toHaveLength(2);
    expect(skipped[0].bookIndex).toBe(1);
    expect(skipped[0].asin).toBe("INVALID_ASIN_FORMAT");
    expect(skipped[1].bookIndex).toBe(2);
  });

  it("data: URI cover の書籍は skip 扱い", () => {
    const { payload, skipped } = parseAmazonNotebookLenient(maliciousCoverFixture);
    expect(payload.books).toHaveLength(0);
    expect(skipped).toHaveLength(1);
    expect(skipped[0].reason).toMatch(/cover_url/);
  });

  it("envelope そのものが壊れていれば例外を投げる (source 不正)", () => {
    expect(() =>
      parseAmazonNotebookLenient({ source: "x", exported_at: "x", books: [] }),
    ).toThrow();
  });
});

describe("extractLocationNumber", () => {
  it.each([
    ["位置 No.1234", 1234],
    ["位置 No.12,345", 12345],
    ["Location 567", 567],
    ["ページ 56", 56],
    ["Page 89", 89],
    ["", undefined],
    [undefined, undefined],
    ["なし", undefined],
  ])("%s → %s", (input, expected) => {
    expect(extractLocationNumber(input)).toBe(expected);
  });
});
