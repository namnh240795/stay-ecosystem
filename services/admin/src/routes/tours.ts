import { Hono } from "hono";

type Env = { USERS_DB: D1Database; PROPERTIES_DB: D1Database; BOOKINGS_DB: D1Database; PAYMENTS_DB: D1Database };
const app = new Hono<{ Bindings: Env }>();

// ==================== TOURS ====================
app.get("/api/admin/tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (tours_id TEXT PRIMARY KEY, tours_name TEXT NOT NULL, tours_region TEXT, tours_image TEXT, tours_price_per_slot INTEGER, tours_max_slots INTEGER, tours_booked_slots INTEGER DEFAULT 0, tours_duration TEXT, tours_rating REAL, tours_description TEXT, tours_highlights TEXT, tours_tour_type TEXT, tours_itinerary TEXT, tours_created_at TEXT, tours_updated_at TEXT)`).run();
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const search = c.req.query("search");
  const offset = (page - 1) * limit;
  let where = "WHERE 1=1";
  const params: any[] = [];
  if (search) { where += " AND (tours_name LIKE ? OR tours_region LIKE ?)"; const s = `%${search}%`; params.push(s, s); }
  const countResult = await db.prepare(`SELECT COUNT(*) as count FROM tours ${where}`).bind(...params).first<{ count: number }>();
  const results = await db.prepare(`SELECT * FROM tours ${where} ORDER BY tours_created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/tours/:id", async (c) => {
  const tour = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(c.req.param("id")).first();
  if (!tour) return c.json({ error: "Not found" }, 404);
  return c.json(tour);
});

app.post("/api/admin/tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (tours_id TEXT PRIMARY KEY, tours_name TEXT NOT NULL, tours_region TEXT, tours_image TEXT, tours_price_per_slot INTEGER, tours_max_slots INTEGER, tours_booked_slots INTEGER DEFAULT 0, tours_duration TEXT, tours_rating REAL, tours_description TEXT, tours_highlights TEXT, tours_tour_type TEXT, tours_itinerary TEXT, tours_created_at TEXT, tours_updated_at TEXT)`).run();
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO tours (tours_id, tours_name, tours_region, tours_image, tours_price_per_slot, tours_max_slots, tours_duration, tours_rating, tours_description, tours_highlights, tours_tour_type, tours_itinerary, tours_created_at, tours_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(id, data.name, data.region || null, data.image || null, data.pricePerSlot || 0, data.maxSlots || 10, data.duration || null, data.rating || 5.0, data.description || null, JSON.stringify(data.highlights || []), data.tourType || "day", JSON.stringify(data.itinerary || []), now, now).run();
  const created = await db.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(id).first();
  return c.json(created, 201);
});

app.put("/api/admin/tours/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();
  const existing = await db.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  const fields: string[] = [];
  const values: any[] = [];
  for (const [key, dbKey] of Object.entries({ name: "tours_name", region: "tours_region", image: "tours_image", pricePerSlot: "tours_price_per_slot", maxSlots: "tours_max_slots", duration: "tours_duration", rating: "tours_rating", description: "tours_description", tourType: "tours_tour_type" })) {
    if (data[key] !== undefined) { fields.push(`${dbKey} = ?`); values.push(data[key]); }
  }
  if (data.highlights !== undefined) { fields.push("tours_highlights = ?"); values.push(JSON.stringify(data.highlights)); }
  if (data.itinerary !== undefined) { fields.push("tours_itinerary = ?"); values.push(JSON.stringify(data.itinerary)); }
  fields.push("tours_updated_at = ?"); values.push(now); values.push(id);
  await db.prepare(`UPDATE tours SET ${fields.join(", ")} WHERE tours_id = ?`).bind(...values).run();
  const updated = await db.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(id).first();
  return c.json(updated);
});

app.delete("/api/admin/tours/:id", async (c) => {
  const id = c.req.param("id");
  const existing = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await c.env.BOOKINGS_DB.prepare("DELETE FROM tours WHERE tours_id = ?").bind(id).run();
  return c.json({ success: true });
});

// ==================== TOUR BOOKINGS ====================
app.get("/api/admin/tour-bookings", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS tour_bookings (tour_bookings_id TEXT PRIMARY KEY, tour_bookings_tour_id TEXT, tour_bookings_tour_name TEXT, tour_bookings_guest_name TEXT, tour_bookings_guest_phone TEXT, tour_bookings_guest_email TEXT, tour_bookings_slots INTEGER, tour_bookings_total_price INTEGER, tour_bookings_booking_code TEXT, tour_bookings_status TEXT, tour_bookings_is_group_tour INTEGER DEFAULT 0, tour_bookings_group_id TEXT, tour_bookings_date TEXT, tour_bookings_payment_method TEXT, tour_bookings_created_at TEXT, tour_bookings_updated_at TEXT)`).run();
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;
  let where = "WHERE 1=1";
  const params: any[] = [];
  if (status) { where += " AND tour_bookings_status = ?"; params.push(status); }
  const countResult = await db.prepare(`SELECT COUNT(*) as count FROM tour_bookings ${where}`).bind(...params).first<{ count: number }>();
  const results = await db.prepare(`SELECT * FROM tour_bookings ${where} ORDER BY tour_bookings_created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();
  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.patch("/api/admin/tour-bookings/:id/status", async (c) => {
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();
  const existing = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tour_bookings WHERE tour_bookings_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await c.env.BOOKINGS_DB.prepare("UPDATE tour_bookings SET tour_bookings_status = ?, tour_bookings_updated_at = ? WHERE tour_bookings_id = ?").bind(data.status, now, id).run();
  const updated = await c.env.BOOKINGS_DB.prepare("SELECT * FROM tour_bookings WHERE tour_bookings_id = ?").bind(id).first();
  return c.json(updated);
});

// ==================== GROUP TOURS ====================
app.get("/api/admin/group-tours", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS group_tours (group_tours_id TEXT PRIMARY KEY, group_tours_tour_id TEXT, group_tours_tour_name TEXT, group_tours_creator_name TEXT, group_tours_creator_email TEXT, group_tours_current_members INTEGER DEFAULT 0, group_tours_required_members INTEGER, group_tours_status TEXT DEFAULT 'matching', group_tours_members TEXT, group_tours_date TEXT, group_tours_created_at TEXT, group_tours_updated_at TEXT)`).run();
  const results = await db.prepare("SELECT * FROM group_tours ORDER BY group_tours_created_at DESC").all();
  return c.json({ data: results.results });
});

// ==================== FOOTER CONFIG ====================
app.get("/api/admin/config/footer", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const row = await db.prepare("SELECT site_config_value FROM site_config WHERE site_config_key = 'footer'").first();
  return c.json(row ? JSON.parse(row.site_config_value as string) : null);
});

app.put("/api/admin/config/footer", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (site_config_key, site_config_value, site_config_updated_at) VALUES ('footer', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== BANNERS CONFIG ====================
app.get("/api/admin/config/banners", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const row = await db.prepare("SELECT site_config_value FROM site_config WHERE site_config_key = 'banners'").first();
  return c.json(row ? JSON.parse(row.site_config_value as string) : null);
});

app.put("/api/admin/config/banners", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (site_config_key, site_config_value, site_config_updated_at) VALUES ('banners', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== POLICIES CONFIG ====================
app.get("/api/admin/config/policies", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const row = await db.prepare("SELECT site_config_value FROM site_config WHERE site_config_key = 'policies'").first();
  return c.json(row ? JSON.parse(row.site_config_value as string) : null);
});

app.put("/api/admin/config/policies", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (site_config_key, site_config_value, site_config_updated_at) VALUES ('policies', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

// ==================== ABOUT CONFIG ====================
app.get("/api/admin/config/about", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const row = await db.prepare("SELECT site_config_value FROM site_config WHERE site_config_key = 'about'").first();
  return c.json(row ? JSON.parse(row.site_config_value as string) : null);
});

app.put("/api/admin/config/about", async (c) => {
  const db = c.env.USERS_DB;
  await db.prepare(`CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`).run();
  const data = await c.req.json();
  const now = new Date().toISOString();
  await db.prepare("INSERT OR REPLACE INTO site_config (site_config_key, site_config_value, site_config_updated_at) VALUES ('about', ?, ?)").bind(JSON.stringify(data), now).run();
  return c.json({ success: true });
});

export default app;
