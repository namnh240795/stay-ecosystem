import { Hono } from "hono";
import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { createDb, type DB } from "../db";

type Env = { USERS_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const UserSchema = z.object({
  id: z.string().uuid(),
  auth0Sub: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["customer", "partner", "admin"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
});

// --- Routes ---

const getUserRoute = createRoute({
  method: "get",
  path: "/:id",
  tags: ["Users"],
  summary: "Get user by ID",
  responses: {
    200: {
      description: "User found",
      content: { "application/json": { schema: UserSchema } },
    },
    404: { description: "User not found" },
  },
});

app.openapi(getUserRoute, async (c) => {
  const id = c.req.param("id");
  const db = createDb(c.env);

  // TODO: Replace with actual Drizzle query when schema is defined
  const user = await c.env.USERS_DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(user as any, 200);
});

const updateUserRoute = createRoute({
  method: "patch",
  path: "/:id",
  tags: ["Users"],
  summary: "Update user by ID",
  request: {
    body: {
      description: "User update data",
      required: true,
      content: {
        "application/json": { schema: UpdateUserSchema },
      },
    },
  },
  responses: {
    200: {
      description: "User updated",
      content: { "application/json": { schema: UserSchema } },
    },
    404: { description: "User not found" },
  },
});

app.openapi(updateUserRoute, async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");

  // TODO: Replace with actual Drizzle update when schema is defined
  const fields: string[] = [];
  const values: any[] = [];

  if (body.name !== undefined) {
    fields.push("name = ?");
    values.push(body.name);
  }
  if (body.email !== undefined) {
    fields.push("email = ?");
    values.push(body.email);
  }

  if (fields.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const result = await c.env.USERS_DB.prepare(
    `UPDATE users SET ${fields.join(", ")} WHERE id = ? RETURNING *`
  )
    .bind(...values)
    .first();

  if (!result) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json(result as any, 200);
});

const deleteUserRoute = createRoute({
  method: "delete",
  path: "/:id",
  tags: ["Users"],
  summary: "Delete user by ID",
  responses: {
    200: {
      description: "User deleted",
      content: {
        "application/json": {
          schema: z.object({ success: z.boolean() }),
        },
      },
    },
    404: { description: "User not found" },
  },
});

app.openapi(deleteUserRoute, async (c) => {
  const id = c.req.param("id");

  const result = await c.env.USERS_DB.prepare(
    "DELETE FROM users WHERE id = ? RETURNING id"
  )
    .bind(id)
    .first();

  if (!result) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ success: true }, 200);
});

export default app;
