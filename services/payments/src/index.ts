import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { customerRoutes, partnerRoutes, adminRoutes } from "./routes";

type Bindings = {
  PAYMENTS_DB: D1Database;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// --- Middleware ---
app.use("*", cors());

// --- Role-based Routes ---
app.route("/api/customer/payments", customerRoutes);
app.route("/api/partner/payments", partnerRoutes);
app.route("/api/admin/payments", adminRoutes);

// --- OpenAPI Spec ---
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Payments Service",
    version: "1.0.0",
    description: "Payment processing with role-based access",
  },
  servers: [
    { url: "http://localhost:8787", description: "Local development" },
  ],
});

// --- Scalar API Reference ---
app.get("/docs", apiReference({ spec: { url: "/openapi.json" } }));

// --- Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "payments" }));

// --- Error Handler ---
app.onError((err, c) => {
  console.error("Payments service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
