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
  await db.prepare(`CREATE TABLE IF NOT EXISTS tours (tours_id TEXT PRIMARY KEY, tours_name TEXT NOT NULL, tours_description TEXT, tours_region TEXT, tours_image_url TEXT, tours_price_per_slot REAL NOT NULL, tours_max_slots INTEGER NOT NULL DEFAULT 10, tours_booked_slots INTEGER NOT NULL DEFAULT 0, tours_duration TEXT, tours_rating REAL DEFAULT 5.0, tours_highlights TEXT, tours_tour_type TEXT, tours_itinerary TEXT, tours_created_at TEXT, tours_updated_at TEXT)`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS tour_bookings (
      tour_bookings_id TEXT PRIMARY KEY,
      tour_bookings_tour_id TEXT NOT NULL,
      tour_bookings_guest_name TEXT NOT NULL,
      tour_bookings_guest_phone TEXT NOT NULL,
      tour_bookings_guest_email TEXT NOT NULL,
      tour_bookings_slots INTEGER NOT NULL DEFAULT 1,
      tour_bookings_date TEXT NOT NULL,
      tour_bookings_payment_method TEXT,
      tour_bookings_status TEXT NOT NULL DEFAULT 'confirmed',
      tour_bookings_created_at TEXT NOT NULL DEFAULT (datetime('now')),
      tour_bookings_updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tour_bookings_tour_id) REFERENCES tours(tours_id)
    )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS groups (
      groups_id TEXT PRIMARY KEY,
      groups_tour_id TEXT NOT NULL,
      groups_creator_name TEXT NOT NULL,
      groups_creator_email TEXT NOT NULL,
      groups_required_members INTEGER NOT NULL DEFAULT 2,
      groups_matched INTEGER NOT NULL DEFAULT 0,
      groups_date TEXT NOT NULL,
      groups_created_at TEXT NOT NULL DEFAULT (datetime('now')),
      groups_updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (groups_tour_id) REFERENCES tours(tours_id)
    )`).run();

  await db.prepare(`CREATE TABLE IF NOT EXISTS group_members (
      group_members_id TEXT PRIMARY KEY,
      group_members_group_id TEXT NOT NULL,
      group_members_guest_name TEXT NOT NULL,
      group_members_guest_email TEXT NOT NULL,
      group_members_slots INTEGER NOT NULL DEFAULT 1,
      group_members_joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (group_members_group_id) REFERENCES groups(groups_id)
    )`).run();
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
    where += " AND tours_region = ?";
    params.push(region);
  }
  if (type) {
    where += " AND tours_tour_type = ?";
    params.push(type);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM tours ${where}`)
    .bind(...params)
    .first<{ total: number }>();

  const { results } = await db
    .prepare(`SELECT * FROM tours ${where} ORDER BY tours_created_at DESC LIMIT ? OFFSET ?`)
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
  await db.prepare("INSERT INTO tours (tours_id, tours_name, tours_region, tours_image_url, tours_price_per_slot, tours_max_slots, tours_booked_slots, tours_duration, tours_rating, tours_description, tours_highlights, tours_tour_type, tours_itinerary, tours_created_at, tours_updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?, 5.0, ?, ?, ?, ?, ?, ?)").bind(id, data.name, data.region || null, data.image || null, data.pricePerSlot || 0, data.maxSlots || 10, data.duration || null, data.description || null, JSON.stringify(data.highlights || []), data.tourType || 'day', JSON.stringify(data.itinerary || []), now, now).run();
  const tour = await db.prepare("SELECT * FROM tours WHERE tours_id = ?").bind(id).first();
  return c.json(tour, 201);
});

// GET /api/tours/:id - Get tour detail with itinerary
app.get("/:id", async (c) => {
  const db = c.env.BOOKINGS_DB;
  await ensureTourTables(db);

  const id = c.req.param("id");

  const tour = await db
    .prepare("SELECT * FROM tours WHERE tours_id = ?")
    .bind(id)
    .first();

  if (!tour) {
    return c.json({ error: "Tour not found" }, 404);
  }

  // Parse itinerary from JSON string
  const tourWithItinerary = {
    ...tour,
    tours_itinerary: tour.tours_itinerary ? JSON.parse(tour.tours_itinerary as string) : null,
    tours_dates: tour.tours_dates ? JSON.parse(tour.tours_dates as string) : null,
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
    .prepare("SELECT * FROM tours WHERE tours_id = ?")
    .bind(tourId)
    .first<{ tours_id: string; tours_max_slots: number; tours_booked_slots: number }>();

  if (!tour) {
    return c.json({ error: "Tour not found" }, 404);
  }

  const available = tour.tours_max_slots - tour.tours_booked_slots;
  if (body.slots > available) {
    return c.json({ error: `Only ${available} slots available` }, 400);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  // Insert booking
  await db
    .prepare(
      `INSERT INTO tour_bookings (tour_bookings_id, tour_bookings_tour_id, tour_bookings_guest_name, tour_bookings_guest_phone, tour_bookings_guest_email, tour_bookings_slots, tour_bookings_date, tour_bookings_payment_method, tour_bookings_status, tour_bookings_created_at, tour_bookings_updated_at)
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
      `UPDATE tours SET tours_booked_slots = tours_booked_slots + ?, tours_updated_at = ? WHERE tours_id = ?`
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
    where += " AND tb.tour_bookings_guest_email = ?";
    params.push(userId);
  }
  if (status) {
    where += " AND tb.tour_bookings_status = ?";
    params.push(status);
  }

  const { results } = await db
    .prepare(
      `SELECT tb.*, t.tours_name as tour_name, t.tours_region as tour_region, t.tours_tour_type as tour_type
       FROM tour_bookings tb
       LEFT JOIN tours t ON tb.tour_bookings_tour_id = t.tours_id
       ${where}
       ORDER BY tb.tour_bookings_created_at DESC`
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
    .prepare("SELECT * FROM tour_bookings WHERE tour_bookings_id = ?")
    .bind(bookingId)
    .first<{ tour_bookings_id: string; tour_bookings_tour_id: string; tour_bookings_slots: number; tour_bookings_status: string }>();

  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }

  if (booking.tour_bookings_status === "cancelled") {
    return c.json({ error: "Booking is already cancelled" }, 400);
  }

  const now = new Date().toISOString();

  // Update booking status
  await db
    .prepare(
      `UPDATE tour_bookings SET tour_bookings_status = 'cancelled', tour_bookings_updated_at = ? WHERE tour_bookings_id = ?`
    )
    .bind(now, bookingId)
    .run();

  // Decrement booked slots on the tour
  await db
    .prepare(
      `UPDATE tours SET tours_booked_slots = MAX(0, tours_booked_slots - ?), tours_updated_at = ? WHERE tours_id = ?`
    )
    .bind(booking.tour_bookings_slots, now, booking.tour_bookings_tour_id)
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
    where += " AND g.groups_matched = 0";
  } else if (status === "matched") {
    where += " AND g.groups_matched = 1";
  }

  const { results } = await db
    .prepare(
      `SELECT g.*, t.tours_name as tour_name, t.tours_region as tour_region
       FROM groups g
       LEFT JOIN tours t ON g.groups_tour_id = t.tours_id
       ${where}
       ORDER BY g.groups_created_at DESC`
    )
    .bind(...params)
    .all();

  // Attach member counts
  const groupsWithMembers = await Promise.all(
    results.map(async (group) => {
      const memberCount = await db
        .prepare("SELECT COALESCE(SUM(group_members_slots), 0) as total FROM group_members WHERE group_members_group_id = ?")
        .bind(group.groups_id)
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
    .prepare("SELECT * FROM tours WHERE tours_id = ?")
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
      `INSERT INTO groups (groups_id, groups_tour_id, groups_creator_name, groups_creator_email, groups_required_members, groups_matched, groups_date, groups_created_at, groups_updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`
    )
    .bind(id, body.tourId, body.creatorName, body.creatorEmail, body.requiredMembers, body.date, now, now)
    .run();

  // Add creator as first member
  await db
    .prepare(
      `INSERT INTO group_members (group_members_id, group_members_group_id, group_members_guest_name, group_members_guest_email, group_members_slots, group_members_joined_at)
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
    .prepare("SELECT * FROM groups WHERE groups_id = ?")
    .bind(groupId)
    .first<{ groups_id: string; groups_required_members: number; groups_matched: number }>();

  if (!group) {
    return c.json({ error: "Group not found" }, 404);
  }

  if (group.groups_matched) {
    return c.json({ error: "Group is already full and matched" }, 400);
  }

  // Check if already a member
  const existingMember = await db
    .prepare("SELECT group_members_id FROM group_members WHERE group_members_group_id = ? AND group_members_guest_email = ?")
    .bind(groupId, body.guestEmail)
    .first();

  if (existingMember) {
    return c.json({ error: "Already a member of this group" }, 400);
  }

  const now = new Date().toISOString();

  // Add member
  await db
    .prepare(
      `INSERT INTO group_members (group_members_id, group_members_group_id, group_members_guest_name, group_members_guest_email, group_members_slots, group_members_joined_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), groupId, body.guestName, body.guestEmail, body.slots, now)
    .run();

  // Check if group is now full
  const memberCount = await db
    .prepare("SELECT COALESCE(SUM(group_members_slots), 0) as total FROM group_members WHERE group_members_group_id = ?")
    .bind(groupId)
    .first<{ total: number }>();

  let matched = false;
  if (memberCount && memberCount.total >= group.groups_required_members) {
    matched = true;
    await db
      .prepare("UPDATE groups SET groups_matched = 1, groups_updated_at = ? WHERE groups_id = ?")
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
      requiredMembers: group.groups_required_members,
    },
    201
  );
});

export default app;
