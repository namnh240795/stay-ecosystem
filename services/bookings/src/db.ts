import { drizzle } from "drizzle-orm/d1";

export function createDb(env: { BOOKINGS_DB: D1Database }) {
  return drizzle(env.BOOKINGS_DB);
}

export type DB = ReturnType<typeof createDb>;
