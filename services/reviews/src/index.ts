import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { customerRoutes, partnerRoutes, adminRoutes } from "./routes";

type Bindings = {
  REVIEWS_DB: D1Database;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// --- Middleware ---
app.use("*", cors());

// --- Role-based Routes ---
app.route("/api/customer/reviews", customerRoutes);
app.route("/api/partner/reviews", partnerRoutes);
app.route("/api/admin/reviews", adminRoutes);

// --- OpenAPI Spec ---
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Reviews Service",
    version: "1.0.0",
    description: "Reviews and ratings management with role-based access",
  },
  servers: [
    { url: "http://localhost:8787", description: "Local development" },
  ],
});

// --- Scalar API Reference ---
app.get("/docs", apiReference({ spec: { url: "/openapi.json" } }));

// --- Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "reviews" }));

// --- Error Handler ---
app.onError((err, c) => {
  console.error("Reviews service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
