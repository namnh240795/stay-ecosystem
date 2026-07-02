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

const RefundPaymentSchema = z.object({
  status: z.enum(["refunded"]),
  reason: z.string().optional(),
});

// --- Routes ---

// Admin: List all payments
const listAllRoute = createRoute({
  method: "get",
  path: "/",
  tags: ["Payments"],
  summary: "List all payments",
  responses: {
    200: {
      description: "List of all payments",
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

app.openapi(listAllRoute, async (c) => {
  const { results } = await c.env.PAYMENTS_DB.prepare(
    "SELECT * FROM payments ORDER BY created_at DESC"
  ).all();

  return c.json(
    {
      payments: results as any[],
      total: results.length,
    },
    200
  );
});

// Admin: Refund payment
const refundPaymentRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Payments"],
  summary: "Refund a payment",
  request: {
    body: {
      description: "Refund data",
      required: true,
      content: {
        "application/json": { schema: RefundPaymentSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Payment refunded",
      content: { "application/json": { schema: PaymentSchema } },
    },
    404: { description: "Payment not found" },
  },
});

app.openapi(refundPaymentRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // TODO: Integrate with actual payment provider to process refund
  const result = await c.env.PAYMENTS_DB.prepare(
    `UPDATE payments
     SET status = ?, updated_at = datetime('now')
     WHERE id = ? RETURNING *`
  )
    .bind(body.status, id)
    .first();

  if (!result) {
    return c.json({ error: "Payment not found" }, 404);
  }

  // TODO: Log refund reason in a separate table
  if (body.reason) {
    console.log(`Payment ${id} refunded. Reason: ${body.reason}`);
  }

  return c.json(result as any, 200);
});

export default app;
