import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleDb | undefined;

function init(): DrizzleDb {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. .env.local に Supabase Postgres の接続URLを設定してください。",
    );
  }
  const client = postgres(url, { prepare: false });
  return drizzle(client, { schema });
}

/**
 * Drizzle インスタンスへの遅延 Proxy。
 * モジュール import 時には接続を作らず、実際のメソッド呼び出し時に初期化する。
 * これにより `DATABASE_URL` 未設定でも import 段階で落ちないため、
 * 環境変数が無くてもビルド・lint が通る。
 */
export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    cached ??= init();
    return Reflect.get(cached, prop, receiver);
  },
});

export { schema };
