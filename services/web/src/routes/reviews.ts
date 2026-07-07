import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureReviewTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      target_id TEXT NOT NULL,
      target_name TEXT,
      guest_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).run();
}

// ============================
// REVIEW ROUTES
// ============================

// GET /reviews - List reviews with filters and pagination
app.get("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureReviewTable(db);

  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const targetId = c.req.query("targetId");

  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (targetId) {
    where += " AND target_id = ?";
    params.push(targetId);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM reviews ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM reviews ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results,
    total: countResult?.total ?? 0,
    page,
    limit,
  });
});

// POST /reviews - Create a review
app.post("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureReviewTable(db);

  const body = await c.req.json<{
    targetId: string;
    targetName?: string;
    guestName: string;
    rating: number;
    comment?: string;
  }>();

  if (body.rating < 1 || body.rating > 5) {
    return c.json({ error: "Rating must be between 1 and 5" }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO reviews (id, target_id, target_name, guest_name, rating, comment, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      body.targetId,
      body.targetName ?? null,
      body.guestName,
      body.rating,
      body.comment ?? null,
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      targetId: body.targetId,
      targetName: body.targetName ?? null,
      guestName: body.guestName,
      rating: body.rating,
      comment: body.comment ?? null,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

export default app;
