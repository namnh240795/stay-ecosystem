import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureTourTables(db: D1Database) {
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, region TEXT, image_url TEXT, price_per_slot REAL NOT NULL, max_slots INTEGER NOT NULL DEFAULT 10, booked_slots INTEGER NOT NULL DEFAULT 0, duration TEXT, rating REAL DEFAULT 5.0, highlights TEXT, tour_type TEXT, itinerary TEXT, created_at TEXT, updated_at TEXT)`).run();

    CREATE TABLE IF NOT EXISTS tour_bookings (
      id TEXT PRIMARY KEY,
      tour_id TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      slots INTEGER NOT NULL DEFAULT 1,
      date TEXT NOT NULL,
      payment_method TEXT,
      status TEXT NOT NULL DEFAULT 'confirmed',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    );

    CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      tour_id TEXT NOT NULL,
      creator_name TEXT NOT NULL,
      creator_email TEXT NOT NULL,
      required_members INTEGER NOT NULL DEFAULT 2,
      matched INTEGER NOT NULL DEFAULT 0,
      date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_id) REFERENCES tours(id)
    );

    CREATE TABLE IF NOT EXISTS group_members (
      id TEXT PRIMARY KEY,
      group_id TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      slots INTEGER NOT NULL DEFAULT 1,
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups(id)
    );
  `).run();
}

// ============================
// TOUR ROUTES
// ============================

// GET /api/tours - List tours with filters
app.get("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const region = c.req.query("region");
  const type = c.req.query("type");

  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (region) {
    where += " AND region = ?";
    params.push(region);
  }
  if (type) {
    where += " AND type = ?";
    params.push(type);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM tours ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM tours ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results,
    total: countResult?.total ?? 0,
    page,
    limit,
  });
});

// POST /api/tours - Create a new tour
app.post("/", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await db.prepare("INSERT INTO tours (id, name, region, image_url, price_per_slot, max_slots, booked_slots, duration, rating, description, highlights, tour_type, itinerary, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 5.0, ?, ?, ?, ?, ?, ?)").bind(id, data.name, data.region || null, data.image || null, data.pricePerSlot || 0, data.maxSlots || 10, data.duration || null, data.description || null, JSON.stringify(data.highlights || []), data.tourType || 'day', JSON.stringify(data.itinerary || []), now, now).run();
  const tour = await db.prepare("SELECT * FROM tours WHERE id = ?").bind(id).first();
  return c.json(tour, 201);
});

// GET /api/tours/:id - Get tour detail with itinerary
app.get("/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const id = c.req.param("id");

  const tour = await db
    .prepare("SELECT * FROM tours WHERE id = ?")
    .bind(id)
    .first();

  if (!tour) {
    return c.json({ error: "Tour not found" }, 404);
  }

  // Parse itinerary from JSON string
  const tourWithItinerary = {
    ...tour,
    itinerary: tour.itinerary ? JSON.parse(tour.itinerary as string) : null,
    dates: tour.dates ? JSON.parse(tour.dates as string) : null,
  };

  return c.json(tourWithItinerary);
});

// POST /api/tours/:id/book - Book tour slots
app.post("/:id/book", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const tourId = c.req.param("id");
  const body = await c.req.json<{
    guestName: string;
    guestPhone: string;
    guestEmail: string;
    slots: number;
    date: string;
    paymentMethod: string;
  }>();

  // Check tour exists and has available slots
  const tour = await db
    .prepare("SELECT * FROM tours WHERE id = ?")
    .bind(tourId)
    .first<{ id: string; total_slots: number; booked_slots: number }>();

  if (!tour) {
    return c.json({ error: "Tour not found" }, 404);
  }

  const available = tour.total_slots - tour.booked_slots;
  if (body.slots > available) {
    return c.json({ error: `Only ${available} slots available` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert booking
  await db
    .prepare(
      `INSERT INTO tour_bookings (id, tour_id, guest_name, guest_phone, guest_email, slots, date, payment_method, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?, ?)`
    )
    .bind(
      id,
      tourId,
      body.guestName,
      body.guestPhone,
      body.guestEmail,
      body.slots,
      body.date,
      body.paymentMethod,
      now,
      now
    )
    .run();

  // Increment booked slots
  await db
    .prepare(
      `UPDATE tours SET booked_slots = booked_slots + ?, updated_at = ? WHERE id = ?`
    )
    .bind(body.slots, now, tourId)
    .run();

  return c.json(
    {
      id,
      tourId,
      guestName: body.guestName,
      guestPhone: body.guestPhone,
      guestEmail: body.guestEmail,
      slots: body.slots,
      date: body.date,
      paymentMethod: body.paymentMethod,
      status: "confirmed",
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// ============================
// TOUR BOOKING ROUTES
// ============================

// GET /api/tours/bookings - List tour bookings
app.get("/bookings", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const userId = c.req.query("userId");
  const status = c.req.query("status");

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (userId) {
    where += " AND tb.guest_email = ?";
    params.push(userId);
  }
  if (status) {
    where += " AND tb.status = ?";
    params.push(status);
  }

  const { results } = await db
    .prepare(
      `SELECT tb.*, t.name as tour_name, t.region as tour_region, t.type as tour_type
       FROM tour_bookings tb
       LEFT JOIN tours t ON tb.tour_id = t.id
       ${where}
       ORDER BY tb.created_at DESC`
    )
    .bind(...params)
    .all();

  return c.json({ data: results, total: results.length });
});

// PUT /api/tours/bookings/:id/cancel - Cancel tour booking
app.put("/bookings/:id/cancel", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const bookingId = c.req.param("id");

  const booking = await db
    .prepare("SELECT * FROM tour_bookings WHERE id = ?")
    .bind(bookingId)
    .first<{ id: string; tour_id: string; slots: number; status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.status === "cancelled") {
    return c.json({ error: "Booking is already cancelled" }, 400);
  }

  const now = new Date().toISOString();

  // Update booking status
  await db
    .prepare(
      `UPDATE tour_bookings SET status = 'cancelled', updated_at = ? WHERE id = ?`
    )
    .bind(now, bookingId)
    .run();

  // Decrement booked slots on the tour
  await db
    .prepare(
      `UPDATE tours SET booked_slots = MAX(0, booked_slots - ?), updated_at = ? WHERE id = ?`
    )
    .bind(booking.slots, now, booking.tour_id)
    .run();

  return c.json({ success: true, message: "Booking cancelled" });
});

// ============================
// GROUP TOUR ROUTES
// ============================

// GET /api/groups - List group tours
app.get("/groups", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const status = c.req.query("status");

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status === "matching") {
    where += " AND g.matched = 0";
  } else if (status === "matched") {
    where += " AND g.matched = 1";
  }

  const { results } = await db
    .prepare(
      `SELECT g.*, t.name as tour_name, t.region as tour_region
       FROM groups g
       LEFT JOIN tours t ON g.tour_id = t.id
       ${where}
       ORDER BY g.created_at DESC`
    )
    .bind(...params)
    .all();

  // Attach member counts
  const groupsWithMembers = await Promise.all(
    results.map(async (group) => {
      const memberCount = await db
        .prepare("SELECT COALESCE(SUM(slots), 0) as total FROM group_members WHERE group_id = ?")
        .bind(group.id)
        .first<{ total: number }>();

      return {
        ...group,
        currentMembers: memberCount?.total ?? 0,
      };
    })
  );

  return c.json({ data: groupsWithMembers, total: groupsWithMembers.length });
});

// POST /api/groups - Create a group
app.post("/groups", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const body = await c.req.json<{
    tourId: string;
    creatorName: string;
    creatorEmail: string;
    requiredMembers: number;
    date: string;
  }>();

  // Verify tour exists
  const tour = await db
    .prepare("SELECT * FROM tours WHERE id = ?")
    .bind(body.tourId)
    .first();

  if (!tour) {
    return c.json({ error: "Tour not found" }, 404);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Create group
  await db
    .prepare(
      `INSERT INTO groups (id, tour_id, creator_name, creator_email, required_members, matched, date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .bind(id, body.tourId, body.creatorName, body.creatorEmail, body.requiredMembers, body.date, now, now)
    .run();

  // Add creator as first member
  await db
    .prepare(
      `INSERT INTO group_members (id, group_id, guest_name, guest_email, slots, joined_at)
       VALUES (?, ?, ?, ?, 1, ?)`
    )
    .bind(crypto.randomUUID(), id, body.creatorName, body.creatorEmail, now)
    .run();

  return c.json(
    {
      id,
      tourId: body.tourId,
      creatorName: body.creatorName,
      creatorEmail: body.creatorEmail,
      requiredMembers: body.requiredMembers,
      matched: false,
      date: body.date,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// POST /api/groups/:id/join - Join a group
app.post("/groups/:id/join", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const groupId = c.req.param("id");
  const body = await c.req.json<{
    guestName: string;
    guestEmail: string;
    slots: number;
  }>();

  // Check group exists and is not already matched
  const group = await db
    .prepare("SELECT * FROM groups WHERE id = ?")
    .bind(groupId)
    .first<{ id: string; required_members: number; matched: number }>();

  if (!group) {
    return c.json({ error: "Group not found" }, 404);
  }

  if (group.matched) {
    return c.json({ error: "Group is already full and matched" }, 400);
  }

  // Check if already a member
  const existingMember = await db
    .prepare("SELECT id FROM group_members WHERE group_id = ? AND guest_email = ?")
    .bind(groupId, body.guestEmail)
    .first();

  if (existingMember) {
    return c.json({ error: "Already a member of this group" }, 400);
  }

  const now = new Date().toISOString();

  // Add member
  await db
    .prepare(
      `INSERT INTO group_members (id, group_id, guest_name, guest_email, slots, joined_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), groupId, body.guestName, body.guestEmail, body.slots, now)
    .run();

  // Check if group is now full
  const memberCount = await db
    .prepare("SELECT COALESCE(SUM(slots), 0) as total FROM group_members WHERE group_id = ?")
    .bind(groupId)
    .first<{ total: number }>();

  let matched = false;
  if (memberCount && memberCount.total >= group.required_members) {
    matched = true;
    await db
      .prepare("UPDATE groups SET matched = 1, updated_at = ? WHERE id = ?")
      .bind(now, groupId)
      .run();
  }

  return c.json(
    {
      success: true,
      message: matched
        ? "Joined group successfully. Group is now full and matched!"
        : "Joined group successfully. Waiting for more members.",
      matched,
      currentMembers: memberCount?.total ?? 0,
      requiredMembers: group.required_members,
    },
    201
  );
});

export default app;
