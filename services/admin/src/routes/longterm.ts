import { Hono } from "hono";

type Bindings = {
  USERS_DB: D1Database;
  PROPERTIES_DB: D1Database;
  BOOKINGS_DB: D1Database;
  PAYMENTS_DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ==================== APARTMENTS ====================

// GET /api/admin/apartments - List apartments with pagination, search, status filter
app.get("/api/admin/apartments", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const city = c.req.query("city");
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }
  if (city) {
    where += " AND location LIKE ?";
    params.push(`%${city}%`);
  }
  if (search) {
    where += " AND (name LIKE ? OR location LIKE ? OR description LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM longterm_apartments ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM longterm_apartments ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results.map((r: any) => ({
      ...r,
      amenities: r.amenities ? JSON.parse(r.amenities) : [],
    })),
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// GET /api/admin/apartments/:id - Get apartment by ID
app.get("/api/admin/apartments/:id", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const apartment = await db
    .prepare("SELECT * FROM longterm_apartments WHERE id = ?")
    .bind(c.req.param("id"))
    .first();

  if (!apartment) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  return c.json({
    ...apartment,
    amenities: (apartment as any).amenities
      ? JSON.parse((apartment as any).amenities)
      : [],
  });
});

// POST /api/admin/apartments - Create apartment
app.post("/api/admin/apartments", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO longterm_apartments (
        id, partner_id, name, location, type, area, bedrooms, bathrooms,
        monthly_price, description, amenities, available_from,
        has_virtual_tour, virtual_tour_url, pet_friendly,
        maintenance_status, estimated_repair_cost, maintenance_notes,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(
      id,
      data.partnerId,
      data.name,
      data.location,
      data.type,
      data.area || null,
      data.bedrooms || 1,
      data.bathrooms || 1,
      data.monthlyPrice,
      data.description || "",
      JSON.stringify(data.amenities || []),
      data.availableFrom || null,
      data.hasVirtualTour ? 1 : 0,
      data.virtualTourUrl || null,
      data.petFriendly ? 1 : 0,
      data.maintenanceStatus || null,
      data.estimatedRepairCost || null,
      data.maintenanceNotes || null,
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM longterm_apartments WHERE id = ?")
    .bind(id)
    .first();

  return c.json(
    {
      ...created,
      amenities: (created as any).amenities
        ? JSON.parse((created as any).amenities)
        : [],
    },
    201
  );
});

// PUT /api/admin/apartments/:id - Update apartment
app.put("/api/admin/apartments/:id", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db
    .prepare("SELECT * FROM longterm_apartments WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    partnerId: "partner_id",
    name: "name",
    location: "location",
    type: "type",
    area: "area",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    monthlyPrice: "monthly_price",
    description: "description",
    availableFrom: "available_from",
    virtualTourUrl: "virtual_tour_url",
    maintenanceStatus: "maintenance_status",
    estimatedRepairCost: "estimated_repair_cost",
    maintenanceNotes: "maintenance_notes",
    status: "status",
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${dbCol} = ?`);
      values.push(data[key]);
    }
  }

  if (data.amenities !== undefined) {
    fields.push("amenities = ?");
    values.push(JSON.stringify(data.amenities));
  }
  if (data.hasVirtualTour !== undefined) {
    fields.push("has_virtual_tour = ?");
    values.push(data.hasVirtualTour ? 1 : 0);
  }
  if (data.petFriendly !== undefined) {
    fields.push("pet_friendly = ?");
    values.push(data.petFriendly ? 1 : 0);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  await db
    .prepare(
      `UPDATE longterm_apartments SET ${fields.join(", ")} WHERE id = ?`
    )
    .bind(...values)
    .run();

  const updated = await db
    .prepare("SELECT * FROM longterm_apartments WHERE id = ?")
    .bind(id)
    .first();

  return c.json({
    ...updated,
    amenities: (updated as any).amenities
      ? JSON.parse((updated as any).amenities)
      : [],
  });
});

// DELETE /api/admin/apartments/:id - Delete apartment
app.delete("/api/admin/apartments/:id", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const id = c.req.param("id");

  const existing = await db
    .prepare("SELECT * FROM longterm_apartments WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  await db
    .prepare("DELETE FROM longterm_apartments WHERE id = ?")
    .bind(id)
    .run();

  return c.json({ success: true });
});

// ==================== CONTRACTS ====================

// GET /api/admin/contracts - List lease contracts
app.get("/api/admin/contracts", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM longterm_contracts ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM longterm_contracts ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`
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

// POST /api/admin/contracts - Create contract
app.post("/api/admin/contracts", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const data = await c.req.json();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO longterm_contracts (
        id, apartment_id, apartment_name, location, monthly_price,
        lease_term, tenant_name, tenant_phone, tenant_email,
        signed_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`
    )
    .bind(
      id,
      data.aptId,
      data.aptName,
      data.location,
      data.monthlyPrice,
      data.leaseTerm,
      data.tenantName,
      data.tenantPhone,
      data.tenantEmail,
      data.signedDate || null,
      now,
      now
    )
    .run();

  const created = await db
    .prepare("SELECT * FROM longterm_contracts WHERE id = ?")
    .bind(id)
    .first();

  return c.json(created, 201);
});

// PATCH /api/admin/contracts/:id/status - Update contract status
app.patch("/api/admin/contracts/:id/status", async (c) => {
  const db = c.env.BOOKINGS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db
    .prepare("SELECT * FROM longterm_contracts WHERE id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Contract not found" }, 404);
  }

  await db
    .prepare("UPDATE longterm_contracts SET status = ?, updated_at = ? WHERE id = ?")
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM longterm_contracts WHERE id = ?")
    .bind(id)
    .first();

  return c.json(updated);
});

export default app;
