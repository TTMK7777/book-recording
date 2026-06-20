import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  parseMyClippingsStrict,
  parseMyClippingsLenient,
  parseJapaneseDatetime,
  extractLocationString,
  extractLocationNumber,
} from "@/lib/import/parsers/my-clippings";
import { ImportPayloadSchema } from "@/lib/import/types";

const EXPORTED_AT = "2026-06-20T00:00:00.000Z";

const fixturesDir = path.resolve(__dirname, "../../../fixtures");
const validText = readFileSync(
  path.join(fixturesDir, "my-clippings-valid.txt"),
  "utf-8",
);
const brokenText = readFileSync(
  path.join(fixturesDir, "my-clippings-broken.txt"),
  "utf-8",
);

function book(payload: ReturnType<typeof parseMyClippingsLenient>["payload"], title: string) {
  return payload.books.find((b) => b.title === title);
}

describe("parseMyClippingsLenient - 正常系", () => {
  it("payload は source=my-clippings / exported_at=引数 で Zod を通る", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    expect(payload.source).toBe("my-clippings");
    expect(payload.exported_at).toBe(EXPORTED_AT);
    expect(() => ImportPayloadSchema.parse(payload)).not.toThrow();
  });

  it("正常なハイライトの text/location/highlighted_at を保持する", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "嫌われる勇気");
    expect(b).toBeDefined();
    const h = b!.highlights.find((x) =>
      x.text.startsWith("「経験それ自体」"),
    );
    expect(h).toBeDefined();
    expect(h!.location).toBe("位置No. 295-296");
    // JST 22:53:55 → UTC 13:53:55
    expect(h!.highlighted_at).toBe("2023-09-04T13:53:55.000Z");
  });
});

describe("BOM 正規化で同一本に集約", () => {
  it("BOM 有無に関わらず『嫌われる勇気』は1冊にまとまる", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const matches = payload.books.filter((b) => b.title === "嫌われる勇気");
    expect(matches).toHaveLength(1);
    // タイトルに BOM が混入していないこと
    expect(matches[0].title.charCodeAt(0)).not.toBe(0xfeff);
  });
});

describe("ブックマーク skip", () => {
  it("ブックマークは skip され reason=bookmark で記録", () => {
    const { skipped } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const bm = skipped.filter((s) => s.reason === "bookmark");
    expect(bm).toHaveLength(1);
  });
});

describe("截断 / 空 skip", () => {
  it("截断マーカーを含む本文は skip / reason=truncated", () => {
    const { skipped } = parseMyClippingsLenient(validText, EXPORTED_AT);
    expect(skipped.some((s) => s.reason === "truncated")).toBe(true);
  });
  it("空本文のハイライトは skip / reason=empty", () => {
    const { skipped } = parseMyClippingsLenient(validText, EXPORTED_AT);
    expect(skipped.some((s) => s.reason === "empty")).toBe(true);
  });
});

describe("複数行本文", () => {
  it("8行超の本文を \\n 結合し末尾空行を rstrip する", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "運のいい人の法則 (角川文庫)");
    expect(b).toBeDefined();
    const h = b!.highlights.find((x) => x.text.startsWith("L1"));
    expect(h).toBeDefined();
    expect(h!.text).toBe("L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8");
    expect(h!.text.split("\n")).toHaveLength(8);
  });
});

describe("著者抽出", () => {
  it("半角括弧が複数なら最後の1つを著者に (中間レーベルは title に残す)", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "2050年のメディア (文春e-book)");
    expect(b).toBeDefined();
    expect(b!.author).toBe("下山 進");
  });

  it("全角（）のみは著者にせず title に残す", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "正欲（新潮文庫）");
    expect(b).toBeDefined();
    expect(b!.author).toBe("朝井リョウ");
  });

  it("括弧なし (BCG系) は author=undefined / 末尾空白も trim", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "BCGが読む経営の論点2026");
    expect(b).toBeDefined();
    expect(b!.author).toBeUndefined();
    expect(b!.title).toBe("BCGが読む経営の論点2026"); // 末尾の半角スペース除去済み
  });
});

describe("parseJapaneseDatetime", () => {
  it("可変桁 (非0埋め) をパースし JST→UTC(Z) ISO8601 化", () => {
    // JST 22:53:55 → UTC 13:53:55
    expect(parseJapaneseDatetime("2023年9月4日月曜日 22:53:55")).toBe(
      "2023-09-04T13:53:55.000Z",
    );
    // JST 翌 0:37:52 → 前日 UTC 15:37:52
    expect(parseJapaneseDatetime("2026年1月2日金曜日 0:37:52")).toBe(
      "2026-01-01T15:37:52.000Z",
    );
    // JST 8:05:24 → 前日 UTC 23:05:24
    expect(parseJapaneseDatetime("2023年9月5日火曜日 8:05:24")).toBe(
      "2023-09-04T23:05:24.000Z",
    );
  });

  it("生成した ISO 文字列は Zod datetime() を通る", () => {
    const iso = parseJapaneseDatetime("2024年2月14日水曜日 6:05:09");
    expect(iso).toBeDefined();
    const schema = ImportPayloadSchema.shape.exported_at;
    // datetime() with offset
    expect(() => schema.parse(iso)).not.toThrow();
  });

  it("不正な日付 (13月/40日/99時) は undefined", () => {
    expect(parseJapaneseDatetime("2024年13月40日水曜日 99:99:99")).toBeUndefined();
  });
  it("空文字 / 無関係文字列は undefined", () => {
    expect(parseJapaneseDatetime("")).toBeUndefined();
    expect(parseJapaneseDatetime("作成日不明")).toBeUndefined();
  });

  it("日付パース失敗でも text があれば skip しない (highlighted_at だけ欠落)", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "BCGが読む経営の論点2026");
    const h = b!.highlights.find((x) => x.text === "壊れた日付でも本文は残る");
    expect(h).toBeDefined();
    expect(h!.highlighted_at).toBeUndefined();
  });
});

describe("位置No. スペース揺れ", () => {
  it.each([
    ["- 26ページ|位置No. 295-296のハイライト", "位置No. 295-296"],
    ["- 位置 No. 37のブックマーク", "位置No. 37"],
    ["- 位置 No.  300-305のハイライト", "位置No. 300-305"],
    ["- 96ページ|位置No. 1049のメモ", "位置No. 1049"],
  ])("%s → %s", (input, expected) => {
    expect(extractLocationString(input)).toBe(expected);
  });

  it("extractLocationNumber は範囲の開始値を返す", () => {
    expect(extractLocationNumber("位置No. 295-296")).toBe(295);
    expect(extractLocationNumber("位置No. 1049")).toBe(1049);
    expect(extractLocationNumber(undefined)).toBeUndefined();
  });
});

describe("メモを独立ハイライト化", () => {
  it("メモは text を持つ ImportedHighlight として通る", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(
      payload,
      "そのビジネス課題、最新の経済学で「すでに解決」しています。",
    );
    expect(b).toBeDefined();
    const h = b!.highlights.find((x) => x.text === "わわわ");
    expect(h).toBeDefined();
    expect(h!.location).toBe("位置No. 1049");
  });
});

describe("保守的 dedup", () => {
  it("同一 book 内で text 完全一致は1件に統合し dedupRemoved を集計", () => {
    const { payload, dedupRemoved } = parseMyClippingsLenient(
      validText,
      EXPORTED_AT,
    );
    const b = book(payload, "嫌われる勇気");
    const exact = b!.highlights.filter(
      (x) =>
        x.text ===
        "「経験それ自体」ではなく、「経験に与える意味」によって自らを決定する",
    );
    expect(exact).toHaveLength(1); // 重複は1件に
    expect(dedupRemoved).toBeGreaterThanOrEqual(1);
  });

  it("near-duplicate (text が微妙に違う) は両方保持する", () => {
    const { payload } = parseMyClippingsLenient(validText, EXPORTED_AT);
    const b = book(payload, "嫌われる勇気");
    const near = b!.highlights.filter((x) =>
      x.text.startsWith("「経験それ自体」ではなく"),
    );
    // 完全一致版1件 + 末尾「。」付き near-dup 1件 = 2件
    expect(near.length).toBe(2);
  });
});

describe("envelope 致命エラー", () => {
  it("delimiter 皆無のテキストは Error throw (lenient)", () => {
    expect(() => parseMyClippingsLenient(brokenText, EXPORTED_AT)).toThrow();
  });
  it("delimiter 皆無のテキストは Error throw (strict)", () => {
    expect(() => parseMyClippingsStrict(brokenText, EXPORTED_AT)).toThrow();
  });
});

describe("parseMyClippingsStrict", () => {
  it("skip 対象 (bookmark/truncated/empty) を含むと全体 reject", () => {
    expect(() => parseMyClippingsStrict(validText, EXPORTED_AT)).toThrow();
  });

  it("skip 対象が皆無なら ImportPayload を返す", () => {
    const clean = [
      "嫌われる勇気 (岸見 一郎)",
      "- 26ページ|位置No. 295-296のハイライト |作成日: 2023年9月4日月曜日 22:53:55",
      "",
      "クリーンな本文",
      "==========",
      "",
    ].join("\r\n");
    const payload = parseMyClippingsStrict(clean, EXPORTED_AT);
    expect(payload.source).toBe("my-clippings");
    expect(payload.books).toHaveLength(1);
    expect(payload.books[0].title).toBe("嫌われる勇気");
    expect(payload.books[0].author).toBe("岸見 一郎");
    expect(payload.books[0].highlights[0].text).toBe("クリーンな本文");
  });
});
