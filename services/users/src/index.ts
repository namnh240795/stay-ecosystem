import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { usersRoutes, applicationsRoutes } from "./routes";

type Bindings = {
  USERS_DB: D1Database;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// --- Middleware ---
app.use("*", cors());

// --- Routes ---
app.route("/api/users", usersRoutes);
app.route("/api/admin", applicationsRoutes);
app.route("/api/customer", applicationsRoutes);

// --- OpenAPI Spec ---
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Users Service",
    version: "1.0.0",
    description: "User profiles and partner application management",
  },
  servers: [
    { url: "http://localhost:8787", description: "Local development" },
  ],
});

// --- Scalar API Reference ---
app.get("/docs", apiReference({ spec: { url: "/openapi.json" } }));

// --- Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "users" }));

// --- Error Handler ---
app.onError((err, c) => {
  console.error("Users service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
