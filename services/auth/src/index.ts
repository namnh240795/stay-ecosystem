import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { apiReference } from "@scalar/hono-api-reference";
import { authRoutes } from "./routes";

type Bindings = {
  AUTH0_DOMAIN: string;
  AUTH0_CLIENT_ID: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>();

// --- Middleware ---
app.use("*", cors());

// --- Routes ---
app.route("/api/auth", authRoutes);

// --- OpenAPI Spec ---
app.doc("/openapi.json", {
  openapi: "3.1.0",
  info: {
    title: "Auth Service",
    version: "1.0.0",
    description: "Authentication service with Auth0 integration",
  },
  servers: [
    { url: "http://localhost:8787", description: "Local development" },
  ],
});

// --- Scalar API Reference ---
app.get("/docs", apiReference({ spec: { url: "/openapi.json" } }));

// --- Health Check ---
app.get("/health", (c) => c.json({ status: "ok", service: "auth" }));

// --- Error Handler ---
app.onError((err, c) => {
  console.error("Auth service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
