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

const CreateBookingSchema = z.object({
  propertyId: z.string().uuid(),
  checkIn: z.string().datetime(),
  checkOut: z.string().datetime(),
  guests: z.number().int().positive(),
});

// --- Routes ---

// Customer: Create booking
const createBookingRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Bookings"],
  summary: "Create a new booking",
  request: {
    body: {
      description: "Booking data",
      required: true,
      content: {
        "application/json": { schema: CreateBookingSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Booking created",
      content: { "application/json": { schema: BookingSchema } },
    },
    400: { description: "Invalid input" },
  },
});

app.openapi(createBookingRoute, async (c) => {
  const body = c.req.valid("json");

  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  // TODO: Fetch property price and calculate total
  const pricePerNight = 100; // placeholder
  const checkInDate = new Date(body.checkIn);
  const checkOutDate = new Date(body.checkOut);
  const nights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalPrice = nights * pricePerNight;

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.BOOKINGS_DB.prepare(
    `INSERT INTO bookings (id, customer_id, property_id, check_in, check_out, guests, total_price, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(
      id,
      customerId,
      body.propertyId,
      body.checkIn,
      body.checkOut,
      body.guests,
      totalPrice,
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      customerId,
      propertyId: body.propertyId,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guests: body.guests,
      totalPrice,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// Customer: List own bookings
const listOwnBookingsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Bookings"],
  summary: "List your bookings",
  responses: {
    200: {
      description: "List of your bookings",
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

app.openapi(listOwnBookingsRoute, async (c) => {
  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  const { results } = await c.env.BOOKINGS_DB.prepare(
    "SELECT * FROM bookings WHERE customer_id = ? ORDER BY created_at DESC"
  )
    .bind(customerId)
    .all();

  return c.json(
    {
      bookings: results as any[],
      total: results.length,
    },
    200
  );
});

export default app;
