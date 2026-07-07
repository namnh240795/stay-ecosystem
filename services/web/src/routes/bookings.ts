import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureBookingTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT NOT NULL UNIQUE,
      guest_name TEXT NOT NULL,
      guest_phone TEXT,
      guest_email TEXT,
      branch_id TEXT,
      branch_name TEXT,
      room_name TEXT,
      check_in TEXT NOT NULL,
      check_out TEXT NOT NULL,
      nights INTEGER NOT NULL DEFAULT 1,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      total_price REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      special_request TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).run();
}

function generateBookingCode(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `BK-${datePart}-${randomPart}`;
}

// ============================
// BOOKING ROUTES
// ============================

// POST /bookings - Create a new booking
app.post("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureBookingTable(db);

  const body = await c.req.json<{
    guestName: string;
    guestPhone?: string;
    guestEmail?: string;
    branchId?: string;
    branchName?: string;
    roomName?: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults?: number;
    children?: number;
    totalPrice: number;
    paymentMethod?: string;
    specialRequest?: string;
  }>();

  const id = crypto.randomUUID();
  const bookingCode = generateBookingCode();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO bookings (
        id, booking_code, guest_name, guest_phone, guest_email,
        branch_id, branch_name, room_name,
        check_in, check_out, nights, adults, children,
        total_price, payment_method, special_request,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`
    )
    .bind(
      id,
      bookingCode,
      body.guestName,
      body.guestPhone ?? null,
      body.guestEmail ?? null,
      body.branchId ?? null,
      body.branchName ?? null,
      body.roomName ?? null,
      body.checkIn,
      body.checkOut,
      body.nights,
      body.adults ?? 1,
      body.children ?? 0,
      body.totalPrice,
      body.paymentMethod ?? null,
      body.specialRequest ?? null,
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      bookingCode,
      guestName: body.guestName,
      guestPhone: body.guestPhone ?? null,
      guestEmail: body.guestEmail ?? null,
      branchId: body.branchId ?? null,
      branchName: body.branchName ?? null,
      roomName: body.roomName ?? null,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      nights: body.nights,
      adults: body.adults ?? 1,
      children: body.children ?? 0,
      totalPrice: body.totalPrice,
      paymentMethod: body.paymentMethod ?? null,
      specialRequest: body.specialRequest ?? null,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// GET /bookings - List bookings with filters and pagination
app.get("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureBookingTable(db);

  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const guestEmail = c.req.query("guestEmail");
  const status = c.req.query("status");

  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (guestEmail) {
    where += " AND guest_email = ?";
    params.push(guestEmail);
  }
  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM bookings ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results,
    total: countResult?.total ?? 0,
    page,
    limit,
  });
});

// GET /bookings/:id - Get booking detail
app.get("/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureBookingTable(db);

  const id = c.req.param("id");

  const booking = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  return c.json(booking);
});

// PUT /bookings/:id/cancel - Cancel a booking
app.put("/:id/cancel", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureBookingTable(db);

  const id = c.req.param("id");

  const booking = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first<{ id: string; status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.status === "cancelled") {
    return c.json({ error: "Booking is already cancelled" }, 400);
  }

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE bookings SET status = 'cancelled', updated_at = ? WHERE id = ?`
    )
    .bind(now, id)
    .run();

  return c.json({ success: true, message: "Booking cancelled" });
});

// PUT /bookings/:id/modify - Modify booking dates
app.put("/:id/modify", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureBookingTable(db);

  const id = c.req.param("id");
  const body = await c.req.json<{
    checkIn?: string;
    checkOut?: string;
  }>();

  const booking = await db
    .prepare("SELECT * FROM bookings WHERE id = ?")
    .bind(id)
    .first<{ id: string; status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.status === "cancelled") {
    return c.json({ error: "Cannot modify a cancelled booking" }, 400);
  }

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE bookings
       SET check_in = COALESCE(?, check_in),
           check_out = COALESCE(?, check_out),
           status = 'modify_pending',
           updated_at = ?
       WHERE id = ?`
    )
    .bind(body.checkIn ?? null, body.checkOut ?? null, now, id)
    .run();

  return c.json({ success: true, message: "Booking modification request submitted" });
});

export default app;
