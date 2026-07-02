import { Hono } from "hono";
import { z } from "zod";
import {
  createRoute,
  OpenAPIHono,
} from "@hono/zod-openapi";
import {
  verifyToken,
  extractUser,
  extractBearerToken,
  type Auth0Env,
  type AuthenticatedUser,
} from "../lib/auth0";

const app = new OpenAPIHono<{ Bindings: Auth0Env }>();

// --- Schemas ---

const UserSchema = z.object({
  sub: z.string(),
  email: z.string().optional(),
  name: z.string().optional(),
  roles: z.array(z.string()).optional(),
});

const WebhookPayloadSchema = z.object({
  event_type: z.string(),
  user: z.object({
    sub: z.string(),
    email: z.string().optional(),
    name: z.string().optional(),
  }),
});

// --- Routes ---

const getMeRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  summary: "Get current user from token",
  responses: {
    200: {
      description: "Current user",
      content: { "application/json": { schema: UserSchema } },
    },
    401: { description: "Unauthorized" },
  },
});

app.openapi(getMeRoute, async (c) => {
  const authHeader = c.req.header("Authorization");
  const token = extractBearerToken(authHeader ?? null);

  if (!token) {
    return c.json({ error: "Missing or invalid Authorization header" }, 401);
  }

  try {
    const payload = await verifyToken(token, c.env);
    const user = extractUser(payload);
    return c.json(user, 200);
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
});

const webhookRoute = createRoute({
  method: "post",
  path: "/webhook",
  tags: ["Auth"],
  summary: "Auth0 webhook to sync user to D1",
  request: {
    body: {
      description: "Auth0 webhook payload",
      required: true,
      content: {
        "application/json": { schema: WebhookPayloadSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Webhook processed",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    400: { description: "Invalid payload" },
  },
});

app.openapi(webhookRoute, async (c) => {
  const body = c.req.valid("json");

  // TODO: Sync user to D1 database when users service DB is available
  // For now, acknowledge the webhook
  console.log("Auth0 webhook received:", body.event_type, body.user.sub);

  return c.json({ success: true }, 200);
});

export default app;
