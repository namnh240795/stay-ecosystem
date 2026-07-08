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
  await db.prepare("CREATE TABLE IF NOT EXISTS branches (id TEXT PRIMARY KEY, name TEXT NOT NULL, brand TEXT, location TEXT, address TEXT, phone TEXT, email TEXT, description TEXT, image_url TEXT, amenities TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT, updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS apartments (id TEXT PRIMARY KEY, name TEXT NOT NULL, branch_id TEXT, branch_name TEXT, type TEXT, location TEXT, address TEXT, description TEXT, image_url TEXT, images TEXT, price_per_night REAL NOT NULL DEFAULT 0, max_guests INTEGER NOT NULL DEFAULT 2, bedrooms INTEGER NOT NULL DEFAULT 1, bathrooms INTEGER NOT NULL DEFAULT 1, pet_friendly INTEGER NOT NULL DEFAULT 0, has_virtual_tour INTEGER NOT NULL DEFAULT 0, virtual_tour_url TEXT, amenities TEXT, is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT, updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, booking_code TEXT, guest_name TEXT, guest_phone TEXT, guest_email TEXT, branch_id TEXT, branch_name TEXT, room_name TEXT, check_in TEXT, check_out TEXT, nights INTEGER, adults INTEGER, children INTEGER, total_price INTEGER, status TEXT DEFAULT 'pending', payment_method TEXT, card_last4 TEXT, special_request TEXT, created_at TEXT, updated_at TEXT)").run();
  await db.prepare("CREATE TABLE IF NOT EXISTS reviews (id TEXT PRIMARY KEY, target_id TEXT, target_name TEXT, guest_name TEXT, rating INTEGER, comment TEXT, created_at TEXT, updated_at TEXT)").run();

  // Seed branches (matching branches.ts schema: id,name,location,brand,description,image_url,amenities)
  const branches = [
    ['branch-1','GrandStay Premier Thai Nguyen','Thai Nguyen','GrandStay Premier','Trải nghiệm khu nghỉ dưỡng đẳng cấp.','https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80','["Pool","Spa","Tea Garden","Gym","Restaurant","Free Wi-Fi"]'],
    ['branch-2','GrandStay Beachfront Resort Phu Quoc','Phu Quoc','GrandStay Resort','Thiên đường nghỉ dưỡng sát biển.','https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1200&q=80','["Private Beach","Pool","Bar","Water Sports","Spa"]'],
    ['branch-3','GrandStay Lux Waterfront Da Nang','Da Nang','GrandStay Lux','Khách sạn cao tầng bên sông Hàn.','https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80','["Rooftop Bar","Pool","Gym","Conference","Fine Dining"]'],
    ['branch-4','GrandStay Heritage Oasis Hanoi','Hanoi','GrandStay Heritage','Biệt thự Indochine giữa lòng Hà Nội.','https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80','["Boutique Garden","Spa","Traditional Tea","Free Wi-Fi"]'],
    ['branch-5','GrandStay Urban Suites Saigon','Saigon','GrandStay Suites','Căn hộ cao cấp trung tâm Quận 1.','https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80','["Kitchenette","Infinity Pool","Smart Home","Gym"]'],
    ['branch-6','GrandStay Cloud Retreat Sapa','Sapa','GrandStay Resort','Nghỉ dưỡng mộc mạc trên đỉnh đồi.','https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80','["Fireplace","Heated Pool","Spa","Organic Dining"]'],
  ];
  for (const b of branches) {
    await db.prepare("INSERT OR IGNORE INTO branches (id,name,location,brand,description,image_url,amenities) VALUES (?,?,?,?,?,?,?)").bind(...b).run();
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
    await db.prepare("INSERT OR IGNORE INTO apartments (id,name,location,type,bedrooms,bathrooms,price_per_night,image_url,description,amenities,has_virtual_tour,pet_friendly) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)").bind(...a).run();
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
