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
    CREATE TABLE IF NOT EXISTS apartments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      branch_id TEXT,
      branch_name TEXT,
      type TEXT,
      location TEXT,
      address TEXT,
      description TEXT,
      image_url TEXT,
      images TEXT,
      price_per_night REAL NOT NULL DEFAULT 0,
      max_guests INTEGER NOT NULL DEFAULT 2,
      bedrooms INTEGER NOT NULL DEFAULT 1,
      bathrooms INTEGER NOT NULL DEFAULT 1,
      pet_friendly INTEGER NOT NULL DEFAULT 0,
      has_virtual_tour INTEGER NOT NULL DEFAULT 0,
      virtual_tour_url TEXT,
      amenities TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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

  let where = "WHERE is_active = 1";
  const params: any[] = [];

  if (location) {
    where += " AND location = ?";
    params.push(location);
  }
  if (type) {
    where += " AND type = ?";
    params.push(type);
  }
  if (minPrice) {
    where += " AND price_per_night >= ?";
    params.push(Number(minPrice));
  }
  if (maxPrice) {
    where += " AND price_per_night <= ?";
    params.push(Number(maxPrice));
  }
  if (petFriendly === "true") {
    where += " AND pet_friendly = 1";
  }
  if (hasVirtualTour === "true") {
    where += " AND has_virtual_tour = 1";
  }
  if (search) {
    where += " AND (name LIKE ? OR description LIKE ? OR branch_name LIKE ?)";
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM apartments ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM apartments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
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
    .prepare("SELECT * FROM apartments WHERE id = ?")
    .bind(id)
    .first();

  if (!apartment) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  // Parse JSON fields
  const parsed = {
    ...apartment,
    images: apartment.images ? JSON.parse(apartment.images as string) : null,
    amenities: apartment.amenities ? JSON.parse(apartment.amenities as string) : null,
  };

  return c.json(parsed);
});

export default app;
