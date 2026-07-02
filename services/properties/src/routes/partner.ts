import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

type Env = { PROPERTIES_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const PropertySchema = z.object({
  id: z.string().uuid(),
  partnerId: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  address: z.string(),
  city: z.string(),
  country: z.string(),
  pricePerNight: z.number(),
  maxGuests: z.number().int(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  amenities: z.array(z.string()),
  images: z.array(z.string()),
  status: z.enum(["published", "draft", "archived"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const CreatePropertySchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10).max(5000),
  address: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  pricePerNight: z.number().positive(),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["published", "draft"]).optional(),
});

const UpdatePropertySchema = CreatePropertySchema.partial();

// --- Routes ---

// Partner: List own properties
const listOwnRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Properties"],
  summary: "List your properties",
  responses: {
    200: {
      description: "List of your properties",
      content: {
        "application/json": {
          schema: z.object({
            properties: z.array(PropertySchema),
            total: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(listOwnRoute, async (c) => {
  // TODO: Extract partner ID from auth token
  const partnerId = "placeholder-partner-id";

  const { results } = await c.env.PROPERTIES_DB.prepare(
    "SELECT * FROM properties WHERE partner_id = ? ORDER BY created_at DESC"
  )
    .bind(partnerId)
    .all();

  return c.json(
    {
      properties: results.map((r: any) => ({
        ...r,
        amenities: JSON.parse(r.amenities || "[]"),
        images: JSON.parse(r.images || "[]"),
      })) as any[],
      total: results.length,
    },
    200
  );
});

// Partner: Create property
const createRoute_ = createRoute({
  method: "post",
  path: "/",
  tags: ["Properties"],
  summary: "Create a new property",
  request: {
    body: {
      description: "Property data",
      required: true,
      content: {
        "application/json": { schema: CreatePropertySchema },
      },
    },
  },
  responses: {
    201: {
      description: "Property created",
      content: { "application/json": { schema: PropertySchema } },
    },
    400: { description: "Invalid input" },
  },
});

app.openapi(createRoute_, async (c) => {
  const body = c.req.valid("json");

  // TODO: Extract partner ID from auth token
  const partnerId = "placeholder-partner-id";
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.PROPERTIES_DB.prepare(
    `INSERT INTO properties (id, partner_id, title, description, address, city, country, price_per_night, max_guests, bedrooms, bathrooms, amenities, images, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      partnerId,
      body.title,
      body.description,
      body.address,
      body.city,
      body.country,
      body.pricePerNight,
      body.maxGuests,
      body.bedrooms,
      body.bathrooms,
      JSON.stringify(body.amenities ?? []),
      JSON.stringify(body.images ?? []),
      body.status ?? "draft",
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      partnerId,
      ...body,
      amenities: body.amenities ?? [],
      images: body.images ?? [],
      status: body.status ?? "draft",
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// Partner: Update own property
const updateRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Properties"],
  summary: "Update your property",
  request: {
    body: {
      description: "Property update data",
      required: true,
      content: {
        "application/json": { schema: UpdatePropertySchema },
      },
    },
  },
  responses: {
    200: {
      description: "Property updated",
      content: { "application/json": { schema: PropertySchema } },
    },
    404: { description: "Property not found" },
  },
});

app.openapi(updateRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // TODO: Extract partner ID from auth token
  const partnerId = "placeholder-partner-id";

  // Verify ownership
  const existing = await c.env.PROPERTIES_DB.prepare(
    "SELECT id FROM properties WHERE id = ? AND partner_id = ?"
  )
    .bind(id, partnerId)
    .first();

  if (!existing) {
    return c.json({ error: "Property not found" }, 404);
  }

  const fields: string[] = [];
  const values: any[] = [];

  const fieldMap: Record<string, string> = {
    title: "title",
    description: "description",
    address: "address",
    city: "city",
    country: "country",
    pricePerNight: "price_per_night",
    maxGuests: "max_guests",
    bedrooms: "bedrooms",
    bathrooms: "bathrooms",
    status: "status",
  };

  for (const [key, dbCol] of Object.entries(fieldMap)) {
    const val = (body as any)[key];
    if (val !== undefined) {
      fields.push(`${dbCol} = ?`);
      values.push(val);
    }
  }

  if (body.amenities !== undefined) {
    fields.push("amenities = ?");
    values.push(JSON.stringify(body.amenities));
  }
  if (body.images !== undefined) {
    fields.push("images = ?");
    values.push(JSON.stringify(body.images));
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const result = await c.env.PROPERTIES_DB.prepare(
    `UPDATE properties SET ${fields.join(", ")} WHERE id = ? RETURNING *`
  )
    .bind(...values)
    .first();

  return c.json(result as any, 200);
});

// Partner: Delete own property
const deleteRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Properties"],
  summary: "Delete your property",
  responses: {
    200: {
      description: "Property deleted",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: "Property not found" },
  },
});

app.openapi(deleteRoute, async (c) => {
  const id = c.req.param("id");

  // TODO: Extract partner ID from auth token
  const partnerId = "placeholder-partner-id";

  const result = await c.env.PROPERTIES_DB.prepare(
    "DELETE FROM properties WHERE id = ? AND partner_id = ? RETURNING id"
  )
    .bind(id, partnerId)
    .first();

  if (!result) {
    return c.json({ error: "Property not found" }, 404);
  }

  return c.json({ success: true }, 200);
});

export default app;
