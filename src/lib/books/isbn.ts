/**
 * ISBN を 13 桁の数字列に正規化する。
 * - ハイフン/空白を除去
 * - ISBN-10 を ISBN-13 (978 prefix) へ変換
 * - チェックサム検証
 * 不正な入力は null を返す。
 */
export function normalizeIsbn(input: string): string | null {
  const cleaned = input.replace(/[\s-]/g, "").toUpperCase();

  if (/^\d{13}$/.test(cleaned)) {
    return validateIsbn13(cleaned) ? cleaned : null;
  }

  if (/^\d{9}[\dX]$/.test(cleaned)) {
    if (!validateIsbn10(cleaned)) return null;
    return convertIsbn10To13(cleaned);
  }

  return null;
}

function validateIsbn10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(isbn[i]) * (10 - i);
  }
  const last = isbn[9] === "X" ? 10 : Number(isbn[9]);
  sum += last;
  return sum % 11 === 0;
}

function validateIsbn13(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = Number(isbn[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return sum % 10 === 0;
}

function convertIsbn10To13(isbn10: string): string {
  const base = "978" + isbn10.slice(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = Number(base[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return base + checkDigit;
}
