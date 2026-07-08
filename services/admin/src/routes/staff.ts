import { Hono } from "hono";

type Bindings = {
  USERS_DB: D1Database;
  PROPERTIES_DB: D1Database;
  BOOKINGS_DB: D1Database;
  PAYMENTS_DB: D1Database;
};

const staff = new Hono<{ Bindings: Bindings }>();

// ==================== STAFF MEMBERS ====================

// GET /api/admin/staff - List staff members
staff.get("/api/admin/staff", async (c) => {
  const usersDb = c.env.USERS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const roleId = c.req.query("roleId");
  const status = c.req.query("status");
  const search = c.req.query("search");
  const offset = (page - 1) * limit;

  let where = "WHERE u.users_role != 'guest'";
  const params: any[] = [];

  if (roleId) {
    where += " AND u.users_role = ?";
    params.push(roleId);
  }
  if (status) {
    where += " AND u.users_id IN (SELECT staff_user_id FROM staff WHERE staff_status = ?)";
    params.push(status);
  }
  if (search) {
    where += " AND (u.users_name LIKE ? OR u.users_email LIKE ? OR u.users_phone LIKE ?)";
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const countResult = await usersDb
    .prepare(`SELECT COUNT(*) as count FROM users u ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await usersDb
    .prepare(
      `SELECT u.*, s.staff_status, s.staff_role_id, s.staff_joined_at
       FROM users u
       LEFT JOIN staff s ON u.users_id = s.staff_user_id
       ${where}
       ORDER BY u.users_created_at DESC
       LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// GET /api/admin/staff/:id - Get staff member by ID
staff.get("/api/admin/staff/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");

  const result = await usersDb
    .prepare(
      `SELECT u.*, s.staff_status, s.staff_role_id, s.staff_joined_at
       FROM users u
       LEFT JOIN staff s ON u.users_id = s.staff_user_id
       WHERE u.users_id = ? AND u.users_role != 'guest'`
    )
    .bind(id)
    .first();

  if (!result) return c.json({ error: "Staff member not found" }, 404);
  return c.json(result);
});

// POST /api/admin/staff - Create staff member
staff.post("/api/admin/staff", async (c) => {
  const usersDb = c.env.USERS_DB;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();

  // Create user record
  await usersDb
    .prepare(
      `INSERT INTO users (users_id, users_email, users_name, users_phone, users_role, users_created_at, users_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(userId, data.email, data.name, data.phone || null, data.roleId || "staff", now, now)
    .run();

  // Create staff record
  await usersDb
    .prepare(
      `INSERT INTO staff (staff_id, staff_user_id, staff_role_id, staff_status, staff_joined_at, staff_created_at, staff_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), userId, data.roleId || null, data.status || "Active", now, now, now)
    .run();

  const created = await usersDb
    .prepare(
      `SELECT u.*, s.staff_status, s.staff_role_id, s.staff_joined_at
       FROM users u
       LEFT JOIN staff s ON u.users_id = s.staff_user_id
       WHERE u.users_id = ?`
    )
    .bind(userId)
    .first();

  return c.json(created, 201);
});

// PUT /api/admin/staff/:id - Update staff member
staff.put("/api/admin/staff/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb
    .prepare("SELECT * FROM users WHERE users_id = ? AND users_role != 'guest'")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Staff member not found" }, 404);

  // Update user fields
  const userFields: string[] = [];
  const userValues: any[] = [];

  for (const [key, dbKey] of Object.entries({
    name: "users_name",
    email: "users_email",
    phone: "users_phone",
    roleId: "users_role",
  })) {
    if (data[key] !== undefined) {
      userFields.push(`${dbKey} = ?`);
      userValues.push(data[key]);
    }
  }

  if (userFields.length > 0) {
    userFields.push("users_updated_at = ?");
    userValues.push(now);
    userValues.push(id);
    await usersDb
      .prepare(`UPDATE users SET ${userFields.join(", ")} WHERE users_id = ?`)
      .bind(...userValues)
      .run();
  }

  // Update staff record if exists
  if (data.status !== undefined || data.roleId !== undefined) {
    const staffRecord = await usersDb
      .prepare("SELECT * FROM staff WHERE staff_user_id = ?")
      .bind(id)
      .first();

    if (staffRecord) {
      const staffFields: string[] = [];
      const staffValues: any[] = [];

      if (data.roleId !== undefined) {
        staffFields.push("staff_role_id = ?");
        staffValues.push(data.roleId);
      }
      if (data.status !== undefined) {
        staffFields.push("staff_status = ?");
        staffValues.push(data.status);
      }

      if (staffFields.length > 0) {
        staffFields.push("staff_updated_at = ?");
        staffValues.push(now);
        staffValues.push(id);
        await usersDb
          .prepare(`UPDATE staff SET ${staffFields.join(", ")} WHERE staff_user_id = ?`)
          .bind(...staffValues)
          .run();
      }
    }
  }

  const updated = await usersDb
    .prepare(
      `SELECT u.*, s.staff_status, s.staff_role_id, s.staff_joined_at
       FROM users u
       LEFT JOIN staff s ON u.users_id = s.staff_user_id
       WHERE u.users_id = ?`
    )
    .bind(id)
    .first();

  return c.json(updated);
});

// PATCH /api/admin/staff/:id/status - Update staff status
staff.patch("/api/admin/staff/:id/status", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb
    .prepare("SELECT * FROM users WHERE users_id = ? AND users_role != 'guest'")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Staff member not found" }, 404);

  const staffRecord = await usersDb
    .prepare("SELECT * FROM staff WHERE staff_user_id = ?")
    .bind(id)
    .first();

  if (staffRecord) {
    await usersDb
      .prepare("UPDATE staff SET staff_status = ?, staff_updated_at = ? WHERE staff_user_id = ?")
      .bind(data.status, now, id)
      .run();
  } else {
    // Create staff record if it doesn't exist
    await usersDb
      .prepare(
        `INSERT INTO staff (staff_id, staff_user_id, staff_status, staff_created_at, staff_updated_at)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(crypto.randomUUID(), id, data.status, now, now)
      .run();
  }

  const updated = await usersDb
    .prepare(
      `SELECT u.*, s.staff_status, s.staff_role_id, s.staff_joined_at
       FROM users u
       LEFT JOIN staff s ON u.users_id = s.staff_user_id
       WHERE u.users_id = ?`
    )
    .bind(id)
    .first();

  return c.json(updated);
});

// DELETE /api/admin/staff/:id - Delete staff member
staff.delete("/api/admin/staff/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");

  const existing = await usersDb
    .prepare("SELECT * FROM users WHERE users_id = ? AND users_role != 'guest'")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Staff member not found" }, 404);

  // Delete staff record first (foreign key)
  await usersDb.prepare("DELETE FROM staff WHERE staff_user_id = ?").bind(id).run();
  // Delete user record
  await usersDb.prepare("DELETE FROM users WHERE users_id = ?").bind(id).run();

  return c.json({ success: true });
});

// ==================== ROLES ====================

// GET /api/admin/roles - List all roles
staff.get("/api/admin/roles", async (c) => {
  const usersDb = c.env.USERS_DB;

  // Ensure roles table exists
  await usersDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS roles (
        roles_id TEXT PRIMARY KEY,
        roles_name TEXT NOT NULL UNIQUE,
        roles_description TEXT,
        roles_permissions TEXT,
        roles_created_at TEXT NOT NULL DEFAULT '',
        roles_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  const results = await usersDb
    .prepare("SELECT * FROM roles ORDER BY roles_name ASC")
    .all();

  // If no roles exist, seed with defaults
  if (results.results.length === 0) {
    const defaultRoles = [
      { id: crypto.randomUUID(), name: "admin", description: "Full system access", permissions: JSON.stringify(["*"]) },
      { id: crypto.randomUUID(), name: "manager", description: "Property and booking management", permissions: JSON.stringify(["properties:read", "properties:write", "bookings:read", "bookings:write", "staff:read"]) },
      { id: crypto.randomUUID(), name: "staff", description: "Basic staff access", permissions: JSON.stringify(["bookings:read", "bookings:write", "properties:read"]) },
      { id: crypto.randomUUID(), name: "partner", description: "Partner access", permissions: JSON.stringify(["properties:read", "properties:write", "bookings:read"]) },
    ];

    for (const role of defaultRoles) {
      await usersDb
        .prepare(
          `INSERT OR IGNORE INTO roles (roles_id, roles_name, roles_description, roles_permissions, roles_created_at, roles_updated_at)
           VALUES (?, ?, ?, ?, '', '')`
        )
        .bind(role.id, role.name, role.description, role.permissions)
        .run();
    }

    const seeded = await usersDb
      .prepare("SELECT * FROM roles ORDER BY roles_name ASC")
      .all();
    return c.json({ data: seeded.results });
  }

  return c.json({ data: results.results });
});

// POST /api/admin/roles - Create role
staff.post("/api/admin/roles", async (c) => {
  const usersDb = c.env.USERS_DB;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Ensure roles table exists
  await usersDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS roles (
        roles_id TEXT PRIMARY KEY,
        roles_name TEXT NOT NULL UNIQUE,
        roles_description TEXT,
        roles_permissions TEXT,
        roles_created_at TEXT NOT NULL DEFAULT '',
        roles_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  try {
    await usersDb
      .prepare(
        `INSERT INTO roles (roles_id, roles_name, roles_description, roles_permissions, roles_created_at, roles_updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        data.name,
        data.description || null,
        JSON.stringify(data.permissions || []),
        now,
        now
      )
      .run();
  } catch (err: any) {
    if (err.message?.includes("UNIQUE constraint")) {
      return c.json({ error: "Role name already exists" }, 409);
    }
    throw err;
  }

  const created = await usersDb
    .prepare("SELECT * FROM roles WHERE roles_id = ?")
    .bind(id)
    .first();

  return c.json(created, 201);
});

// PUT /api/admin/roles/:id - Update role
staff.put("/api/admin/roles/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb
    .prepare("SELECT * FROM roles WHERE roles_id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Role not found" }, 404);

  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push("roles_name = ?");
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push("roles_description = ?");
    values.push(data.description);
  }
  if (data.permissions !== undefined) {
    fields.push("roles_permissions = ?");
    values.push(JSON.stringify(data.permissions));
  }

  if (fields.length > 0) {
    fields.push("roles_updated_at = ?");
    values.push(now);
    values.push(id);

    try {
      await usersDb
        .prepare(`UPDATE roles SET ${fields.join(", ")} WHERE roles_id = ?`)
        .bind(...values)
        .run();
    } catch (err: any) {
      if (err.message?.includes("UNIQUE constraint")) {
        return c.json({ error: "Role name already exists" }, 409);
      }
      throw err;
    }
  }

  const updated = await usersDb
    .prepare("SELECT * FROM roles WHERE roles_id = ?")
    .bind(id)
    .first();

  return c.json(updated);
});

// DELETE /api/admin/roles/:id - Delete role
staff.delete("/api/admin/roles/:id", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");

  const existing = await usersDb
    .prepare("SELECT * FROM roles WHERE roles_id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Role not found" }, 404);

  await usersDb.prepare("DELETE FROM roles WHERE roles_id = ?").bind(id).run();
  return c.json({ success: true });
});

// ==================== LEAVE REQUESTS ====================

// GET /api/admin/leave-requests - List leave/shift swap requests
staff.get("/api/admin/leave-requests", async (c) => {
  const usersDb = c.env.USERS_DB;
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const status = c.req.query("status");
  const offset = (page - 1) * limit;

  // Ensure leave_requests table exists
  await usersDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS leave_requests (
        leave_requests_id TEXT PRIMARY KEY,
        leave_requests_type TEXT NOT NULL DEFAULT 'leave',
        leave_requests_staff_name TEXT NOT NULL,
        leave_requests_staff_id TEXT,
        leave_requests_reason TEXT,
        leave_requests_start_date TEXT NOT NULL,
        leave_requests_end_date TEXT NOT NULL,
        leave_requests_status TEXT NOT NULL DEFAULT 'Pending',
        leave_requests_response_notes TEXT,
        leave_requests_reviewed_by TEXT,
        leave_requests_reviewed_at TEXT,
        leave_requests_created_at TEXT NOT NULL DEFAULT '',
        leave_requests_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  let where = "WHERE 1=1";
  const params: any[] = [];

  if (status) {
    where += " AND leave_requests_status = ?";
    params.push(status);
  }

  const countResult = await usersDb
    .prepare(`SELECT COUNT(*) as count FROM leave_requests ${where}`)
    .bind(...params)
    .first<{ count: number }>();

  const results = await usersDb
    .prepare(
      `SELECT * FROM leave_requests ${where} ORDER BY leave_requests_created_at DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, limit, offset)
    .all();

  return c.json({
    data: results.results,
    total: countResult?.count || 0,
    page,
    limit,
  });
});

// POST /api/admin/leave-requests - Create leave request
staff.post("/api/admin/leave-requests", async (c) => {
  const usersDb = c.env.USERS_DB;
  const data = await c.req.json();
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  // Ensure leave_requests table exists
  await usersDb
    .prepare(
      `CREATE TABLE IF NOT EXISTS leave_requests (
        leave_requests_id TEXT PRIMARY KEY,
        leave_requests_type TEXT NOT NULL DEFAULT 'leave',
        leave_requests_staff_name TEXT NOT NULL,
        leave_requests_staff_id TEXT,
        leave_requests_reason TEXT,
        leave_requests_start_date TEXT NOT NULL,
        leave_requests_end_date TEXT NOT NULL,
        leave_requests_status TEXT NOT NULL DEFAULT 'Pending',
        leave_requests_response_notes TEXT,
        leave_requests_reviewed_by TEXT,
        leave_requests_reviewed_at TEXT,
        leave_requests_created_at TEXT NOT NULL DEFAULT '',
        leave_requests_updated_at TEXT NOT NULL DEFAULT ''
      )`
    )
    .run();

  await usersDb
    .prepare(
      `INSERT INTO leave_requests (leave_requests_id, leave_requests_type, leave_requests_staff_name, leave_requests_staff_id, leave_requests_reason, leave_requests_start_date, leave_requests_end_date, leave_requests_status, leave_requests_created_at, leave_requests_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)`
    )
    .bind(
      id,
      data.type || "leave",
      data.staffName,
      data.staffId || null,
      data.reason || null,
      data.startDate,
      data.endDate,
      now,
      now
    )
    .run();

  const created = await usersDb
    .prepare("SELECT * FROM leave_requests WHERE leave_requests_id = ?")
    .bind(id)
    .first();

  return c.json(created, 201);
});

// PATCH /api/admin/leave-requests/:id/status - Approve/reject leave request
staff.patch("/api/admin/leave-requests/:id/status", async (c) => {
  const usersDb = c.env.USERS_DB;
  const id = c.req.param("id");
  const data = await c.req.json();
  const now = new Date().toISOString();

  const existing = await usersDb
    .prepare("SELECT * FROM leave_requests WHERE leave_requests_id = ?")
    .bind(id)
    .first();
  if (!existing) return c.json({ error: "Leave request not found" }, 404);

  await usersDb
    .prepare(
      `UPDATE leave_requests
       SET leave_requests_status = ?, leave_requests_response_notes = ?, leave_requests_reviewed_at = ?, leave_requests_updated_at = ?
       WHERE leave_requests_id = ?`
    )
    .bind(data.status, data.responseNotes || null, now, now, id)
    .run();

  const updated = await usersDb
    .prepare("SELECT * FROM leave_requests WHERE leave_requests_id = ?")
    .bind(id)
    .first();

  return c.json(updated);
});

export default staff;
