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

const CreateReviewSchema = z.object({
  propertyId: z.string().uuid(),
  bookingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  comment: z.string().min(10).max(5000),
});

// --- Routes ---

// Customer: Create review
const createReviewRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Reviews"],
  summary: "Create a review for a property",
  request: {
    body: {
      description: "Review data",
      required: true,
      content: {
        "application/json": { schema: CreateReviewSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Review created",
      content: { "application/json": { schema: ReviewSchema } },
    },
    400: { description: "Invalid input" },
  },
});

app.openapi(createReviewRoute, async (c) => {
  const body = c.req.valid("json");

  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  // TODO: Verify that the booking exists, belongs to the customer, and is completed
  // TODO: Check that no review already exists for this booking

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.REVIEWS_DB.prepare(
    `INSERT INTO reviews (id, customer_id, property_id, booking_id, rating, title, comment, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      customerId,
      body.propertyId,
      body.bookingId,
      body.rating,
      body.title,
      body.comment,
      now,
      now
    )
    .run();

  // TODO: Update property average rating in properties service
  // This could be done via an event/message to the properties service

  return c.json(
    {
      id,
      customerId,
      propertyId: body.propertyId,
      bookingId: body.bookingId,
      rating: body.rating,
      title: body.title,
      comment: body.comment,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// Customer: List own reviews
const listOwnReviewsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Reviews"],
  summary: "List your reviews",
  responses: {
    200: {
      description: "List of your reviews",
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

app.openapi(listOwnReviewsRoute, async (c) => {
  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  const { results } = await c.env.REVIEWS_DB.prepare(
    "SELECT * FROM reviews WHERE customer_id = ? ORDER BY created_at DESC"
  )
    .bind(customerId)
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
