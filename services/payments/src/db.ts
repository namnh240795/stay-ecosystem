import { drizzle } from "drizzle-orm/d1";

export function createDb(env: { PAYMENTS_DB: D1Database }) {
  return drizzle(env.PAYMENTS_DB);
}

export type DB = ReturnType<typeof createDb>;
