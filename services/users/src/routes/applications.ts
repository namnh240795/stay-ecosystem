import { z } from "zod";
import { createRoute, OpenAPIHono } from "@hono/zod-openapi";

type Env = { USERS_DB: D1Database };

const app = new OpenAPIHono<{ Bindings: Env }>();

// --- Schemas ---

const ApplicationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  businessName: z.string(),
  businessDescription: z.string(),
  documents: z.array(z.string()).optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  reviewedBy: z.string().uuid().optional(),
  reviewNote: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const CreateApplicationSchema = z.object({
  businessName: z.string().min(1).max(200),
  businessDescription: z.string().min(10).max(2000),
  documents: z.array(z.string().url()).optional(),
});

const UpdateApplicationSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reviewNote: z.string().optional(),
});

// --- Routes ---

// Customer: Submit application
const createApplicationRoute = createRoute({
  method: "post",
  path: "/applications",
  tags: ["Applications"],
  summary: "Submit a partner application",
  request: {
    body: {
      description: "Application data",
      required: true,
      content: {
        "application/json": { schema: CreateApplicationSchema },
      },
    },
  },
  responses: {
    201: {
      description: "Application created",
      content: { "application/json": { schema: ApplicationSchema } },
    },
    400: { description: "Invalid input" },
  },
});

app.openapi(createApplicationRoute, async (c) => {
  const body = c.req.valid("json");

  // TODO: Extract user ID from auth token
  const userId = "placeholder-user-id";

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await c.env.USERS_DB.prepare(
    `INSERT INTO partner_applications (id, user_id, business_name, business_description, documents, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
  )
    .bind(
      id,
      userId,
      body.businessName,
      body.businessDescription,
      JSON.stringify(body.documents ?? []),
      now,
      now
    )
    .run();

  return c.json(
    {
      id,
      userId,
      businessName: body.businessName,
      businessDescription: body.businessDescription,
      documents: body.documents,
      status: "pending" as const,
      createdAt: now,
      updatedAt: now,
    },
    201
  );
});

// Admin: List all applications
const listApplicationsRoute = createRoute({
  method: "get",
  path: "/applications",
  tags: ["Applications"],
  summary: "List all partner applications",
  responses: {
    200: {
      description: "List of applications",
      content: {
        "application/json": {
          schema: z.object({
            applications: z.array(ApplicationSchema),
            total: z.number(),
          }),
        },
      },
    },
  },
});

app.openapi(listApplicationsRoute, async (c) => {
  const { results } = await c.env.USERS_DB.prepare(
    "SELECT * FROM partner_applications ORDER BY created_at DESC"
  ).all();

  return c.json(
    {
      applications: results as any[],
      total: results.length,
    },
    200
  );
});

// Admin: Update application status
const updateApplicationRoute = createRoute({
  method: "patch",
  path: "/applications/:id",
  tags: ["Applications"],
  summary: "Approve or reject a partner application",
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: {
      description: "Application update",
      required: true,
      content: {
        "application/json": { schema: UpdateApplicationSchema },
      },
    },
  },
  responses: {
    200: {
      description: "Application updated",
      content: { "application/json": { schema: ApplicationSchema } },
    },
    404: { description: "Application not found" },
  },
});

app.openapi(updateApplicationRoute, async (c) => {
  const { id } = c.req.valid("param");
  const body = c.req.valid("json");

  // TODO: Extract admin user ID from auth token
  const reviewedBy = "placeholder-admin-id";

  const result = await c.env.USERS_DB.prepare(
    `UPDATE partner_applications
     SET status = ?, reviewed_by = ?, review_note = ?, updated_at = datetime('now')
     WHERE id = ? RETURNING *`
  )
    .bind(body.status, reviewedBy, body.reviewNote ?? null, id)
    .first();

  if (!result) {
    return c.json({ error: "Application not found" }, 404);
  }

  // If approved, update user role to partner
  if (body.status === "approved") {
    const app = result as any;
    await c.env.USERS_DB.prepare(
      `UPDATE users SET role = 'partner', updated_at = datetime('now') WHERE id = ?`
    )
      .bind(app.user_id)
      .run();
  }

  return c.json(result as any, 200);
});

export default app;
