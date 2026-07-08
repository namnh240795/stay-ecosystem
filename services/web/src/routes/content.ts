import { Hono } from "hono";

type Env = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

// --- Helpers ---

async function ensureConfigTable(db: D1Database) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS site_config (
      site_config_key TEXT PRIMARY KEY,
      site_config_value TEXT NOT NULL,
      site_config_updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `).run();
}

async function getConfig(db: D1Database, key: string): Promise<string | null> {
  const row = await db
    .prepare("SELECT site_config_value FROM site_config WHERE site_config_key = ?")
    .bind(key)
    .first<{ site_config_value: string }>();
  return row?.site_config_value ?? null;
}

async function setConfig(db: D1Database, key: string, value: string): Promise<void> {
  const now = new Date().toISOString();
  await db
    .prepare(
      `INSERT INTO site_config (site_config_key, site_config_value, site_config_updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(site_config_key) DO UPDATE SET site_config_value = excluded.site_config_value, site_config_updated_at = excluded.site_config_updated_at`
    )
    .bind(key, value, now)
    .run();
}

// ============================
// LONG-TERM PAGE CONTENT
// ============================

// GET /api/content/longterm - Get long-term page content
app.get("/content/longterm", async (c) => {
  const db = c.env.USERS_DB;
  await ensureConfigTable(db);

  const value = await getConfig(db, "content:longterm");

  if (!value) {
    return c.json({ data: null, message: "No content found" });
  }

  return c.json({ data: JSON.parse(value) });
});

// PUT /api/content/longterm - Update long-term content
app.put("/content/longterm", async (c) => {
  const db = c.env.USERS_DB;
  await ensureConfigTable(db);

  const body = await c.req.json();

  await setConfig(db, "content:longterm", JSON.stringify(body));

  return c.json({ success: true, message: "Long-term content updated" });
});

// ============================
// REFUND POLICY
// ============================

// GET /api/policies/refund - Get refund policy
app.get("/policies/refund", async (c) => {
  const db = c.env.USERS_DB;
  await ensureConfigTable(db);

  const value = await getConfig(db, "policy:refund");

  if (!value) {
    return c.json({ data: null, message: "No refund policy found" });
  }

  return c.json({ data: JSON.parse(value) });
});

// PUT /api/policies/refund - Update refund policy
app.put("/policies/refund", async (c) => {
  const db = c.env.USERS_DB;
  await ensureConfigTable(db);

  const body = await c.req.json();

  await setConfig(db, "policy:refund", JSON.stringify(body));

  return c.json({ success: true, message: "Refund policy updated" });
});

// ============================
// VOUCHERS
// ============================

// GET /api/vouchers - List vouchers (hardcoded mock data)
app.get("/vouchers", async (c) => {
  const vouchers = [
    {
      id: "v-001",
      code: "WELCOME10",
      description: "10% discount for first-time booking",
      discountPercent: 10,
      minBookingAmount: 500000,
      maxDiscount: 200000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      isActive: true,
      usageLimit: 100,
      usedCount: 42,
    },
    {
      id: "v-002",
      code: "SUMMER25",
      description: "25% off summer vacation packages",
      discountPercent: 25,
      minBookingAmount: 1000000,
      maxDiscount: 500000,
      validFrom: "2026-06-01",
      validUntil: "2026-08-31",
      isActive: true,
      usageLimit: 50,
      usedCount: 12,
    },
    {
      id: "v-003",
      code: "GROUP15",
      description: "15% off for group bookings of 4+ people",
      discountPercent: 15,
      minBookingAmount: 2000000,
      maxDiscount: 1000000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      isActive: true,
      usageLimit: 200,
      usedCount: 87,
    },
    {
      id: "v-004",
      code: "EARLYBIRD",
      description: "20% off when booking 30+ days in advance",
      discountPercent: 20,
      minBookingAmount: 800000,
      maxDiscount: 400000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      isActive: true,
      usageLimit: 150,
      usedCount: 63,
    },
    {
      id: "v-005",
      code: "LOYALTY5",
      description: "5% cashback for returning customers",
      discountPercent: 5,
      minBookingAmount: 300000,
      maxDiscount: 100000,
      validFrom: "2026-01-01",
      validUntil: "2026-12-31",
      isActive: true,
      usageLimit: 500,
      usedCount: 234,
    },
  ];

  return c.json({ data: vouchers, total: vouchers.length });
});

export default app;
