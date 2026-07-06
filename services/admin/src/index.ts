import { Hono } from "hono";
import { cors } from "hono/cors";

type Bindings = {
  USERS_DB: D1Database;
  PROPERTIES_DB: D1Database;
  BOOKINGS_DB: D1Database;
  PAYMENTS_DB: D1Database;
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
  AUTH0_M2M_CLIENT_ID: string;
  AUTH0_M2M_CLIENT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// --- Middleware ---
app.use("*", cors());

// ==================== HEALTH ====================
app.get("/health", (c) => c.json({ status: "ok", service: "admin" }));

// ==================== DASHBOARD ====================
app.get("/api/admin/dashboard/stats", async (c) => {
  const usersDb = c.env.USERS_DB;
  const propertiesDb = c.env.PROPERTIES_DB;
  const bookingsDb = c.env.BOOKINGS_DB;
  const paymentsDb = c.env.PAYMENTS_DB;

  const totalBookings = await bookingsDb.prepare("SELECT COUNT(*) as count FROM bookings").first<{ count: number }>();
  const activeBookings = await bookingsDb.prepare("SELECT COUNT(*) as count FROM bookings WHERE status IN ('pending', 'confirmed')").first<{ count: number }>();
  const totalProperties = await propertiesDb.prepare("SELECT COUNT(*) as count FROM properties").first<{ count: number }>();
  const activeProperties = await propertiesDb.prepare("SELECT COUNT(*) as count FROM properties WHERE status = 'active'").first<{ count: number }>();
  const revenueStats = await bookingsDb.prepare("SELECT COALESCE(SUM(total_price), 0) as total FROM bookings WHERE status IN ('confirmed', 'completed')").first<{ total: number }>();
  const totalUsers = await usersDb.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
  const sepayStats = await paymentsDb.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_method = 'sepay' AND status = 'completed'").first<{ count: number; total: number }>();
  const stripeStats = await paymentsDb.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM payments WHERE payment_method = 'stripe' AND status = 'completed'").first<{ count: number; total: number }>();

  return c.json({
    totalRevenue: revenueStats?.total || 0,
    hotelRevenue: (revenueStats?.total || 0) * 0.6,
    aptRevenue: (revenueStats?.total || 0) * 0.4,
    totalBookings: totalBookings?.count || 0,
    activeBookings: activeBookings?.count || 0,
    totalProperties: totalProperties?.count || 0,
    activeProperties: activeProperties?.count || 0,
    occupancyRate: totalProperties?.count ? Math.round(((activeBookings?.count || 0) / totalProperties.count) * 100) : 0,
    pendingContracts: 0,
    totalUsers: totalUsers?.count || 0,
    sepayTotalCount: sepayStats?.count || 0,
    sepayTotalAmount: sepayStats?.total || 0,
    stripeTotalCount: stripeStats?.count || 0,
    stripeTotalAmount: stripeStats?.total || 0,
  });
});

app.get("/api/admin/dashboard/revenue", async (c) => {
  const period = c.req.query("period") || "weekly";
  const mockData: Record<string, any[]> = {
    weekly: [
      { label: "T2", hotel: 45000000, apt: 30000000, total: 75000000 },
      { label: "T3", hotel: 52000000, apt: 35000000, total: 87000000 },
      { label: "T4", hotel: 39000000, apt: 42000000, total: 81000000 },
      { label: "T5", hotel: 68000000, apt: 38000000, total: 106000000 },
      { label: "T6", hotel: 85000000, apt: 55000000, total: 140000000 },
      { label: "T7", hotel: 120000000, apt: 60000000, total: 180000000 },
      { label: "CN", hotel: 110000000, apt: 50000000, total: 160000000 },
    ],
    monthly: [
      { label: "Tuần 1", hotel: 280000000, apt: 180000000, total: 460000000 },
      { label: "Tuần 2", hotel: 320000000, apt: 195000000, total: 515000000 },
      { label: "Tuần 3", hotel: 410000000, apt: 220000000, total: 630000000 },
      { label: "Tuần 4", hotel: 490000000, apt: 240000000, total: 730000000 },
    ],
    yearly: [
      { label: "Thg 1", hotel: 1200000000, apt: 750000000, total: 1950000000 },
      { label: "Thg 2", hotel: 1400000000, apt: 810000000, total: 2210000000 },
      { label: "Thg 3", hotel: 1350000000, apt: 800000000, total: 2150000000 },
      { label: "Thg 4", hotel: 1600000000, apt: 920000000, total: 2520000000 },
      { label: "Thg 5", hotel: 1850000000, apt: 1100000000, total: 2950000000 },
      { label: "Thg 6", hotel: 2200000000, apt: 1250000000, total: 3450000000 },
    ],
  };
  return c.json(mockData[period] || mockData.weekly);
});

// ==================== PROPERTIES ====================
app.get("/api/admin/properties", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const city = c.req.query("city");
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) { where += " AND status = ?"; params.push(status); }
  if (city) { where += " AND city = ?"; params.push(city); }
  if (search) {
    where += " AND (title LIKE ? OR description LIKE ? OR address LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await propertiesDb.prepare(`SELECT COUNT(*) as count FROM properties ${where}`).bind(...params).first<{ count: number }>();
  const results = await propertiesDb.prepare(`SELECT * FROM properties ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const property = await propertiesDb.prepare("SELECT * FROM properties WHERE id = ?").bind(c.req.param("id")).first();
  if (!property) return c.json({ error: "Not found" }, 404);
  return c.json(property);
});

app.post("/api/admin/properties", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await propertiesDb.prepare(
    `INSERT INTO properties (id, partner_id, title, description, address, city, country, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, property_type, status, images, rules, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`
  ).bind(id, data.partnerId, data.title, data.description, data.address, data.city, data.country, data.latitude || null, data.longitude || null, data.pricePerNight, data.maxGuests || 2, data.bedrooms || 1, data.bathrooms || 1, data.propertyType || "apartment", data.images || null, data.rules || null, now, now).run();

  const created = await propertiesDb.prepare("SELECT * FROM properties WHERE id = ?").bind(id).first();
  return c.json(created, 201);
});

app.put("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await propertiesDb.prepare("SELECT * FROM properties WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, dbKey] of Object.entries({
    title: "title", description: "description", address: "address",
    city: "city", country: "country", pricePerNight: "price_per_night",
    maxGuests: "max_guests", bedrooms: "bedrooms", bathrooms: "bathrooms",
    propertyType: "property_type", images: "images", rules: "rules",
  })) {
    if (data[key] !== undefined) { fields.push(`${dbKey} = ?`); values.push(data[key]); }
  }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await propertiesDb.prepare(`UPDATE properties SET ${fields.join(", ")} WHERE id = ?`).bind(...values).run();
  const updated = await propertiesDb.prepare("SELECT * FROM properties WHERE id = ?").bind(id).first();
  return c.json(updated);
});

app.delete("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const id = c.req.param("id");
  const existing = await propertiesDb.prepare("SELECT * FROM properties WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await propertiesDb.prepare("DELETE FROM properties WHERE id = ?").bind(id).run();
  return c.json({ success: true });
});

// ==================== BOOKINGS ====================
app.get("/api/admin/bookings", async (c) => {
  const bookingsDb = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const propertyId = c.req.query("propertyId");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];
  if (status) { where += " AND status = ?"; params.push(status); }
  if (propertyId) { where += " AND property_id = ?"; params.push(propertyId); }

  const countResult = await bookingsDb.prepare(`SELECT COUNT(*) as count FROM bookings ${where}`).bind(...params).first<{ count: number }>();
  const results = await bookingsDb.prepare(`SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/bookings/:id", async (c) => {
  const bookingsDb = c.env.BOOKINGS_DB;
  const booking = await bookingsDb.prepare("SELECT * FROM bookings WHERE id = ?").bind(c.req.param("id")).first();
  if (!booking) return c.json({ error: "Not found" }, 404);
  return c.json(booking);
});

app.patch("/api/admin/bookings/:id/status", async (c) => {
  const bookingsDb = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await bookingsDb.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  let updateFields = "status = ?, updated_at = ?";
  let updateValues: any[] = [data.status, now];

  if (data.status === "cancelled" && data.cancellationReason) {
    updateFields += ", cancellation_reason = ?, cancelled_at = ?";
    updateValues.push(data.cancellationReason, now);
  }
  if (data.status === "confirmed") { updateFields += ", confirmed_at = ?"; updateValues.push(now); }
  if (data.status === "completed") { updateFields += ", completed_at = ?"; updateValues.push(now); }

  updateValues.push(id);
  await bookingsDb.prepare(`UPDATE bookings SET ${updateFields} WHERE id = ?`).bind(...updateValues).run();
  const updated = await bookingsDb.prepare("SELECT * FROM bookings WHERE id = ?").bind(id).first();
  return c.json(updated);
});

// ==================== USERS ====================
app.get("/api/admin/users", async (c) => {
  const usersDb = c.env.USERS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const role = c.req.query("role");
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];
  if (role) { where += " AND role = ?"; params.push(role); }
  if (search) {
    where += " AND (name LIKE ? OR email LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  const countResult = await usersDb.prepare(`SELECT COUNT(*) as count FROM users ${where}`).bind(...params).first<{ count: number }>();
  const results = await usersDb.prepare(`SELECT * FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/users/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const user = await usersDb.prepare("SELECT * FROM users WHERE id = ?").bind(c.req.param("id")).first();
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});

app.patch("/api/admin/users/:id/role", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  await usersDb.prepare("UPDATE users SET role = ?, updated_at = ? WHERE id = ?").bind(data.role, now, id).run();
  const updated = await usersDb.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
  return c.json(updated);
});

// ==================== ERROR HANDLER ====================
app.onError((err, c) => {
  console.error("Admin service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
