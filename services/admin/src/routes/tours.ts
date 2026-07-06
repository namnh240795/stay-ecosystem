import { Hono } from "hono";

type Env = { USERS_DB: D1Database; PROPERTIES_DB: D1Database; BOOKINGS_DB: D1Database; PAYMENTS_DB: D1Database };
const app = new Hono<{ Bindings: Env }>();

// ==================== TOURS ====================
app.get("/api/admin/tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (id TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT, image TEXT, price_per_slot INTEGER, max_slots INTEGER, booked_slots INTEGER DEFAULT 0, duration TEXT, rating REAL, description TEXT, highlights TEXT, tour_type TEXT, itinerary TEXT, created_at TEXT, updated_at TEXT)`).run();
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const search = c.req.query("search");
  const offset = (page - 1) * limit;
  let where = "WHERE 1=1";
  const params: any[] = [];
  if (search) { where += " AND (name LIKE ? OR region LIKE ?)"; const s = `%${search}%`; params.push(s, s); }
  const countResult = await db.prepare(`SELECT COUNT(*) as count FROM tours ${where}`).bind(...params).first<{ count: number }>();
  const results = await db.prepare(`SELECT * FROM tours ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/tours/:id", async (c) => {
  const tour = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tours WHERE id = ?").bind(c.req.param("id")).first();
  if (!tour) return c.json({ error: "Not found" }, 404);
  return c.json(tour);
});

app.post("/api/admin/tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (id TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT, image TEXT, price_per_slot INTEGER, max_slots INTEGER, booked_slots INTEGER DEFAULT 0, duration TEXT, rating REAL, description TEXT, highlights TEXT, tour_type TEXT, itinerary TEXT, created_at TEXT, updated_at TEXT)`).run();
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO tours (id, name, region, image, price_per_slot, max_slots, duration, rating, description, highlights, tour_type, itinerary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, data.name, data.region || null, data.image || null, data.pricePerSlot || 0, data.maxSlots || 10, data.duration || null, data.rating || 5.0, data.description || null, JSON.stringify(data.highlights || []), data.tourType || "day", JSON.stringify(data.itinerary || []), now, now).run();
  const created = await db.prepare("SELECT * FROM tours WHERE id = ?").bind(id).first();
  return c.json(created, 201);
});

app.put("/api/admin/tours/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();
  const existing = await db.prepare("SELECT * FROM tours WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  const fields: string[] = [];
  const values: any[] = [];
  for (const [key, dbKey] of Object.entries({ name: "name", region: "region", image: "image", pricePerSlot: "price_per_slot", maxSlots: "max_slots", duration: "duration", rating: "rating", description: "description", tourType: "tour_type" })) {
    if (data[key] !== undefined) { fields.push(`${dbKey} = ?`); values.push(data[key]); }
  }
  if (data.highlights !== undefined) { fields.push("highlights = ?"); values.push(JSON.stringify(data.highlights)); }
  if (data.itinerary !== undefined) { fields.push("itinerary = ?"); values.push(JSON.stringify(data.itinerary)); }
  fields.push("updated_at = ?"); values.push(now); values.push(id);
  await db.prepare(`UPDATE tours SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM tours WHERE id = ?").bind(id).first();
  return c.json(updated);
});

app.delete("/api/admin/tours/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tours WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await c.env.BOOKINGS_DB.prepare("DELETE FROM tours WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ==================== TOUR BOOKINGS ====================
app.get("/api/admin/tour-bookings", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tour_bookings (id TEXT PRIMARY KEY, tour_id TEXT, tour_name TEXT, guest_name TEXT, guest_phone TEXT, guest_email TEXT, slots INTEGER, total_price INTEGER, booking_code TEXT, status TEXT, is_group_tour INTEGER DEFAULT 0, group_id TEXT, date TEXT, payment_method TEXT, created_at TEXT, updated_at TEXT)`).run();
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;
  let where = "WHERE 1=1";
  const params: any[] = [];
  if (status) { where += " AND status = ?"; params.push(status); }
  const countResult = await db.prepare(`SELECT COUNT(*) as count FROM tour_bookings ${where}`).bind(...params).first<{ count: number }>();
  const results = await db.prepare(`SELECT * FROM tour_bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.patch("/api/admin/tour-bookings/:id/status", async (c) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();
  const existing = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tour_bookings WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await c.env.BOOKINGS_DB.prepare("UPDATE tour_bookings SET status = ?, updated_at = ? WHERE id = ?").bind(data.status, now, id).run();
  const updated = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tour_bookings WHERE id = ?").bind(id).first();
  return c.json(updated);
});

// ==================== GROUP TOURS ====================
app.get("/api/admin/group-tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS group_tours (id TEXT PRIMARY KEY, tour_id TEXT, tour_name TEXT, creator_name TEXT, creator_email TEXT, current_members INTEGER DEFAULT 0, required_members INTEGER, status TEXT DEFAULT 'matching', members TEXT, date TEXT, created_at TEXT, updated_at TEXT)`).run();
  const results = await db.prepare("SELECT * FROM group_tours ORDER BY created_at DESC").all();
  return c.json({ data: results.results });
});

// ==================== FOOTER CONFIG ====================
app.get("/api/admin/config/footer", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const row = await db.prepare("SELECT value FROM site_config WHERE key = 'footer'").first();
  return c.json(row ? JSON.parse(row.value as string) : null);
});

app.put("/api/admin/config/footer", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES ('footer', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== BANNERS CONFIG ====================
app.get("/api/admin/config/banners", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const row = await db.prepare("SELECT value FROM site_config WHERE key = 'banners'").first();
  return c.json(row ? JSON.parse(row.value as string) : null);
});

app.put("/api/admin/config/banners", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES ('banners', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== POLICIES CONFIG ====================
app.get("/api/admin/config/policies", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const row = await db.prepare("SELECT value FROM site_config WHERE key = 'policies'").first();
  return c.json(row ? JSON.parse(row.value as string) : null);
});

app.put("/api/admin/config/policies", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES ('policies', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== ABOUT CONFIG ====================
app.get("/api/admin/config/about", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const row = await db.prepare("SELECT value FROM site_config WHERE key = 'about'").first();
  return c.json(row ? JSON.parse(row.value as string) : null);
});

app.put("/api/admin/config/about", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (key, value, updated_at) VALUES ('about', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

export default app;
