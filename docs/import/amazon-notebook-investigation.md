# Amazon Notebook DOM 構造調査メモ

`public/bookmarklet/amazon-notebook.js` で使っているセレクタが実際の `read.amazon.co.jp/notebook` と合っているかを確認・記録するためのテンプレート。Amazon 側の DOM 構造は予告なく変わるため、ずれを見つけたら下表に記入してパーサ/ブックマークレットを直す。

## 想定セレクタ（実装時点）

| 用途 | セレクタ | 備考 |
|------|----------|------|
| ライブラリ書籍カード | `.kp-notebook-library-each-book` | 左ペインの書籍リスト 1件分 |
| ハイライト領域コンテナ | `#kp-notebook-annotations` | 右ペイン、書籍切替時に動的更新 |
| ハイライトカード | `div[id^="highlight-"]` | コンテナ内、1ハイライト＝1div |
| ハイライト本文 | `#highlight` / `span.kp-notebook-highlight` / `span.a-color-base.kp-notebook-selectable` | フォールバック順 |
| メモ本文 | `#note` / `span.kp-notebook-note` | フォールバック順 |
| 位置情報 | `#kp-annotation-location` / `.kp-notebook-metadata` | 「位置 No.1234」「ページ 56」など |
| ハイライト色 | `span.kp-notebook-highlight` の class 属性 | `kp-notebook-highlight-(yellow|blue|pink|orange)` |
| 書籍タイトル | `h3.kp-notebook-metadata` / `.kp-notebook-metadata h3` / `h3.a-spacing-top-small` | フォールバック順 |
| 著者 | `.kp-notebook-metadata .a-color-secondary` / `p.a-spacing-none.a-spacing-top-mini` | フォールバック順 |
| 表紙画像 | `img.kp-notebook-cover-image-border` / `.kp-notebook-cover-image` | `src` 属性を取得 |
| ASIN | `input[name="asin"]` の value | 隠し input |

## 確認手順（ユーザー操作）

1. **read.amazon.co.jp/notebook を Chrome で開いてサインイン**
2. 左ペインから 1冊書籍を選んで、ハイライトが右ペインに表示されるのを待つ
3. **F12 で DevTools を開く** → Elements タブ
4. 右ペインのハイライト 1つを右クリック → 「検証」で該当 DOM にジャンプ
5. 上表のセレクタが実物と合っているか確認
   - Console タブで `document.querySelectorAll('div[id^="highlight-"]').length` などを実行して一致個数を確かめる
6. ずれを見つけたら下の「ずれ報告」欄に追記

## ずれ報告

セレクタ別に「期待 vs 実物」を記録する。

| 日付 | 用途 | 期待セレクタ | 実物セレクタ | 補足 |
|------|------|--------------|--------------|------|
| (例) 2026-04-26 | (例) ハイライト本文 | `#highlight` | `span#highlight-text` | 子要素に変わっていた |
|  |  |  |  |  |

## 1冊スキャンしたときに期待される JSON

ブックマークレットを「1: 現在表示中の書籍のみ」モードで実行し、ダウンロードされた JSON を以下の構造と比較する。

```json
{
  "source": "amazon-notebook",
  "exported_at": "2026-04-26T12:00:00.000Z",
  "books": [
    {
      "asin": "B0XXXXXXXX",
      "title": "書籍タイトル",
      "author": "著者名",
      "cover_url": "https://m.media-amazon.com/.../cover.jpg",
      "highlights": [
        {
          "text": "ハイライトされた本文",
          "location": "位置 No.1234",
          "color": "yellow",
          "note": "(あれば) メモ本文"
        }
      ]
    }
  ]
}
```

確認ポイント:

- [ ] `asin` が空でない
- [ ] `title` が「(unknown)」でない
- [ ] `highlights` が 0件でない（書籍に実際にハイライトがあるなら）
- [ ] `text` に余計な改行や `Show more` などのUI文字列が含まれていない
- [ ] `color` が4色のいずれか（メモのみのカードは色なしでOK）

## 既知の制限

- **読了日 (`highlighted_at`)**: Webノートブックには表示されないため取得不可
- **位置情報の精度**: 「位置 No.1234」の生文字列。数値正規化はパーサ側で別途実施
- **複数アカウント対応**: ブックマークレットはサインイン中のアカウントのデータのみ取得
- **ライブラリ全件ロード**: 蔵書数が多い場合、左ペインのスクロールで遅延ロードされる項目がある可能性
  - 対策: 全書籍カードが DOM 上に存在するまでスクロールする処理を将来追加検討
