import { drizzle } from "drizzle-orm/d1";

export function createDb(env: { USERS_DB: D1Database }) {
  return drizzle(env.USERS_DB);
}

export type DB = ReturnType<typeof createDb>;
