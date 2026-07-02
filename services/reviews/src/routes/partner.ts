import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

type Env = { REVIEWS_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const ReviewSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  propertyId: z.string().uuid(),
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string(),
  comment: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// --- Routes ---

// Partner: List reviews for own properties
const listPartnerReviewsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reviews"],
  summary: "List reviews for your properties",
  responses: {
    200: {
      description: "List of reviews for your properties",
      content: {
        "application/json": {
          schema: z.object({
            reviews: z.array(ReviewSchema),
            total: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(listPartnerReviewsRoute, async (c) => {
  // TODO: Extract partner ID from auth token and fetch their property IDs
  const partnerId = "placeholder-partner-id";

  const { results } = await c.env.REVIEWS_DB.prepare(
    `SELECT r.* FROM reviews r
     INNER JOIN properties p ON r.property_id = p.id
     WHERE p.partner_id = ?
     ORDER BY r.created_at DESC`
  )
    .bind(partnerId)
    .all();

  return c.json(
    {
      reviews: results as any[],
      total: results.length,
    },
    200
  );
});

export default app;
