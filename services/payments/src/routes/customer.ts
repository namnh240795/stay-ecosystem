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

const CreatePaymentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  method: z.string().min(1),
});

// --- Routes ---

// Customer: Create payment
const createPaymentRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["Payments"],
  summary: "Create a payment for a booking",
  request: {
    body: {
      description: "Payment data",
      required: true,
      content: {
        "application/json": { schema: CreatePaymentSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Payment created",
      content: { "application/json": { schema: PaymentSchema } },
    },
    400: { description: "Invalid input" },
  },
});

app.openapi(createPaymentRoute, async (c) => {
  const body = c.req.valid("json");

  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  // TODO: Integrate with actual payment provider (Stripe, etc.)
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.PAYMENTS_DB.prepare(
    `INSERT INTO payments (id, booking_id, customer_id, amount, currency, method, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(
      id,
      body.bookingId,
      customerId,
      body.amount,
      body.currency,
      body.method,
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      bookingId: body.bookingId,
      customerId,
      amount: body.amount,
      currency: body.currency,
      method: body.method,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// Customer: List own payments
const listOwnPaymentsRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Payments"],
  summary: "List your payments",
  responses: {
    200: {
      description: "List of your payments",
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

app.openapi(listOwnPaymentsRoute, async (c) => {
  // TODO: Extract customer ID from auth token
  const customerId = "placeholder-customer-id";

  const { results } = await c.env.PAYMENTS_DB.prepare(
    "SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC"
  )
    .bind(customerId)
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
