import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

type Env = { BOOKINGS_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const BookingSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  propertyId: z.string().uuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().positive(),
  totalPrice: z.number(),
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UpdateBookingSchema = z.object({
  status: z.enum(["pending", "confirmed", "cancelled", "completed"]),
});

// --- Routes ---

// Admin: List all bookings
const listAllRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Bookings"],
  summary: "List all bookings",
  responses: {
    200: {
      description: "List of all bookings",
      content: {
        "application/json": {
          schema: z.object({
            bookings: z.array(BookingSchema),
            total: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(listAllRoute, async (c) => {
  const { results } = await c.env.BOOKINGS_DB.prepare(
    "SELECT * FROM bookings ORDER BY created_at DESC"
  ).all();

  return c.json(
    {
      bookings: results as any[],
      total: results.length,
    },
    200
  );
});

// Admin: Manage any booking
const manageBookingRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Bookings"],
  summary: "Update any booking status",
  request: {
    body: {
      description: "Booking update",
      required: true,
      content: {
        "application/json": { schema: UpdateBookingSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Booking updated",
      content: { "application/json": { schema: BookingSchema } },
    },
    404: { description: "Booking not found" },
  },
});

app.openapi(manageBookingRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  const result = await c.env.BOOKINGS_DB.prepare(
    `UPDATE bookings
     SET status = ?, updated_at = datetime('now')
     WHERE id = ? RETURNING *`
  )
    .bind(body.status, id)
    .first();

  if (!result) {
    return c.json({ error: "Booking not found" }, 404);
  }

  return c.json(result as any, 200);
});

export default app;
