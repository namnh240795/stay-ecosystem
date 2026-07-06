-- Admin Service Database Seed
-- Run: npx wrangler d1 execute DB --local --file=./seed.sql

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'guest',
  auth0_sub TEXT UNIQUE,
  partner_id TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  partner_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  price_per_night REAL NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms INTEGER NOT NULL DEFAULT 1,
  bathrooms INTEGER NOT NULL DEFAULT 1,
  property_type TEXT NOT NULL DEFAULT 'apartment',
  status TEXT NOT NULL DEFAULT 'active',
  images TEXT,
  rules TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  guest_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  check_in TEXT NOT NULL,
  check_out TEXT NOT NULL,
  nights INTEGER NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  cancellation_reason TEXT,
  cancelled_at TEXT,
  confirmed_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  booking_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'VND',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  booking_id TEXT,
  guest_id TEXT NOT NULL,
  partner_id TEXT,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  partner_reply TEXT,
  created_at TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT ''
);

-- Seed Users
INSERT OR IGNORE INTO users (id, email, name, phone, role, auth0_sub, created_at, updated_at) VALUES
('usr-001', 'namnh240795+grandstayadmin@gmail.com', 'Admin User', '0912345678', 'admin', 'auth0|6a4b3698e68cc397a48bdfc4', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('usr-002', 'namnh240795+grandstaypartner@gmail.com', 'Partner User', '0987654321', 'partner', 'auth0|6a4b36a724b21a5abef8a385', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('usr-003', 'namnh240795+grandstayguest@gmail.com', 'Guest User', '0905123456', 'guest', 'auth0|6a4b36a8281483a678fbfa66', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('usr-004', 'nguyenvanA@gmail.com', 'Nguyen Van A', '0911111111', 'guest', NULL, '2026-06-01T00:00:00Z', '2026-06-01T00:00:00Z'),
('usr-005', 'tranthib@gmail.com', 'Tran Thi B', '0922222222', 'partner', NULL, '2026-06-01T00:00:00Z', '2026-06-01T00:00:00Z'),
('usr-006', 'phamhoang@gmail.com', 'Pham Hoang C', '0933333333', 'guest', NULL, '2026-06-15T00:00:00Z', '2026-06-15T00:00:00Z');

-- Seed Properties
INSERT OR IGNORE INTO properties (id, partner_id, title, description, address, city, country, price_per_night, max_guests, bedrooms, bathrooms, property_type, status, created_at, updated_at) VALUES
('prop-001', 'usr-002', 'Metropolitan Luxury Studio - Saigon Central', 'Căn hộ Studio cao cấp sở hữu ban công kính nhìn trực diện Landmark 81.', '123 Nguyen Hue, District 1', 'Ho Chi Minh City', 'Vietnam', 2375000, 2, 1, 1, 'apartment', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('prop-002', 'usr-002', 'Indochine Heritage 1BR Suite - Hoan Kiem', 'Căn hộ kết hợp tinh tế giữa nét đẹp Indochine truyền thống.', '45 Hang Bai, Hoan Kiem', 'Hanoi', 'Vietnam', 2750000, 2, 1, 1, 'apartment', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('prop-003', 'usr-002', 'My Khe Beachfront Panoramic 2BR', 'Thức dậy cùng bình minh rực rỡ trên biển Mỹ Khê.', '78 Vo Nguyen Giap, Son Tra', 'Da Nang', 'Vietnam', 3625000, 4, 2, 2, 'apartment', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('prop-004', 'usr-005', 'Sunset Horizon Pool Villa', 'Trải nghiệm phong cách sống sang trọng tại căn Penthouse.', '12 Tran Hung Dao, Duong Dong', 'Phu Quoc', 'Vietnam', 7000000, 6, 3, 3, 'villa', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('prop-005', 'usr-005', 'Misty Valley Cozy Chalet', 'Tận hưởng kỳ nghỉ trốn bụi mịn tại căn hộ gỗ.', '88 Fansipan, Sa Pa', 'Lao Cai', 'Vietnam', 2000000, 2, 1, 1, 'apartment', 'active', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
('prop-006', 'usr-002', 'Zen Garden Tea-view Suite', 'Căn hộ dịch vụ cao cấp hướng đồi chè.', '15 Dong Tam, Thai Nguyen', 'Thai Nguyen', 'Vietnam', 1875000, 2, 1, 1, 'apartment', 'maintenance', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z');

-- Seed Bookings
INSERT OR IGNORE INTO bookings (id, property_id, guest_id, partner_id, check_in, check_out, nights, guests, total_price, status, created_at, updated_at) VALUES
('bk-001', 'prop-001', 'usr-003', 'usr-002', '2026-07-01', '2026-07-04', 3, 2, 7125000, 'confirmed', '2026-06-25T10:00:00Z', '2026-06-25T10:00:00Z'),
('bk-002', 'prop-002', 'usr-004', 'usr-002', '2026-07-05', '2026-07-08', 3, 2, 8250000, 'pending', '2026-06-28T14:00:00Z', '2026-06-28T14:00:00Z'),
('bk-003', 'prop-003', 'usr-006', 'usr-002', '2026-07-10', '2026-07-15', 5, 3, 18125000, 'confirmed', '2026-06-20T09:00:00Z', '2026-06-20T09:00:00Z'),
('bk-004', 'prop-004', 'usr-003', 'usr-005', '2026-07-01', '2026-07-03', 2, 4, 14000000, 'completed', '2026-06-15T11:00:00Z', '2026-07-03T12:00:00Z'),
('bk-005', 'prop-005', 'usr-004', 'usr-005', '2026-07-20', '2026-07-25', 5, 2, 10000000, 'pending', '2026-07-01T08:00:00Z', '2026-07-01T08:00:00Z'),
('bk-006', 'prop-001', 'usr-006', 'usr-002', '2026-06-25', '2026-06-28', 3, 2, 7125000, 'cancelled', '2026-06-20T16:00:00Z', '2026-06-26T10:00:00Z');

-- Seed Payments
INSERT OR IGNORE INTO payments (id, booking_id, partner_id, amount, currency, status, payment_method, transaction_id, created_at, updated_at) VALUES
('pay-001', 'bk-001', 'usr-002', 7125000, 'VND', 'completed', 'sepay', 'SEPAY-001', '2026-06-25T10:05:00Z', '2026-06-25T10:05:00Z'),
('pay-002', 'bk-003', 'usr-002', 18125000, 'VND', 'completed', 'stripe', 'STRIPE-003', '2026-06-20T09:05:00Z', '2026-06-20T09:05:00Z'),
('pay-003', 'bk-004', 'usr-005', 14000000, 'VND', 'completed', 'sepay', 'SEPAY-004', '2026-06-15T11:05:00Z', '2026-06-15T11:05:00Z'),
('pay-004', 'bk-002', 'usr-002', 8250000, 'VND', 'pending', 'sepay', NULL, '2026-06-28T14:05:00Z', '2026-06-28T14:05:00Z'),
('pay-005', 'bk-005', 'usr-005', 10000000, 'VND', 'pending', 'stripe', NULL, '2026-07-01T08:05:00Z', '2026-07-01T08:05:00Z');

-- Seed Reviews
INSERT OR IGNORE INTO reviews (id, property_id, guest_id, rating, comment, created_at, updated_at) VALUES
('rev-001', 'prop-001', 'usr-003', 5, 'Phòng tuyệt vời, view Landmark 81 rất đẹp!', '2026-07-04T10:00:00Z', '2026-07-04T10:00:00Z'),
('rev-002', 'prop-003', 'usr-006', 4, 'Biển Mỹ Khê tuyệt đẹp, phòng sạch sẽ.', '2026-07-15T10:00:00Z', '2026-07-15T10:00:00Z'),
('rev-003', 'prop-004', 'usr-003', 5, 'Villa sang trọng, hồ bơi riêng tuyệt vời!', '2026-07-03T10:00:00Z', '2026-07-03T10:00:00Z');
