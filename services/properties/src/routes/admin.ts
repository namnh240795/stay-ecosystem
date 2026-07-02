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

const UpdatePropertySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(10).max(5000).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  pricePerNight: z.number().positive().optional(),
  maxGuests: z.number().int().positive().optional(),
  bedrooms: z.number().int().min(0).optional(),
  bathrooms: z.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(["published", "draft", "archived"]).optional(),
});

// --- Routes ---

// Admin: List all properties
const listAllRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Properties"],
  summary: "List all properties",
  responses: {
    200: {
      description: "List of all properties",
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

app.openapi(listAllRoute, async (c) => {
  const { results } = await c.env.PROPERTIES_DB.prepare(
    "SELECT * FROM properties ORDER BY created_at DESC"
  ).all();

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

// Admin: Update any property
const updateAnyRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Properties"],
  summary: "Update any property",
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

app.openapi(updateAnyRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

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

  if (!result) {
    return c.json({ error: "Property not found" }, 404);
  }

  return c.json(result as any, 200);
});

// Admin: Delete any property
const deleteAnyRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Properties"],
  summary: "Delete any property",
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

app.openapi(deleteAnyRoute, async (c) => {
  const id = c.req.param("id");

  const result = await c.env.PROPERTIES_DB.prepare(
    "DELETE FROM properties WHERE id = ? RETURNING id"
  )
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Property not found" }, 404);
  }

  return c.json({ success: true }, 200);
});

export default app;
