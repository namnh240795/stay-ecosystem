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
  status: z.enum(["confirmed", "cancelled"]),
});

// --- Routes ---

// Partner: List bookings for own properties
const listPartnerBookingsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Bookings"],
  summary: "List bookings for your properties",
  responses: {
    200: {
      description: "List of bookings for your properties",
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

app.openapi(listPartnerBookingsRoute, async (c) => {
  // TODO: Extract partner ID from auth token and fetch their property IDs
  const partnerId = "placeholder-partner-id";

  const { results } = await c.env.BOOKINGS_DB.prepare(
    `SELECT b.* FROM bookings b
     INNER JOIN properties p ON b.property_id = p.id
     WHERE p.partner_id = ?
     ORDER BY b.created_at DESC`
  )
    .bind(partnerId)
    .all();

  return c.json(
    {
      bookings: results as any[],
      total: results.length,
    },
    200
  );
});

// Partner: Confirm or cancel booking
const updateBookingRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Bookings"],
  summary: "Confirm or cancel a booking",
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

app.openapi(updateBookingRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // TODO: Extract partner ID from auth token and verify ownership
  const partnerId = "placeholder-partner-id";

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
