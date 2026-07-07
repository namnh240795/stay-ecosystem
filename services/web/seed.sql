-- Web Service Database Seed

-- Branches table
CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  brand TEXT,
  description TEXT,
  image TEXT,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  price_per_night INTEGER DEFAULT 0,
  amenities TEXT,
  popular_for TEXT,
  latitude REAL,
  longitude REAL,
  status TEXT DEFAULT 'active',
  created_at TEXT,
  updated_at TEXT
);

-- Apartments table
CREATE TABLE IF NOT EXISTS apartments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  type TEXT,
  area REAL,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  monthly_price INTEGER DEFAULT 0,
  rating REAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image TEXT,
  images TEXT,
  description TEXT,
  amenities TEXT,
  available_from TEXT,
  has_virtual_tour INTEGER DEFAULT 0,
  virtual_tour_url TEXT,
  pet_friendly INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TEXT,
  updated_at TEXT
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  booking_code TEXT,
  guest_name TEXT,
  guest_phone TEXT,
  guest_email TEXT,
  branch_id TEXT,
  branch_name TEXT,
  room_name TEXT,
  check_in TEXT,
  check_out TEXT,
  nights INTEGER DEFAULT 1,
  adults INTEGER DEFAULT 2,
  children INTEGER DEFAULT 0,
  total_price INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  card_last4 TEXT,
  special_request TEXT,
  created_at TEXT,
  updated_at TEXT
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  target_id TEXT NOT NULL,
  target_name TEXT,
  guest_name TEXT,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TEXT
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'guest',
  loyalty_points INTEGER DEFAULT 0,
  created_at TEXT,
  updated_at TEXT
);

-- Seed Branches
INSERT OR IGNORE INTO branches (id, name, region, brand, description, image, rating, review_count, price_per_night, amenities, popular_for, created_at, updated_at) VALUES
('branch-1', 'GrandStay Premier Thai Nguyen', 'Northern Highlands', 'GrandStay Premier', 'Trải nghiệm khu nghỉ dưỡng đẳng cấp nép mình bên những đồi chè thơ mộng.', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80', 4.9, 142, 3000000, '["Pool","Spa","Tea Garden","Gym","Restaurant","Free Wi-Fi"]', 'Eco-Luxury & Wellness', '', ''),
('branch-2', 'GrandStay Beachfront Resort Phu Quoc', 'South Coast', 'GrandStay Resort', 'Thiên đường nghỉ dưỡng sát biển với bãi cát trắng mịn.', 'https://images.unsplash.com/photo-1540548149366-8a998d7806f3?auto=format&fit=crop&w=1200&q=80', 4.8, 289, 4500000, '["Private Beach","Pool","Bar","Water Sports","Spa","Kids Club"]', 'Sunset Ocean View', '', ''),
('branch-3', 'GrandStay Lux Waterfront Da Nang', 'Central Coast', 'GrandStay Lux', 'Khách sạn cao tầng sang trọng bên sông Hàn thơ mộng.', 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80', 4.7, 412, 3750000, '["Rooftop Bar","Pool","Gym","Conference","Fine Dining","Free Wi-Fi"]', 'Skyline & River Views', '', ''),
('branch-4', 'GrandStay Heritage Oasis Hanoi', 'Capital Region', 'GrandStay Heritage', 'Biệt thự phong cách Indochine yên bình giữa lòng Hà Nội cổ kính.', 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80', 4.9, 95, 2750000, '["Boutique Garden","Spa","Traditional Tea","Free Wi-Fi","Bicycle Rental"]', 'Cultural & Historic Charm', '', ''),
('branch-5', 'GrandStay Urban Suites Saigon', 'Southern Metropolis', 'GrandStay Suites', 'Căn hộ dịch vụ cao cấp bậc nhất tại trung tâm Quận 1.', 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80', 4.6, 184, 3375000, '["Kitchenette","Infinity Pool","Smart Home","Gym","24/7 Lounge"]', 'Modern Urban Living', '', ''),
('branch-6', 'GrandStay Cloud Retreat Sapa', 'Northern Highlands', 'GrandStay Resort', 'Nghỉ dưỡng mộc mạc đẳng cấp trên đỉnh đồi mờ sương.', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80', 4.9, 210, 4125000, '["Fireplace","Heated Pool","Spa","Organic Dining","Mountain Trekking"]', 'Mountain View & Serenity', '', '');

-- Seed Apartments
INSERT OR IGNORE INTO apartments (id, name, location, type, area, bedrooms, bathrooms, monthly_price, rating, review_count, image, description, amenities, has_virtual_tour, pet_friendly, created_at, updated_at) VALUES
('apt-1', 'Metropolitan Luxury Studio - Saigon Central', 'Saigon', 'Studio', 38, 1, 1, 23750000, 4.8, 74, 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', 'Căn hộ Studio cao cấp sở hữu ban công kính nhìn trực diện Landmark 81.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Smart Lock","Gym","Pool"]', 1, 1, '', ''),
('apt-2', 'Indochine Heritage 1BR Suite - Hoan Kiem', 'Hanoi', '1-Bedroom', 52, 1, 1, 27500000, 4.9, 43, 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', 'Căn hộ kết hợp tinh tế giữa nét đẹp Indochine truyền thống.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Smart Lock","Bicycle","Cleaning Service"]', 1, 0, '', ''),
('apt-3', 'My Khe Beachfront Panoramic 2BR', 'Da Nang', '2-Bedroom', 78, 2, 2, 36250000, 4.7, 92, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', 'Thức dậy cùng bình minh rực rỡ trên biển Mỹ Khê.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Smart Lock","Pool","Gym","Parking"]', 0, 1, '', ''),
('apt-4', 'Sunset Horizon Pool Villa', 'Phu Quoc', 'Penthouse', 120, 3, 3, 70000000, 4.95, 28, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'Trải nghiệm phong cách sống sang trọng tại căn Penthouse.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Smart Lock","Pool","Private Beach","Jacuzzi","Chef Service"]', 1, 1, '', ''),
('apt-5', 'Misty Valley Cozy Chalet', 'Sapa', '1-Bedroom', 48, 1, 1, 20000000, 4.85, 51, 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80', 'Tận hưởng kỳ nghỉ trốn bụi mịn tại căn hộ gỗ phong cách Scandinavian.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Fireplace","Heated Pool","Balcony"]', 0, 1, '', ''),
('apt-6', 'Zen Garden Tea-view Suite', 'Thai Nguyen', 'Service Apartment', 45, 1, 1, 18750000, 4.9, 35, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', 'Căn hộ dịch vụ cao cấp hướng đồi chè thơ mộng.', '["Kitchen","Washing Machine","Desk","High-speed Wi-Fi","Tea Garden","Spa","Pool","Cleaning Service"]', 1, 0, '', '');
