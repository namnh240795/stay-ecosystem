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
  averageRating: z.number().optional(),
  reviewCount: z.number().int().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// --- Routes ---

// Customer: Browse published properties
const listPublishedRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Properties"],
  summary: "Browse published properties",
  responses: {
    200: {
      description: "List of published properties",
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

app.openapi(listPublishedRoute, async (c) => {
  const { results } = await c.env.PROPERTIES_DB.prepare(
    "SELECT * FROM properties WHERE status = 'published' ORDER BY created_at DESC"
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

// Customer: View property detail
const getDetailRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Properties"],
  summary: "View property detail",
  responses: {
    200: {
      description: "Property details",
      content: { "application/json": { schema: PropertySchema } },
    },
    404: { description: "Property not found" },
  },
});

app.openapi(getDetailRoute, async (c) => {
  const id = c.req.param("id");

  const property = await c.env.PROPERTIES_DB.prepare(
    "SELECT * FROM properties WHERE id = ? AND status = 'published'"
  )
    .bind(id)
    .first();

  if (!property) {
    return c.json({ error: "Property not found" }, 404);
  }

  const p = property as any;
  return c.json(
    {
      ...p,
      amenities: JSON.parse(p.amenities || "[]"),
      images: JSON.parse(p.images || "[]"),
    },
    200
  );
});

export default app;
