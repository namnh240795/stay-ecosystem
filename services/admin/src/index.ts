import { Hono } from "hono";
import { cors } from "hono/cors";
import longtermRoutes from "./routes/longterm";
import operationsRoutes from "./routes/operations";
import staffRoutes from "./routes/staff";
import toursRoutes from "./routes/tours";

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

// ==================== SEED (Local Dev Only) ====================
app.post("/api/admin/seed", async (c) => {
  const usersDb = c.env.USERS_DB;
  const propertiesDb = c.env.PROPERTIES_DB;
  const bookingsDb = c.env.BOOKINGS_DB;
  const paymentsDb = c.env.PAYMENTS_DB;

  const createTables = [
    `CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT, phone TEXT, avatar_url TEXT, role TEXT NOT NULL DEFAULT 'guest', auth0_sub TEXT UNIQUE, partner_id TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS properties (id TEXT PRIMARY KEY, partner_id TEXT NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL, address TEXT NOT NULL, city TEXT NOT NULL, country TEXT NOT NULL, latitude REAL, longitude REAL, price_per_night REAL NOT NULL, max_guests INTEGER NOT NULL DEFAULT 2, bedrooms INTEGER NOT NULL DEFAULT 1, bathrooms INTEGER NOT NULL DEFAULT 1, property_type TEXT NOT NULL DEFAULT 'apartment', status TEXT NOT NULL DEFAULT 'active', images TEXT, rules TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, guest_id TEXT NOT NULL, partner_id TEXT NOT NULL, check_in TEXT NOT NULL, check_out TEXT NOT NULL, nights INTEGER NOT NULL, guests INTEGER NOT NULL DEFAULT 1, total_price REAL NOT NULL, status TEXT NOT NULL DEFAULT 'pending', special_requests TEXT, cancellation_reason TEXT, cancelled_at TEXT, confirmed_at TEXT, completed_at TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS payments (id TEXT PRIMARY KEY, booking_id TEXT NOT NULL, partner_id TEXT NOT NULL, amount REAL NOT NULL, currency TEXT NOT NULL DEFAULT 'VND', status TEXT NOT NULL DEFAULT 'pending', payment_method TEXT, transaction_id TEXT, metadata TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, property_id TEXT NOT NULL, booking_id TEXT, guest_id TEXT NOT NULL, partner_id TEXT, rating INTEGER NOT NULL, comment TEXT, partner_reply TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS longterm_apartments (id TEXT PRIMARY KEY, partner_id TEXT, name TEXT NOT NULL, location TEXT, type TEXT, area REAL, bedrooms INTEGER, bathrooms INTEGER, monthly_price REAL, description TEXT, amenities TEXT, available_from TEXT, has_virtual_tour INTEGER DEFAULT 0, virtual_tour_url TEXT, pet_friendly INTEGER DEFAULT 0, maintenance_status TEXT DEFAULT 'Clean', estimated_repair_cost REAL, maintenance_notes TEXT, status TEXT DEFAULT 'active', created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS longterm_contracts (id TEXT PRIMARY KEY, apt_id TEXT, apt_name TEXT, location TEXT, monthly_price REAL, lease_term INTEGER, tenant_name TEXT, tenant_phone TEXT, tenant_email TEXT, signed_date TEXT, status TEXT DEFAULT 'active', created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS staff (id TEXT PRIMARY KEY, user_id TEXT, role_id TEXT, status TEXT DEFAULT 'Active', joined_at TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, description TEXT, permissions TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS leave_requests (id TEXT PRIMARY KEY, type TEXT, staff_name TEXT, role_name TEXT, reason TEXT, start_date TEXT, end_date TEXT, status TEXT DEFAULT 'Pending', response_notes TEXT, reviewed_at TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS tours (id TEXT PRIMARY KEY, name TEXT NOT NULL, region TEXT, image TEXT, price_per_slot INTEGER, max_slots INTEGER, booked_slots INTEGER DEFAULT 0, duration TEXT, rating REAL, description TEXT, highlights TEXT, tour_type TEXT, itinerary TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS tour_bookings (id TEXT PRIMARY KEY, tour_id TEXT, tour_name TEXT, guest_name TEXT, guest_phone TEXT, guest_email TEXT, slots INTEGER, total_price INTEGER, booking_code TEXT, status TEXT, is_group_tour INTEGER DEFAULT 0, group_id TEXT, date TEXT, payment_method TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS group_tours (id TEXT PRIMARY KEY, tour_id TEXT, tour_name TEXT, creator_name TEXT, creator_email TEXT, current_members INTEGER DEFAULT 0, required_members INTEGER, status TEXT DEFAULT 'matching', members TEXT, date TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS site_config (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS service_requests (id TEXT PRIMARY KEY, room_name TEXT, guest_name TEXT, type TEXT, detail TEXT, assigned_staff TEXT, status TEXT DEFAULT 'Pending', time TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS complaints (id TEXT PRIMARY KEY, guest_name TEXT, room_name TEXT, title TEXT, detail TEXT, priority TEXT, status TEXT DEFAULT 'Open', notes TEXT, time TEXT, created_at TEXT, updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS daily_logs (id TEXT PRIMARY KEY, author TEXT, shift TEXT, content TEXT, issues TEXT, date TEXT, time TEXT, created_at TEXT, updated_at TEXT)`,
  ];

  for (const sql of createTables) {
    await usersDb.prepare(sql).run();
    await propertiesDb.prepare(sql).run();
    await bookingsDb.prepare(sql).run();
    await paymentsDb.prepare(sql).run();
  }

  // Seed users
  const seedUsers = [
    { id: 'usr-001', email: 'namnh240795+grandstayadmin@gmail.com', name: 'Admin User', phone: '0912345678', role: 'admin', auth0_sub: 'auth0|6a4b3698e68cc397a48bdfc4' },
    { id: 'usr-002', email: 'namnh240795+grandstaypartner@gmail.com', name: 'Partner User', phone: '0987654321', role: 'partner', auth0_sub: 'auth0|6a4b36a724b21a5abef8a385' },
    { id: 'usr-003', email: 'namnh240795+grandstayguest@gmail.com', name: 'Guest User', phone: '0905123456', role: 'guest', auth0_sub: 'auth0|6a4b36a8281483a678fbfa66' },
    { id: 'usr-004', email: 'nguyenvanA@gmail.com', name: 'Nguyen Van A', phone: '0911111111', role: 'guest' },
    { id: 'usr-005', email: 'tranthib@gmail.com', name: 'Tran Thi B', phone: '0922222222', role: 'partner' },
    { id: 'usr-006', email: 'phamhoang@gmail.com', name: 'Pham Hoang C', phone: '0933333333', role: 'guest' },
  ];
  for (const u of seedUsers) {
    await usersDb.prepare("INSERT OR IGNORE INTO users (id, email, name, phone, role, auth0_sub, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, '', '')").bind(u.id, u.email, u.name, u.phone, u.role, u.auth0_sub || null).run();
  }

  // Seed properties
  const seedProps = [
    { id: 'prop-001', partnerId: 'usr-002', title: 'Metropolitan Luxury Studio - Saigon Central', desc: 'Căn hộ Studio cao cấp sở hữu ban công kính nhìn trực diện Landmark 81.', address: '123 Nguyen Hue, District 1', city: 'Ho Chi Minh City', price: 2375000, type: 'apartment' },
    { id: 'prop-002', partnerId: 'usr-002', title: 'Indochine Heritage 1BR Suite - Hoan Kiem', desc: 'Căn hộ kết hợp tinh tế giữa nét đẹp Indochine truyền thống.', address: '45 Hang Bai, Hoan Kiem', city: 'Hanoi', price: 2750000, type: 'apartment' },
    { id: 'prop-003', partnerId: 'usr-002', title: 'My Khe Beachfront Panoramic 2BR', desc: 'Thức dậy cùng bình minh rực rỡ trên biển Mỹ Khê.', address: '78 Vo Nguyen Giap, Son Tra', city: 'Da Nang', price: 3625000, type: 'apartment' },
    { id: 'prop-004', partnerId: 'usr-005', title: 'Sunset Horizon Pool Villa', desc: 'Trải nghiệm phong cách sống sang trọng tại căn Penthouse.', address: '12 Tran Hung Dao, Duong Dong', city: 'Phu Quoc', price: 7000000, type: 'villa' },
    { id: 'prop-005', partnerId: 'usr-005', title: 'Misty Valley Cozy Chalet', desc: 'Tận hưởng kỳ nghỉ trốn bụi mịn tại căn hộ gỗ.', address: '88 Fansipan, Sa Pa', city: 'Lao Cai', price: 2000000, type: 'apartment' },
    { id: 'prop-006', partnerId: 'usr-002', title: 'Zen Garden Tea-view Suite', desc: 'Căn hộ dịch vụ cao cấp hướng đồi chè.', address: '15 Dong Tam, Thai Nguyen', city: 'Thai Nguyen', price: 1875000, type: 'apartment' },
  ];
  for (const p of seedProps) {
    await propertiesDb.prepare("INSERT OR IGNORE INTO properties (id, partner_id, title, description, address, city, country, price_per_night, property_type, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'Vietnam', ?, ?, 'active', '', '')").bind(p.id, p.partnerId, p.title, p.desc, p.address, p.city, p.price, p.type).run();
  }

  // Seed bookings
  const seedBookings = [
    { id: 'bk-001', propertyId: 'prop-001', guestId: 'usr-003', partnerId: 'usr-002', checkIn: '2026-07-01', checkOut: '2026-07-04', nights: 3, guests: 2, price: 7125000, status: 'confirmed' },
    { id: 'bk-002', propertyId: 'prop-002', guestId: 'usr-004', partnerId: 'usr-002', checkIn: '2026-07-05', checkOut: '2026-07-08', nights: 3, guests: 2, price: 8250000, status: 'pending' },
    { id: 'bk-003', propertyId: 'prop-003', guestId: 'usr-006', partnerId: 'usr-002', checkIn: '2026-07-10', checkOut: '2026-07-15', nights: 5, guests: 3, price: 18125000, status: 'confirmed' },
    { id: 'bk-004', propertyId: 'prop-004', guestId: 'usr-003', partnerId: 'usr-005', checkIn: '2026-07-01', checkOut: '2026-07-03', nights: 2, guests: 4, price: 14000000, status: 'completed' },
    { id: 'bk-005', propertyId: 'prop-005', guestId: 'usr-004', partnerId: 'usr-005', checkIn: '2026-07-20', checkOut: '2026-07-25', nights: 5, guests: 2, price: 10000000, status: 'pending' },
    { id: 'bk-006', propertyId: 'prop-001', guestId: 'usr-006', partnerId: 'usr-002', checkIn: '2026-06-25', checkOut: '2026-06-28', nights: 3, guests: 2, price: 7125000, status: 'cancelled' },
  ];
  for (const b of seedBookings) {
    await bookingsDb.prepare("INSERT OR IGNORE INTO bookings (id, property_id, guest_id, partner_id, check_in, check_out, nights, guests, total_price, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '')").bind(b.id, b.propertyId, b.guestId, b.partnerId, b.checkIn, b.checkOut, b.nights, b.guests, b.price, b.status).run();
  }

  // Seed payments
  const seedPayments = [
    { id: 'pay-001', bookingId: 'bk-001', partnerId: 'usr-002', amount: 7125000, status: 'completed', method: 'sepay' },
    { id: 'pay-002', bookingId: 'bk-003', partnerId: 'usr-002', amount: 18125000, status: 'completed', method: 'stripe' },
    { id: 'pay-003', bookingId: 'bk-004', partnerId: 'usr-005', amount: 14000000, status: 'completed', method: 'sepay' },
    { id: 'pay-004', bookingId: 'bk-002', partnerId: 'usr-002', amount: 8250000, status: 'pending', method: 'sepay' },
    { id: 'pay-005', bookingId: 'bk-005', partnerId: 'usr-005', amount: 10000000, status: 'pending', method: 'stripe' },
  ];
  for (const p of seedPayments) {
    await paymentsDb.prepare("INSERT OR IGNORE INTO payments (id, booking_id, partner_id, amount, currency, status, payment_method, created_at, updated_at) VALUES (?, ?, ?, ?, 'VND', ?, ?, '', '')").bind(p.id, p.bookingId, p.partnerId, p.amount, p.status, p.method).run();
  }

  return c.json({ success: true, message: "Database seeded with test data" });
});

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

// ==================== MOUNT ROUTES ====================
app.route("/", longtermRoutes);
app.route("/", operationsRoutes);
app.route("/", staffRoutes);
app.route("/", toursRoutes);

// ==================== ERROR HANDLER ====================
app.onError((err, c) => {
  console.error("Admin service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
