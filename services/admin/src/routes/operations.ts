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
    where += " AND bookings_status = ?";
    params.push(status);
  }
  if (branchId) {
    where += " AND bookings_property_id = ?";
    params.push(branchId);
  }
  if (search) {
    where += " AND (bookings_guest_id LIKE ? OR bookings_special_requests LIKE ? OR bookings_id LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM bookings ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM bookings ${where} ORDER BY bookings_created_at DESC LIMIT ? OFFSET ?`
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
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
      `INSERT INTO bookings (bookings_id, bookings_property_id, bookings_guest_id, bookings_partner_id, bookings_check_in, bookings_check_out, bookings_nights, bookings_guests, bookings_total_price, bookings_status, bookings_special_requests, bookings_created_at, bookings_updated_at)
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Reservation not found" }, 404);
  }

  let updateFields = "bookings_status = ?, bookings_updated_at = ?";
  let updateValues: any[] = [data.status, now];

  if (data.status === "Cancelled") {
    updateFields += ", bookings_cancellation_reason = ?, bookings_cancelled_at = ?";
    updateValues.push(data.cancellationReason || "Cancelled by admin", now);
  }
  if (data.status === "confirmed" || data.status === "CheckedIn") {
    updateFields += ", bookings_confirmed_at = ?";
    updateValues.push(now);
  }
  if (data.status === "completed" || data.status === "CheckedOut") {
    updateFields += ", bookings_completed_at = ?";
    updateValues.push(now);
  }

  updateValues.push(id);
  await db
    .prepare(`UPDATE bookings SET ${updateFields} WHERE bookings_id = ?`)
    .bind(...updateValues)
    .run();

  const updated = await db
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
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
    where += " AND properties_id = ?";
    params.push(branchId);
  }
  if (search) {
    where += " AND (properties_title LIKE ? OR properties_address LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s);
  }

  // Rooms are derived from properties (each property = a room/unit)
  const results = await db
    .prepare(`SELECT * FROM properties ${where} ORDER BY properties_title ASC`)
    .bind(...params)
    .all();

  // Map properties to room-like objects with status
  const rooms = results.results.map((row: any) => ({
    id: row.properties_id,
    name: row.properties_title,
    branchId: row.properties_partner_id,
    branchName: row.properties_city,
    status: status || "Clean",
    propertyType: row.properties_property_type,
    bedrooms: row.properties_bedrooms,
    bathrooms: row.properties_bathrooms,
    maxGuests: row.properties_max_guests,
    pricePerNight: row.properties_price_per_night,
    address: row.properties_address,
    city: row.properties_city,
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
        service_requests_id TEXT PRIMARY KEY,
        service_requests_room_name TEXT NOT NULL,
        service_requests_guest_name TEXT NOT NULL,
        service_requests_type TEXT NOT NULL,
        service_requests_detail TEXT,
        service_requests_assigned_staff TEXT,
        service_requests_status TEXT NOT NULL DEFAULT 'pending',
        service_requests_created_at TEXT NOT NULL DEFAULT '',
        service_requests_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO service_requests (service_requests_id, service_requests_room_name, service_requests_guest_name, service_requests_type, service_requests_detail, service_requests_assigned_staff, service_requests_status, service_requests_created_at, service_requests_updated_at)
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
    .prepare("SELECT * FROM service_requests WHERE service_requests_id = ?")
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
        service_requests_id TEXT PRIMARY KEY,
        service_requests_room_name TEXT NOT NULL,
        service_requests_guest_name TEXT NOT NULL,
        service_requests_type TEXT NOT NULL,
        service_requests_detail TEXT,
        service_requests_assigned_staff TEXT,
        service_requests_status TEXT NOT NULL DEFAULT 'pending',
        service_requests_created_at TEXT NOT NULL DEFAULT '',
        service_requests_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND service_requests_status = ?";
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
      `SELECT * FROM service_requests ${where} ORDER BY service_requests_created_at DESC LIMIT ? OFFSET ?`
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
    .prepare("SELECT * FROM service_requests WHERE service_requests_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Request not found" }, 404);
  }

  await db
    .prepare(
      "UPDATE service_requests SET service_requests_status = ?, service_requests_updated_at = ? WHERE service_requests_id = ?"
    )
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM service_requests WHERE service_requests_id = ?")
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
        complaints_id TEXT PRIMARY KEY,
        complaints_guest_name TEXT NOT NULL,
        complaints_room_name TEXT NOT NULL,
        complaints_title TEXT NOT NULL,
        complaints_detail TEXT,
        complaints_priority TEXT NOT NULL DEFAULT 'medium',
        complaints_status TEXT NOT NULL DEFAULT 'open',
        complaints_created_at TEXT NOT NULL DEFAULT '',
        complaints_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO complaints (complaints_id, complaints_guest_name, complaints_room_name, complaints_title, complaints_detail, complaints_priority, complaints_status, complaints_created_at, complaints_updated_at)
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
    .prepare("SELECT * FROM complaints WHERE complaints_id = ?")
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
        complaints_id TEXT PRIMARY KEY,
        complaints_guest_name TEXT NOT NULL,
        complaints_room_name TEXT NOT NULL,
        complaints_title TEXT NOT NULL,
        complaints_detail TEXT,
        complaints_priority TEXT NOT NULL DEFAULT 'medium',
        complaints_status TEXT NOT NULL DEFAULT 'open',
        complaints_created_at TEXT NOT NULL DEFAULT '',
        complaints_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND complaints_status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM complaints ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM complaints ${where} ORDER BY complaints_created_at DESC LIMIT ? OFFSET ?`
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
    .prepare("SELECT * FROM complaints WHERE complaints_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Complaint not found" }, 404);
  }

  await db
    .prepare("UPDATE complaints SET complaints_status = ?, complaints_updated_at = ? WHERE complaints_id = ?")
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM complaints WHERE complaints_id = ?")
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
        daily_logs_id TEXT PRIMARY KEY,
        daily_logs_author TEXT NOT NULL,
        daily_logs_shift TEXT NOT NULL,
        daily_logs_content TEXT NOT NULL,
        daily_logs_issues TEXT,
        daily_logs_created_at TEXT NOT NULL DEFAULT '',
        daily_logs_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await db
    .prepare(
      `INSERT INTO daily_logs (daily_logs_id, daily_logs_author, daily_logs_shift, daily_logs_content, daily_logs_issues, daily_logs_created_at, daily_logs_updated_at)
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
    .prepare("SELECT * FROM daily_logs WHERE daily_logs_id = ?")
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
        daily_logs_id TEXT PRIMARY KEY,
        daily_logs_author TEXT NOT NULL,
        daily_logs_shift TEXT NOT NULL,
        daily_logs_content TEXT NOT NULL,
        daily_logs_issues TEXT,
        daily_logs_created_at TEXT NOT NULL DEFAULT '',
        daily_logs_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  const countResult = await db
    .prepare("SELECT COUNT(*) as count FROM daily_logs")
    .first<{ count: number }>();

  const results = await db
    .prepare(
      "SELECT * FROM daily_logs ORDER BY daily_logs_created_at DESC LIMIT ? OFFSET ?"
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
