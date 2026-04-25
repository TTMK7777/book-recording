// Kindle Webノートブック (read.amazon.co.jp/notebook) からハイライト/メモを抽出するブックマークレット
// 使い方:
//   1. read.amazon.co.jp/notebook を開いてサインインする
//   2. このファイル全体をコピーして minify ツールで 1行化し、先頭に javascript: を付けてブックマークに登録
//   3. ノートブック画面でブックマークをクリック
//   4. プロンプトでモード選択 → 完了後 JSON ファイルがダウンロードされる
//
// 注意: read.amazon.co.jp の DOM 構造は予告なく変わるため、
//       最初は「1: 現在表示中の書籍のみ」モードで構造調査してから全件取得を推奨

(async () => {
  // フェイルセーフ: read.amazon.* 以外で実行された場合は何もしない
  if (!/^https?:\/\/read\.amazon\.(co\.jp|com)\//i.test(location.href)) {
    alert(
      "このブックマークレットは read.amazon.co.jp/notebook (または .com) で実行してください。",
    );
    return;
  }

  const SOURCE = "amazon-notebook";
  const SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  function extractColor(el) {
    if (!el) return undefined;
    const cls = el.className || "";
    const m = cls.match(/kp-notebook-highlight-(yellow|blue|pink|orange)/);
    return m ? m[1] : undefined;
  }

  function scanCurrentBook() {
    const annotationsContainer = $("#kp-notebook-annotations");
    if (!annotationsContainer) {
      return null;
    }

    // 書誌情報（ヘッダ部）
    const titleEl =
      $("h3.kp-notebook-metadata") ||
      $(".kp-notebook-metadata h3") ||
      $("h3.a-spacing-top-small");
    const authorEl =
      $(".kp-notebook-metadata .a-color-secondary") ||
      $("p.a-spacing-none.a-spacing-top-mini");
    const coverEl =
      $("img.kp-notebook-cover-image-border") || $(".kp-notebook-cover-image");
    const asinInput = $('input[name="asin"]');
    const asin = asinInput?.value || undefined;

    // ハイライトカード
    const cards = $$('div[id^="highlight-"]', annotationsContainer);
    const highlights = cards
      .map((card) => {
        const textEl =
          $("#highlight", card) ||
          $("span.kp-notebook-highlight", card) ||
          $("span.a-color-base.kp-notebook-selectable", card);
        const noteEl = $("#note", card) || $("span.kp-notebook-note", card);
        const locationEl =
          $("#kp-annotation-location", card) ||
          $(".kp-notebook-metadata", card);
        const colorTarget = $("span.kp-notebook-highlight", card) || textEl;
        const text = (textEl?.innerText || "").trim();
        if (!text) return null;
        const note = (noteEl?.innerText || "").trim();
        const location = (locationEl?.innerText || "").trim();
        const color = extractColor(colorTarget);
        return {
          text,
          ...(note ? { note } : {}),
          ...(location ? { location } : {}),
          ...(color ? { color } : {}),
        };
      })
      .filter(Boolean);

    return {
      ...(asin ? { asin } : {}),
      title: (titleEl?.innerText || "(unknown)").trim(),
      ...(authorEl ? { author: authorEl.innerText.trim() } : {}),
      ...(coverEl?.src ? { cover_url: coverEl.src } : {}),
      highlights,
    };
  }

  async function scanAllBooks() {
    const cards = $$(".kp-notebook-library-each-book");
    if (cards.length === 0) {
      alert(
        "書籍リストが見つかりません。read.amazon.co.jp/notebook を開いてから実行してください。",
      );
      return null;
    }
    const out = [];
    for (let i = 0; i < cards.length; i++) {
      cards[i].click();
      // ハイライト領域のロード待ち（保守的に 1.2 秒）
      await SLEEP(1200);
      const scanned = scanCurrentBook();
      if (scanned) {
        out.push(scanned);
            console.log(
          `[${i + 1}/${cards.length}] ${scanned.title} - ${
            scanned.highlights.length
          } highlights`,
        );
      }
    }
    return out;
  }

  const mode = prompt(
    "モードを選んでください:\n  1: 現在表示中の書籍のみ (構造調査用)\n  2: 全書籍 (時間がかかります)",
    "1",
  );
  if (mode !== "1" && mode !== "2") return;

  const books = mode === "1" ? [scanCurrentBook()].filter(Boolean) : await scanAllBooks();
  if (!books || books.length === 0) {
    alert(
      "取得できませんでした。書籍を選択してハイライトが表示された状態で再実行してください。",
    );
    return;
  }

  const payload = {
    source: SOURCE,
    exported_at: new Date().toISOString(),
    books,
  };
  const json = JSON.stringify(payload, null, 2);
  console.log(payload);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kindle-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  alert(`完了: ${books.length} 冊取得しました。JSON ファイルをダウンロードしました。`);
})();
