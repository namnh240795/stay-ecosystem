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

// Admin: List all reviews
const listAllRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reviews"],
  summary: "List all reviews",
  responses: {
    200: {
      description: "List of all reviews",
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

app.openapi(listAllRoute, async (c) => {
  const { results } = await c.env.REVIEWS_DB.prepare(
    "SELECT * FROM reviews ORDER BY created_at DESC"
  ).all();

  return c.json(
    {
      reviews: results as any[],
      total: results.length,
    },
    200
  );
});

// Admin: Delete any review
const deleteReviewRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Reviews"],
  summary: "Delete any review",
  responses: {
    200: {
      description: "Review deleted",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: "Review not found" },
  },
});

app.openapi(deleteReviewRoute, async (c) => {
  const id = c.req.param("id");

  const result = await c.env.REVIEWS_DB.prepare(
    "DELETE FROM reviews WHERE id = ? RETURNING id"
  )
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "Review not found" }, 404);
  }

  // TODO: Recalculate property average rating after deletion

  return c.json({ success: true }, 200);
});

export default app;
