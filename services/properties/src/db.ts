import { drizzle } from "drizzle-orm/d1";

export function createDb(env: { PROPERTIES_DB: D1Database }) {
  return drizzle(env.PROPERTIES_DB);
}

export type DB = ReturnType<typeof createDb>;
