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
    `CREATE TABLE IF NOT EXISTS users (users_id TEXT PRIMARY KEY, users_email TEXT NOT NULL UNIQUE, users_name TEXT, users_phone TEXT, users_avatar_url TEXT, users_role TEXT NOT NULL DEFAULT 'guest', users_auth0_sub TEXT UNIQUE, users_partner_id TEXT, users_created_at TEXT NOT NULL DEFAULT '', users_updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS properties (properties_id TEXT PRIMARY KEY, properties_partner_id TEXT NOT NULL, properties_title TEXT NOT NULL, properties_description TEXT NOT NULL, properties_address TEXT NOT NULL, properties_city TEXT NOT NULL, properties_country TEXT NOT NULL, properties_latitude REAL, properties_longitude REAL, properties_price_per_night REAL NOT NULL, properties_max_guests INTEGER NOT NULL DEFAULT 2, properties_bedrooms INTEGER NOT NULL DEFAULT 1, properties_bathrooms INTEGER NOT NULL DEFAULT 1, properties_property_type TEXT NOT NULL DEFAULT 'apartment', properties_status TEXT NOT NULL DEFAULT 'active', properties_images TEXT, properties_rules TEXT, properties_created_at TEXT NOT NULL DEFAULT '', properties_updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS bookings (bookings_id TEXT PRIMARY KEY, bookings_property_id TEXT NOT NULL, bookings_guest_id TEXT NOT NULL, bookings_partner_id TEXT NOT NULL, bookings_check_in TEXT NOT NULL, bookings_check_out TEXT NOT NULL, bookings_nights INTEGER NOT NULL, bookings_guests INTEGER NOT NULL DEFAULT 1, bookings_total_price REAL NOT NULL, bookings_status TEXT NOT NULL DEFAULT 'pending', bookings_special_requests TEXT, bookings_cancellation_reason TEXT, bookings_cancelled_at TEXT, bookings_confirmed_at TEXT, bookings_completed_at TEXT, bookings_created_at TEXT NOT NULL DEFAULT '', bookings_updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS payments (payments_id TEXT PRIMARY KEY, payments_booking_id TEXT NOT NULL, payments_partner_id TEXT NOT NULL, payments_amount REAL NOT NULL, payments_currency TEXT NOT NULL DEFAULT 'VND', payments_status TEXT NOT NULL DEFAULT 'pending', payments_payment_method TEXT, payments_transaction_id TEXT, payments_metadata TEXT, payments_created_at TEXT NOT NULL DEFAULT '', payments_updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS reviews (reviews_id TEXT PRIMARY KEY, reviews_property_id TEXT NOT NULL, reviews_booking_id TEXT, reviews_guest_id TEXT NOT NULL, reviews_partner_id TEXT, reviews_rating INTEGER NOT NULL, reviews_comment TEXT, reviews_partner_reply TEXT, reviews_created_at TEXT NOT NULL DEFAULT '', reviews_updated_at TEXT NOT NULL DEFAULT '')`,
    `CREATE TABLE IF NOT EXISTS longterm_apartments (longterm_apartments_id TEXT PRIMARY KEY, longterm_apartments_partner_id TEXT, longterm_apartments_name TEXT NOT NULL, longterm_apartments_location TEXT, longterm_apartments_type TEXT, longterm_apartments_area REAL, longterm_apartments_bedrooms INTEGER, longterm_apartments_bathrooms INTEGER, longterm_apartments_monthly_price REAL, longterm_apartments_description TEXT, longterm_apartments_amenities TEXT, longterm_apartments_available_from TEXT, longterm_apartments_has_virtual_tour INTEGER DEFAULT 0, longterm_apartments_virtual_tour_url TEXT, longterm_apartments_pet_friendly INTEGER DEFAULT 0, longterm_apartments_maintenance_status TEXT DEFAULT 'Clean', longterm_apartments_estimated_repair_cost REAL, longterm_apartments_maintenance_notes TEXT, longterm_apartments_status TEXT DEFAULT 'active', longterm_apartments_created_at TEXT, longterm_apartments_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS longterm_contracts (longterm_contracts_id TEXT PRIMARY KEY, longterm_contracts_apt_id TEXT, longterm_contracts_apt_name TEXT, longterm_contracts_location TEXT, longterm_contracts_monthly_price REAL, longterm_contracts_lease_term INTEGER, longterm_contracts_tenant_name TEXT, longterm_contracts_tenant_phone TEXT, longterm_contracts_tenant_email TEXT, longterm_contracts_signed_date TEXT, longterm_contracts_status TEXT DEFAULT 'active', longterm_contracts_created_at TEXT, longterm_contracts_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS staff (staff_id TEXT PRIMARY KEY, staff_user_id TEXT, staff_role_id TEXT, staff_status TEXT DEFAULT 'Active', staff_joined_at TEXT, staff_created_at TEXT, staff_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS roles (roles_id TEXT PRIMARY KEY, roles_name TEXT NOT NULL UNIQUE, roles_description TEXT, roles_permissions TEXT, roles_created_at TEXT, roles_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS leave_requests (leave_requests_id TEXT PRIMARY KEY, leave_requests_type TEXT, leave_requests_staff_name TEXT, leave_requests_role_name TEXT, leave_requests_reason TEXT, leave_requests_start_date TEXT, leave_requests_end_date TEXT, leave_requests_status TEXT DEFAULT 'Pending', leave_requests_response_notes TEXT, leave_requests_reviewed_at TEXT, leave_requests_created_at TEXT, leave_requests_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS tours (tours_id TEXT PRIMARY KEY, tours_name TEXT NOT NULL, tours_region TEXT, tours_image TEXT, tours_price_per_slot INTEGER, tours_max_slots INTEGER, tours_booked_slots INTEGER DEFAULT 0, tours_duration TEXT, tours_rating REAL, tours_description TEXT, tours_highlights TEXT, tours_tour_type TEXT, tours_itinerary TEXT, tours_created_at TEXT, tours_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS tour_bookings (tour_bookings_id TEXT PRIMARY KEY, tour_bookings_tour_id TEXT, tour_bookings_tour_name TEXT, tour_bookings_guest_name TEXT, tour_bookings_guest_phone TEXT, tour_bookings_guest_email TEXT, tour_bookings_slots INTEGER, tour_bookings_total_price INTEGER, tour_bookings_booking_code TEXT, tour_bookings_status TEXT, tour_bookings_is_group_tour INTEGER DEFAULT 0, tour_bookings_group_id TEXT, tour_bookings_date TEXT, tour_bookings_payment_method TEXT, tour_bookings_created_at TEXT, tour_bookings_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS group_tours (group_tours_id TEXT PRIMARY KEY, group_tours_tour_id TEXT, group_tours_tour_name TEXT, group_tours_creator_name TEXT, group_tours_creator_email TEXT, group_tours_current_members INTEGER DEFAULT 0, group_tours_required_members INTEGER, group_tours_status TEXT DEFAULT 'matching', group_tours_members TEXT, group_tours_date TEXT, group_tours_created_at TEXT, group_tours_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS site_config (site_config_key TEXT PRIMARY KEY, site_config_value TEXT, site_config_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS service_requests (service_requests_id TEXT PRIMARY KEY, service_requests_room_name TEXT, service_requests_guest_name TEXT, service_requests_type TEXT, service_requests_detail TEXT, service_requests_assigned_staff TEXT, service_requests_status TEXT DEFAULT 'Pending', service_requests_time TEXT, service_requests_created_at TEXT, service_requests_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS complaints (complaints_id TEXT PRIMARY KEY, complaints_guest_name TEXT, complaints_room_name TEXT, complaints_title TEXT, complaints_detail TEXT, complaints_priority TEXT, complaints_status TEXT DEFAULT 'Open', complaints_notes TEXT, complaints_time TEXT, complaints_created_at TEXT, complaints_updated_at TEXT)`,
    `CREATE TABLE IF NOT EXISTS daily_logs (daily_logs_id TEXT PRIMARY KEY, daily_logs_author TEXT, daily_logs_shift TEXT, daily_logs_content TEXT, daily_logs_issues TEXT, daily_logs_date TEXT, daily_logs_time TEXT, daily_logs_created_at TEXT, daily_logs_updated_at TEXT)`,
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
    await usersDb.prepare("INSERT OR IGNORE INTO users (users_id, users_email, users_name, users_phone, users_role, users_auth0_sub, users_created_at, users_updated_at) VALUES (?, ?, ?, ?, ?, ?, '', '')").bind(u.id, u.email, u.name, u.phone, u.role, u.auth0_sub || null).run();
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
    await propertiesDb.prepare("INSERT OR IGNORE INTO properties (properties_id, properties_partner_id, properties_title, properties_description, properties_address, properties_city, properties_country, properties_price_per_night, properties_property_type, properties_status, properties_created_at, properties_updated_at) VALUES (?, ?, ?, ?, ?, ?, 'Vietnam', ?, ?, 'active', '', '')").bind(p.id, p.partnerId, p.title, p.desc, p.address, p.city, p.price, p.type).run();
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
    await bookingsDb.prepare("INSERT OR IGNORE INTO bookings (bookings_id, bookings_property_id, bookings_guest_id, bookings_partner_id, bookings_check_in, bookings_check_out, bookings_nights, bookings_guests, bookings_total_price, bookings_status, bookings_created_at, bookings_updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '')").bind(b.id, b.propertyId, b.guestId, b.partnerId, b.checkIn, b.checkOut, b.nights, b.guests, b.price, b.status).run();
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
    await paymentsDb.prepare("INSERT OR IGNORE INTO payments (payments_id, payments_booking_id, payments_partner_id, payments_amount, payments_currency, payments_status, payments_payment_method, payments_created_at, payments_updated_at) VALUES (?, ?, ?, ?, 'VND', ?, ?, '', '')").bind(p.id, p.bookingId, p.partnerId, p.amount, p.status, p.method).run();
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
  const activeBookings = await bookingsDb.prepare("SELECT COUNT(*) as count FROM bookings WHERE bookings_status IN ('pending', 'confirmed')").first<{ count: number }>();
  const totalProperties = await propertiesDb.prepare("SELECT COUNT(*) as count FROM properties").first<{ count: number }>();
  const activeProperties = await propertiesDb.prepare("SELECT COUNT(*) as count FROM properties WHERE properties_status = 'active'").first<{ count: number }>();
  const revenueStats = await bookingsDb.prepare("SELECT COALESCE(SUM(bookings_total_price), 0) as total FROM bookings WHERE bookings_status IN ('confirmed', 'completed')").first<{ total: number }>();
  const totalUsers = await usersDb.prepare("SELECT COUNT(*) as count FROM users").first<{ count: number }>();
  const sepayStats = await paymentsDb.prepare("SELECT COUNT(*) as count, COALESCE(SUM(payments_amount), 0) as total FROM payments WHERE payments_payment_method = 'sepay' AND payments_status = 'completed'").first<{ count: number; total: number }>();
  const stripeStats = await paymentsDb.prepare("SELECT COUNT(*) as count, COALESCE(SUM(payments_amount), 0) as total FROM payments WHERE payments_payment_method = 'stripe' AND payments_status = 'completed'").first<{ count: number; total: number }>();

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

  if (status) { where += " AND properties_status = ?"; params.push(status); }
  if (city) { where += " AND properties_city = ?"; params.push(city); }
  if (search) {
    where += " AND (properties_title LIKE ? OR properties_description LIKE ? OR properties_address LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await propertiesDb.prepare(`SELECT COUNT(*) as count FROM properties ${where}`).bind(...params).first<{ count: number }>();
  const results = await propertiesDb.prepare(`SELECT * FROM properties ${where} ORDER BY properties_created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const property = await propertiesDb.prepare("SELECT * FROM properties WHERE properties_id = ?").bind(c.req.param("id")).first();
  if (!property) return c.json({ error: "Not found" }, 404);
  return c.json(property);
});

app.post("/api/admin/properties", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await propertiesDb.prepare(
    `INSERT INTO properties (properties_id, properties_partner_id, properties_title, properties_description, properties_address, properties_city, properties_country, properties_latitude, properties_longitude, properties_price_per_night, properties_max_guests, properties_bedrooms, properties_bathrooms, properties_property_type, properties_status, properties_images, properties_rules, properties_created_at, properties_updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)`
  ).bind(id, data.partnerId, data.title, data.description, data.address, data.city, data.country, data.latitude || null, data.longitude || null, data.pricePerNight, data.maxGuests || 2, data.bedrooms || 1, data.bathrooms || 1, data.propertyType || "apartment", data.images || null, data.rules || null, now, now).run();

  const created = await propertiesDb.prepare("SELECT * FROM properties WHERE properties_id = ?").bind(id).first();
  return c.json(created, 201);
});

app.put("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await propertiesDb.prepare("SELECT * FROM properties WHERE properties_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, dbKey] of Object.entries({
    title: "properties_title", description: "properties_description", address: "properties_address",
    city: "properties_city", country: "properties_country", pricePerNight: "properties_price_per_night",
    maxGuests: "properties_max_guests", bedrooms: "properties_bedrooms", bathrooms: "properties_bathrooms",
    propertyType: "properties_property_type", images: "properties_images", rules: "properties_rules",
  })) {
    if (data[key] !== undefined) { fields.push(`${dbKey} = ?`); values.push(data[key]); }
  }

  fields.push("properties_updated_at = ?");
  values.push(now);
  values.push(id);

  await propertiesDb.prepare(`UPDATE properties SET ${fields.join(", ")} WHERE properties_id = ?`).bind(...values).run();
  const updated = await propertiesDb.prepare("SELECT * FROM properties WHERE properties_id = ?").bind(id).first();
  return c.json(updated);
});

app.delete("/api/admin/properties/:id", async (c) => {
  const propertiesDb = c.env.PROPERTIES_DB;
  const id = c.req.param("id");
  const existing = await propertiesDb.prepare("SELECT * FROM properties WHERE properties_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);
  await propertiesDb.prepare("DELETE FROM properties WHERE properties_id = ?").bind(id).run();
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
  if (status) { where += " AND bookings_status = ?"; params.push(status); }
  if (propertyId) { where += " AND bookings_property_id = ?"; params.push(propertyId); }

  const countResult = await bookingsDb.prepare(`SELECT COUNT(*) as count FROM bookings ${where}`).bind(...params).first<{ count: number }>();
  const results = await bookingsDb.prepare(`SELECT * FROM bookings ${where} ORDER BY bookings_created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/bookings/:id", async (c) => {
  const bookingsDb = c.env.BOOKINGS_DB;
  const booking = await bookingsDb.prepare("SELECT * FROM bookings WHERE bookings_id = ?").bind(c.req.param("id")).first();
  if (!booking) return c.json({ error: "Not found" }, 404);
  return c.json(booking);
});

app.patch("/api/admin/bookings/:id/status", async (c) => {
  const bookingsDb = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await bookingsDb.prepare("SELECT * FROM bookings WHERE bookings_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  let updateFields = "bookings_status = ?, bookings_updated_at = ?";
  let updateValues: any[] = [data.status, now];

  if (data.status === "cancelled" && data.cancellationReason) {
    updateFields += ", bookings_cancellation_reason = ?, bookings_cancelled_at = ?";
    updateValues.push(data.cancellationReason, now);
  }
  if (data.status === "confirmed") { updateFields += ", bookings_confirmed_at = ?"; updateValues.push(now); }
  if (data.status === "completed") { updateFields += ", bookings_completed_at = ?"; updateValues.push(now); }

  updateValues.push(id);
  await bookingsDb.prepare(`UPDATE bookings SET ${updateFields} WHERE bookings_id = ?`).bind(...updateValues).run();
  const updated = await bookingsDb.prepare("SELECT * FROM bookings WHERE bookings_id = ?").bind(id).first();
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
  if (role) { where += " AND users_role = ?"; params.push(role); }
  if (search) {
    where += " AND (users_name LIKE ? OR users_email LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  const countResult = await usersDb.prepare(`SELECT COUNT(*) as count FROM users ${where}`).bind(...params).first<{ count: number }>();
  const results = await usersDb.prepare(`SELECT * FROM users ${where} ORDER BY users_created_at DESC LIMIT ? OFFSET ?`).bind(...params, limit, offset).all();

  return c.json({ data: results.results, total: countResult?.count || 0, page, limit });
});

app.get("/api/admin/users/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const user = await usersDb.prepare("SELECT * FROM users WHERE users_id = ?").bind(c.req.param("id")).first();
  if (!user) return c.json({ error: "Not found" }, 404);
  return c.json(user);
});

app.patch("/api/admin/users/:id/role", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb.prepare("SELECT * FROM users WHERE users_id = ?").bind(id).first();
  if (!existing) return c.json({ error: "Not found" }, 404);

  await usersDb.prepare("UPDATE users SET users_role = ?, users_updated_at = ? WHERE users_id = ?").bind(data.role, now, id).run();
  const updated = await usersDb.prepare("SELECT * FROM users WHERE users_id = ?").bind(id).first();
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
