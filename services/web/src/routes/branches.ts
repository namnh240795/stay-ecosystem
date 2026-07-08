import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureBranchTable(db: D1Database) {
  await db.prepare("CREATE TABLE IF NOT EXISTS branches (branches_id TEXT PRIMARY KEY, branches_name TEXT NOT NULL, branches_brand TEXT, branches_location TEXT, branches_address TEXT, branches_phone TEXT, branches_email TEXT, branches_description TEXT, branches_image_url TEXT, branches_is_active INTEGER NOT NULL DEFAULT 1, branches_created_at TEXT NOT NULL DEFAULT (datetime('now')), branches_updated_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
}

// ============================
// BRANCH ROUTES
// ============================

// GET /branches - List branches with filters and pagination
app.get("/", async (c) => {
  const db = c.env.BRANCHES_DB;
  await ensureBranchTable(db);

  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const location = c.req.query("location");
  const brand = c.req.query("brand");
  const search = c.req.query("search");

  const offset = (page - 1) * limit;

  let where = "WHERE branches_is_active = 1";
  const params: any[] = [];

  if (location) {
    where += " AND branches_location = ?";
    params.push(location);
  }
  if (brand) {
    where += " AND branches_brand = ?";
    params.push(brand);
  }
  if (search) {
    where += " AND (branches_name LIKE ? OR branches_description LIKE ? OR branches_address LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM branches ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM branches ${where} ORDER BY branches_created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results,
    total: countResult?.total ?? 0,
    page,
    limit,
  });
});

// GET /branches/:id - Get single branch
app.get("/:id", async (c) => {
  const db = c.env.BRANCHES_DB;
  await ensureBranchTable(db);

  const id = c.req.param("id");

  const branch = await db
    .prepare("SELECT * FROM branches WHERE branches_id = ?")
    .bind(id)
    .first();

  if (!branch) {
    return c.json({ error: "Branch not found" }, 404);
  }

  return c.json(branch);
});

export default app;
