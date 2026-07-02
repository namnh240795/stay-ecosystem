import { drizzle } from "drizzle-orm/d1";

export function createDb(env: { REVIEWS_DB: D1Database }) {
  return drizzle(env.REVIEWS_DB);
}

export type DB = ReturnType<typeof createDb>;
