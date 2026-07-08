import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureApartmentTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS web_apartments (
      web_apartments_id TEXT PRIMARY KEY,
      web_apartments_name TEXT NOT NULL,
      web_apartments_branch_id TEXT,
      web_apartments_branch_name TEXT,
      web_apartments_type TEXT,
      web_apartments_location TEXT,
      web_apartments_address TEXT,
      web_apartments_description TEXT,
      web_apartments_image_url TEXT,
      web_apartments_images TEXT,
      web_apartments_price_per_night REAL NOT NULL DEFAULT 0,
      web_apartments_max_guests INTEGER NOT NULL DEFAULT 2,
      web_apartments_bedrooms INTEGER NOT NULL DEFAULT 1,
      web_apartments_bathrooms INTEGER NOT NULL DEFAULT 1,
      web_apartments_pet_friendly INTEGER NOT NULL DEFAULT 0,
      web_apartments_has_virtual_tour INTEGER NOT NULL DEFAULT 0,
      web_apartments_virtual_tour_url TEXT,
      web_apartments_amenities TEXT,
      web_apartments_is_active INTEGER NOT NULL DEFAULT 1,
      web_apartments_created_at TEXT NOT NULL DEFAULT (datetime('now')),
      web_apartments_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).run();
}

// ============================
// APARTMENT ROUTES
// ============================

// GET /apartments - List apartments with filters and pagination
app.get("/", async (c) => {
  const db = c.env.APARTMENTS_DB;
  await ensureApartmentTable(db);

  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const location = c.req.query("location");
  const type = c.req.query("type");
  const minPrice = c.req.query("minPrice");
  const maxPrice = c.req.query("maxPrice");
  const petFriendly = c.req.query("petFriendly");
  const hasVirtualTour = c.req.query("hasVirtualTour");
  const search = c.req.query("search");

  const offset = (page - 1) * limit;

  let where = "WHERE web_apartments_is_active = 1";
  const params: any[] = [];

  if (location) {
    where += " AND web_apartments_location = ?";
    params.push(location);
  }
  if (type) {
    where += " AND web_apartments_type = ?";
    params.push(type);
  }
  if (minPrice) {
    where += " AND web_apartments_price_per_night >= ?";
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where += " AND web_apartments_price_per_night <= ?";
    params.push(Number(maxPrice));
  }
  if (petFriendly === "true") {
    where += " AND web_apartments_pet_friendly = 1";
  }
  if (hasVirtualTour === "true") {
    where += " AND web_apartments_has_virtual_tour = 1";
  }
  if (search) {
    where += " AND (web_apartments_name LIKE ? OR web_apartments_description LIKE ? OR web_apartments_branch_name LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM web_apartments ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM web_apartments ${where} ORDER BY web_apartments_created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results,
    total: countResult?.total ?? 0,
    page,
    limit,
  });
});

// GET /apartments/:id - Get single apartment
app.get("/:id", async (c) => {
  const db = c.env.APARTMENTS_DB;
  await ensureApartmentTable(db);

  const id = c.req.param("id");

  const apartment = await db
    .prepare("SELECT * FROM web_apartments WHERE web_apartments_id = ?")
    .bind(id)
    .first();

  if (!apartment) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  // Parse JSON fields
  const parsed = {
    ...apartment,
    web_apartments_images: apartment.web_apartments_images ? JSON.parse(apartment.web_apartments_images as string) : null,
    web_apartments_amenities: apartment.web_apartments_amenities ? JSON.parse(apartment.web_apartments_amenities as string) : null,
  };

  return c.json(parsed);
});

export default app;
