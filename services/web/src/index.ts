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

// Seed endpoint for local development
app.post("/api/seed", async (c) => {
  const db = c.env.BRANCHES_DB;
  await db.prepare("CREATE TABLE IF NOT EXISTS branches (branches_id TEXT PRIMARY KEY, branches_name TEXT NOT NULL, branches_brand TEXT, branches_location TEXT, branches_address TEXT, branches_phone TEXT, branches_email TEXT, branches_description TEXT, branches_image_url TEXT, branches_is_active INTEGER NOT NULL DEFAULT 1, branches_created_at TEXT, branches_updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS web_apartments (web_apartments_id TEXT PRIMARY KEY, web_apartments_name TEXT NOT NULL, web_apartments_branch_id TEXT, web_apartments_branch_name TEXT, web_apartments_type TEXT, web_apartments_location TEXT, web_apartments_address TEXT, web_apartments_description TEXT, web_apartments_image_url TEXT, web_apartments_images TEXT, web_apartments_price_per_night REAL NOT NULL DEFAULT 0, web_apartments_max_guests INTEGER NOT NULL DEFAULT 2, web_apartments_bedrooms INTEGER NOT NULL DEFAULT 1, web_apartments_bathrooms INTEGER NOT NULL DEFAULT 1, web_apartments_pet_friendly INTEGER NOT NULL DEFAULT 0, web_apartments_has_virtual_tour INTEGER NOT NULL DEFAULT 0, web_apartments_virtual_tour_url TEXT, web_apartments_amenities TEXT, web_apartments_is_active INTEGER NOT NULL DEFAULT 1, web_apartments_created_at TEXT, web_apartments_updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS bookings (bookings_id TEXT PRIMARY KEY, bookings_booking_code TEXT, bookings_guest_name TEXT, bookings_guest_phone TEXT, bookings_guest_email TEXT, bookings_branch_id TEXT, bookings_branch_name TEXT, bookings_room_name TEXT, bookings_check_in TEXT, bookings_check_out TEXT, bookings_nights INTEGER, bookings_adults INTEGER, bookings_children INTEGER, bookings_total_price INTEGER, bookings_status TEXT DEFAULT 'pending', bookings_payment_method TEXT, bookings_card_last4 TEXT, bookings_special_request TEXT, bookings_created_at TEXT, bookings_updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS reviews (reviews_id TEXT PRIMARY KEY, reviews_target_id TEXT, reviews_target_name TEXT, reviews_guest_name TEXT, reviews_rating INTEGER, reviews_comment TEXT, reviews_created_at TEXT, reviews_updated_at TEXT)").run();

  // Seed branches (matching branches.ts schema: branches_id,branches_name,branches_location,branches_brand,branches_description,branches_image_url)
  const branches = [
    ['branch-1','GrandStay Premier Thai Nguyen','Thai Nguyen','GrandStay Premier','Trải nghiệm khu nghỉ dưỡng đẳng cấp.','https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'],
    ['branch-2','GrandStay Beachfront Resort Phu Quoc','Phu Quoc','GrandStay Resort','Thiên đường nghỉ dưỡng sát biển.','https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1200&q=80'],
    ['branch-3','GrandStay Lux Waterfront Da Nang','Da Nang','GrandStay Lux','Khách sạn cao tầng bên sông Hàn.','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
    ['branch-4','GrandStay Heritage Oasis Hanoi','Hanoi','GrandStay Heritage','Biệt thự Indochine giữa lòng Hà Nội.','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'],
    ['branch-5','GrandStay Urban Suites Saigon','Saigon','GrandStay Suites','Căn hộ cao cấp trung tâm Quận 1.','https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'],
    ['branch-6','GrandStay Cloud Retreat Sapa','Sapa','GrandStay Resort','Nghỉ dưỡng mộc mạc trên đỉnh đồi.','https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80'],
  ];
  for (const b of branches) {
    await db.prepare("INSERT OR IGNORE INTO branches (branches_id,branches_name,branches_location,branches_brand,branches_description,branches_image_url) VALUES (?,?,?,?,?,?)").bind(...b).run();
  }

  // Seed apartments (matching apartments.ts schema)
  const apts = [
    ['apt-1','Metropolitan Luxury Studio','Saigon','Studio',1,1,23750000,'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80','Căn hộ Studio cao cấp view Landmark 81.','["Kitchen","Washing Machine","High-speed Wi-Fi","Gym","Pool"]',1,1],
    ['apt-2','Indochine Heritage 1BR Suite','Hanoi','1-Bedroom',1,1,27500000,'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80','Căn hộ Indochine truyền thống.','["Kitchen","Washing Machine","High-speed Wi-Fi","Bicycle"]',1,0],
    ['apt-3','My Khe Beachfront 2BR','Da Nang','2-Bedroom',2,2,36250000,'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80','View bình minh biển Mỹ Khê.','["Kitchen","Pool","Gym","Parking"]',0,1],
    ['apt-4','Sunset Horizon Pool Villa','Phu Quoc','Penthouse',3,3,70000000,'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80','Penthouse nghỉ dưỡng sang trọng.','["Kitchen","Pool","Private Beach","Jacuzzi"]',1,1],
    ['apt-5','Misty Valley Cozy Chalet','Sapa','1-Bedroom',1,1,20000000,'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80','Căn hộ gỗ phong cách Scandinavian.','["Kitchen","Fireplace","Heated Pool","Balcony"]',0,1],
    ['apt-6','Zen Garden Tea-view Suite','Thai Nguyen','Service Apartment',1,1,18750000,'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80','Căn hộ hướng đồi chè.','["Kitchen","Tea Garden","Spa","Pool"]',1,0],
  ];
  for (const a of apts) {
    await db.prepare("INSERT OR IGNORE INTO web_apartments (web_apartments_id,web_apartments_name,web_apartments_location,web_apartments_type,web_apartments_bedrooms,web_apartments_bathrooms,web_apartments_price_per_night,web_apartments_image_url,web_apartments_description,web_apartments_amenities,web_apartments_has_virtual_tour,web_apartments_pet_friendly) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(...a).run();
  }

  return c.json({ success: true, message: "Web database seeded" });
});

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
