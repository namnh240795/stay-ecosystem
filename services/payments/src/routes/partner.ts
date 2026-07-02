import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

type Env = { PAYMENTS_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const PaymentSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  customerId: z.string().uuid(),
  amount: z.number(),
  currency: z.string(),
  method: z.string(),
  status: z.enum(["pending", "completed", "failed", "refunded"]),
  stripePaymentIntentId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// --- Routes ---

// Partner: List payments for own bookings
const listPartnerPaymentsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Payments"],
  summary: "List payments for your bookings",
  responses: {
    200: {
      description: "List of payments for your bookings",
      content: {
        "application/json": {
          schema: z.object({
            payments: z.array(PaymentSchema),
            total: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(listPartnerPaymentsRoute, async (c) => {
  // TODO: Extract partner ID from auth token and fetch their property/booking IDs
  const partnerId = "placeholder-partner-id";

  const { results } = await c.env.PAYMENTS_DB.prepare(
    `SELECT p.* FROM payments p
     INNER JOIN bookings b ON p.booking_id = b.id
     INNER JOIN properties prop ON b.property_id = prop.id
     WHERE prop.partner_id = ?
     ORDER BY p.created_at DESC`
  )
    .bind(partnerId)
    .all();

  return c.json(
    {
      payments: results as any[],
      total: results.length,
    },
    200
  );
});

export default app;
