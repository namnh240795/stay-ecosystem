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
      bookings_id TEXT PRIMARY KEY,
      bookings_booking_code TEXT NOT NULL UNIQUE,
      bookings_guest_name TEXT NOT NULL,
      bookings_guest_phone TEXT,
      bookings_guest_email TEXT,
      bookings_branch_id TEXT,
      bookings_branch_name TEXT,
      bookings_room_name TEXT,
      bookings_check_in TEXT NOT NULL,
      bookings_check_out TEXT NOT NULL,
      bookings_nights INTEGER NOT NULL DEFAULT 1,
      bookings_adults INTEGER NOT NULL DEFAULT 1,
      bookings_children INTEGER NOT NULL DEFAULT 0,
      bookings_total_price REAL NOT NULL DEFAULT 0,
      bookings_payment_method TEXT,
      bookings_special_request TEXT,
      bookings_status TEXT NOT NULL DEFAULT 'confirmed',
      bookings_created_at TEXT NOT NULL DEFAULT (datetime('now')),
      bookings_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
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
        bookings_id, bookings_booking_code, bookings_guest_name, bookings_guest_phone, bookings_guest_email,
        bookings_branch_id, bookings_branch_name, bookings_room_name,
        bookings_check_in, bookings_check_out, bookings_nights, bookings_adults, bookings_children,
        bookings_total_price, bookings_payment_method, bookings_special_request,
        bookings_status, bookings_created_at, bookings_updated_at
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
    where += " AND bookings_guest_email = ?";
    params.push(guestEmail);
  }
  if (status) {
    where += " AND bookings_status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM bookings ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM bookings ${where} ORDER BY bookings_created_at DESC LIMIT ? OFFSET ?`)
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
    .bind(id)
    .first<{ bookings_id: string; bookings_status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.bookings_status === "cancelled") {
    return c.json({ error: "Booking is already cancelled" }, 400);
  }

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE bookings SET bookings_status = 'cancelled', bookings_updated_at = ? WHERE bookings_id = ?`
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
    .prepare("SELECT * FROM bookings WHERE bookings_id = ?")
    .bind(id)
    .first<{ bookings_id: string; bookings_status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.bookings_status === "cancelled") {
    return c.json({ error: "Cannot modify a cancelled booking" }, 400);
  }

  const now = new Date().toISOString();

  await db
    .prepare(
      `UPDATE bookings
       SET bookings_check_in = COALESCE(?, bookings_check_in),
           bookings_check_out = COALESCE(?, bookings_check_out),
           bookings_status = 'modify_pending',
           bookings_updated_at = ?
       WHERE bookings_id = ?`
    )
    .bind(body.checkIn ?? null, body.checkOut ?? null, now, id)
    .run();

  return c.json({ success: true, message: "Booking modification request submitted" });
});

export default app;
