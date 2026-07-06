import { Hono } from "hono";

type Bindings = {
  USERS_DB: D1Database;
  PROPERTIES_DB: D1Database;
  BOOKINGS_DB: D1Database;
  PAYMENTS_DB: D1Database;
};

const router = new Hono<{ Bindings: Bindings }>();

// ==================== RESERVATIONS ====================

// List reservations/bookings with pagination
router.get("/api/admin/reservations", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const branchId = c.req.query("branchId");
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }
  if (branchId) {
    where += " AND property_id = ?";
    params.push(branchId);
  }
  if (search) {
    where += " AND (guest_id LIKE ? OR special_requests LIKE ? OR id LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM bookings ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// Get reservation by ID
router.get("/api/admin/reservations/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");

  const reservation = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first();

  if (!reservation) {
    return c.json({ error: "Reservation not found" }, 404);
  }
  return c.json(reservation);
});

// Create reservation
router.post("/api/admin/reservations", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Calculate nights from check-in and check-out
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  const nights = Math.ceil(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  await db
    .prepare(
      `INSERT INTO bookings (id, property_id, guest_id, partner_id, check_in, check_out, nights, guests, total_price, status, special_requests, created_at, updated_at)
       VALUES (?, ?, '', '', ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
    )
    .bind(
      id,
      data.branchId,
      data.checkIn,
      data.checkOut,
      nights,
      data.rooms || 1,
      data.totalPrice,
      data.specialRequest || null,
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first();
  return c.json(created, 201);
});

// Update reservation status
router.patch("/api/admin/reservations/:id/status", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const validStatuses = [
    "Reserved",
    "CheckedIn",
    "CheckedOut",
    "Cancelled",
    "pending",
    "confirmed",
    "completed",
  ];
  if (!validStatuses.includes(data.status)) {
    return c.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
      400
    );
  }

  const existing = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Reservation not found" }, 404);
  }

  let updateFields = "status = ?, updated_at = ?";
  let updateValues: any[] = [data.status, now];

  if (data.status === "Cancelled") {
    updateFields += ", cancellation_reason = ?, cancelled_at = ?";
    updateValues.push(data.cancellationReason || "Cancelled by admin", now);
  }
  if (data.status === "confirmed" || data.status === "CheckedIn") {
    updateFields += ", confirmed_at = ?";
    updateValues.push(now);
  }
  if (data.status === "completed" || data.status === "CheckedOut") {
    updateFields += ", completed_at = ?";
    updateValues.push(now);
  }

  updateValues.push(id);
  await db
    .prepare(`UPDATE bookings SET ${updateFields} WHERE id = ?`)
    .bind(...updateValues)
    .run();

  const updated = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first();
  return c.json(updated);
});

// ==================== ROOMS ====================

// List hotel rooms
router.get("/api/admin/rooms", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const branchId = c.req.query("branchId");
  const status = c.req.query("status");
  const search = c.req.query("search");

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (branchId) {
    where += " AND id = ?";
    params.push(branchId);
  }
  if (search) {
    where += " AND (title LIKE ? OR address LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  // Rooms are derived from properties (each property = a room/unit)
  const results = await db
    .prepare(`SELECT * FROM properties ${where} ORDER BY title ASC`)
    .bind(...params)
    .all();

  // Map properties to room-like objects with status
  const rooms = results.results.map((row: any) => ({
    id: row.id,
    name: row.title,
    branchId: row.partner_id,
    branchName: row.city,
    status: status || "Clean",
    propertyType: row.property_type,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    maxGuests: row.max_guests,
    pricePerNight: row.price_per_night,
    address: row.address,
    city: row.city,
  }));

  // Filter by room status if provided (in a real app this would be a separate column)
  const filtered = status
    ? rooms.filter((r: any) => r.status === status)
    : rooms;

  return c.json({ data: filtered, total: filtered.length });
});

// ==================== SERVICE REQUESTS ====================

// Create guest service request
router.post("/api/admin/requests", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Ensure requests table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        room_name TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        type TEXT NOT NULL,
        detail TEXT,
        assigned_staff TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO service_requests (id, room_name, guest_name, type, detail, assigned_staff, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
    )
    .bind(
      id,
      data.roomName,
      data.guestName,
      data.type,
      data.detail || null,
      data.assignedStaff || null,
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM service_requests WHERE id = ?")
    .bind(id)
    .first();
  return c.json(created, 201);
});

// List requests with pagination
router.get("/api/admin/requests", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;

  // Ensure table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS service_requests (
        id TEXT PRIMARY KEY,
        room_name TEXT NOT NULL,
        guest_name TEXT NOT NULL,
        type TEXT NOT NULL,
        detail TEXT,
        assigned_staff TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(
      `SELECT COUNT(*) as count FROM service_requests ${where}`
    )
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM service_requests ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// Update request status
router.patch("/api/admin/requests/:id/status", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db
    .prepare("SELECT * FROM service_requests WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Request not found" }, 404);
  }

  await db
    .prepare(
      "UPDATE service_requests SET status = ?, updated_at = ? WHERE id = ?"
    )
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM service_requests WHERE id = ?")
    .bind(id)
    .first();
  return c.json(updated);
});

// ==================== COMPLAINTS ====================

// Create complaint
router.post("/api/admin/complaints", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Ensure complaints table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        guest_name TEXT NOT NULL,
        room_name TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO complaints (id, guest_name, room_name, title, detail, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 'open', ?, ?)`
    )
    .bind(
      id,
      data.guestName,
      data.roomName,
      data.title,
      data.detail || null,
      data.priority || "medium",
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM complaints WHERE id = ?")
    .bind(id)
    .first();
  return c.json(created, 201);
});

// List complaints
router.get("/api/admin/complaints", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;

  // Ensure table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS complaints (
        id TEXT PRIMARY KEY,
        guest_name TEXT NOT NULL,
        room_name TEXT NOT NULL,
        title TEXT NOT NULL,
        detail TEXT,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM complaints ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM complaints ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// Update complaint status
router.patch("/api/admin/complaints/:id/status", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db
    .prepare("SELECT * FROM complaints WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Complaint not found" }, 404);
  }

  await db
    .prepare("UPDATE complaints SET status = ?, updated_at = ? WHERE id = ?")
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM complaints WHERE id = ?")
    .bind(id)
    .first();
  return c.json(updated);
});

// ==================== DAILY LOGS ====================

// Create daily log entry
router.post("/api/admin/daily-logs", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Ensure daily_logs table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        shift TEXT NOT NULL,
        content TEXT NOT NULL,
        issues TEXT,
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO daily_logs (id, author, shift, content, issues, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.author,
      data.shift,
      data.content,
      data.issues || null,
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM daily_logs WHERE id = ?")
    .bind(id)
    .first();
  return c.json(created, 201);
});

// List daily logs
router.get("/api/admin/daily-logs", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const offset = (page - 1) * limit;

  // Ensure table exists
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS daily_logs (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        shift TEXT NOT NULL,
        content TEXT NOT NULL,
        issues TEXT,
        created_at TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  const countResult = await db
    .prepare("SELECT COUNT(*) as count FROM daily_logs")
    .first<{ count: number }>();

  const results = await db
    .prepare(
      "SELECT * FROM daily_logs ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

export default router;
