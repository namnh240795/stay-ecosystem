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
    where += " AND longterm_apartments_status = ?";
    params.push(status);
  }
  if (city) {
    where += " AND longterm_apartments_location LIKE ?";
    params.push(`%${city}%`);
  }
  if (search) {
    where += " AND (longterm_apartments_name LIKE ? OR longterm_apartments_location LIKE ? OR longterm_apartments_description LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM longterm_apartments ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM longterm_apartments ${where} ORDER BY longterm_apartments_created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results.map((r: any) => ({
      ...r,
      amenities: r.longterm_apartments_amenities ? JSON.parse(r.longterm_apartments_amenities) : [],
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
    .prepare("SELECT * FROM longterm_apartments WHERE longterm_apartments_id = ?")
    .bind(c.req.param("id"))
    .first();

  if (!apartment) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  return c.json({
    ...apartment,
    amenities: (apartment as any).longterm_apartments_amenities
      ? JSON.parse((apartment as any).longterm_apartments_amenities)
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
        longterm_apartments_id, longterm_apartments_partner_id, longterm_apartments_name, longterm_apartments_location, longterm_apartments_type, longterm_apartments_area, longterm_apartments_bedrooms, longterm_apartments_bathrooms,
        longterm_apartments_monthly_price, longterm_apartments_description, longterm_apartments_amenities, longterm_apartments_available_from,
        longterm_apartments_has_virtual_tour, longterm_apartments_virtual_tour_url, longterm_apartments_pet_friendly,
        longterm_apartments_maintenance_status, longterm_apartments_estimated_repair_cost, longterm_apartments_maintenance_notes,
        longterm_apartments_status, longterm_apartments_created_at, longterm_apartments_updated_at
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
    .prepare("SELECT * FROM longterm_apartments WHERE longterm_apartments_id = ?")
    .bind(id)
    .first();

  return c.json(
    {
      ...created,
      amenities: (created as any).longterm_apartments_amenities
        ? JSON.parse((created as any).longterm_apartments_amenities)
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
    .prepare("SELECT * FROM longterm_apartments WHERE longterm_apartments_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    partnerId: "longterm_apartments_partner_id",
    name: "longterm_apartments_name",
    location: "longterm_apartments_location",
    type: "longterm_apartments_type",
    area: "longterm_apartments_area",
    bedrooms: "longterm_apartments_bedrooms",
    bathrooms: "longterm_apartments_bathrooms",
    monthlyPrice: "longterm_apartments_monthly_price",
    description: "longterm_apartments_description",
    availableFrom: "longterm_apartments_available_from",
    virtualTourUrl: "longterm_apartments_virtual_tour_url",
    maintenanceStatus: "longterm_apartments_maintenance_status",
    estimatedRepairCost: "longterm_apartments_estimated_repair_cost",
    maintenanceNotes: "longterm_apartments_maintenance_notes",
    status: "longterm_apartments_status",
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    if (data[key] !== undefined) {
      fields.push(`${dbCol} = ?`);
      values.push(data[key]);
    }
  }

  if (data.amenities !== undefined) {
    fields.push("longterm_apartments_amenities = ?");
    values.push(JSON.stringify(data.amenities));
  }
  if (data.hasVirtualTour !== undefined) {
    fields.push("longterm_apartments_has_virtual_tour = ?");
    values.push(data.hasVirtualTour ? 1 : 0);
  }
  if (data.petFriendly !== undefined) {
    fields.push("longterm_apartments_pet_friendly = ?");
    values.push(data.petFriendly ? 1 : 0);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("longterm_apartments_updated_at = ?");
  values.push(now);
  values.push(id);

  await db
    .prepare(
      `UPDATE longterm_apartments SET ${fields.join(", ")} WHERE longterm_apartments_id = ?`
    )
    .bind(...values)
    .run();

  const updated = await db
    .prepare("SELECT * FROM longterm_apartments WHERE longterm_apartments_id = ?")
    .bind(id)
    .first();

  return c.json({
    ...updated,
    amenities: (updated as any).longterm_apartments_amenities
      ? JSON.parse((updated as any).longterm_apartments_amenities)
      : [],
  });
});

// DELETE /api/admin/apartments/:id - Delete apartment
app.delete("/api/admin/apartments/:id", async (c) => {
  const db = c.env.PROPERTIES_DB;
  const id = c.req.param("id");

  const existing = await db
    .prepare("SELECT * FROM longterm_apartments WHERE longterm_apartments_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Apartment not found" }, 404);
  }

  await db
    .prepare("DELETE FROM longterm_apartments WHERE longterm_apartments_id = ?")
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
    where += " AND longterm_contracts_status = ?";
    params.push(status);
  }

  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM longterm_contracts ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await db
    .prepare(
      `SELECT * FROM longterm_contracts ${where} ORDER BY longterm_contracts_created_at DESC LIMIT ? OFFSET ?`
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
        longterm_contracts_id, longterm_contracts_apartment_id, longterm_contracts_apartment_name, longterm_contracts_location, longterm_contracts_monthly_price,
        longterm_contracts_lease_term, longterm_contracts_tenant_name, longterm_contracts_tenant_phone, longterm_contracts_tenant_email,
        longterm_contracts_signed_date, longterm_contracts_status, longterm_contracts_created_at, longterm_contracts_updated_at
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
    .prepare("SELECT * FROM longterm_contracts WHERE longterm_contracts_id = ?")
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
    .prepare("SELECT * FROM longterm_contracts WHERE longterm_contracts_id = ?")
    .bind(id)
    .first();
  if (!existing) {
    return c.json({ error: "Contract not found" }, 404);
  }

  await db
    .prepare("UPDATE longterm_contracts SET longterm_contracts_status = ?, longterm_contracts_updated_at = ? WHERE longterm_contracts_id = ?")
    .bind(data.status, now, id)
    .run();

  const updated = await db
    .prepare("SELECT * FROM longterm_contracts WHERE longterm_contracts_id = ?")
    .bind(id)
    .first();

  return c.json(updated);
});

export default app;
