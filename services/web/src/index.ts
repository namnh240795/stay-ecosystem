import { Hono } from "hono";
import { cors } from "hono/cors";
import branchesRoutes from "./routes/branches";
import apartmentsRoutes from "./routes/apartments";
import bookingsRoutes from "./routes/bookings";
import reviewsRoutes from "./routes/reviews";
import toursRoutes from "./routes/tours";
import contentRoutes from "./routes/content";

type Bindings = {
  BRANCHES_DB: D1Database;
  APARTMENTS_DB: D1Database;
  BOOKINGS_DB: D1Database;
  USERS_DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok", service: "web" }));

// Mount routes
app.route("/api/branches", branchesRoutes);
app.route("/api/apartments", apartmentsRoutes);
app.route("/api/bookings", bookingsRoutes);
app.route("/api/reviews", reviewsRoutes);
app.route("/api/tours", toursRoutes);
app.route("/api", contentRoutes);

app.onError((err, c) => {
  console.error("Web service error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
