import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Branches ───────────────────────────────────────────────────────────────

export const branches = sqliteTable('branches', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  brand: text('brand'),
  location: text('location'),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  description: text('description'),
  imageUrl: text('image_url'),
  amenities: text('amenities'), // JSON text
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

// ─── Web Apartments ─────────────────────────────────────────────────────────

export const webApartments = sqliteTable('web_apartments', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  branchId: text('branch_id'),
  branchName: text('branch_name'),
  type: text('type'),
  location: text('location'),
  address: text('address'),
  description: text('description'),
  imageUrl: text('image_url'),
  images: text('images'), // JSON text
  pricePerNight: real('price_per_night'),
  maxGuests: integer('max_guests'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  petFriendly: text('pet_friendly'),
  hasVirtualTour: text('has_virtual_tour'),
  virtualTourUrl: text('virtual_tour_url'),
  amenities: text('amenities'), // JSON text
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type WebApartment = typeof webApartments.$inferSelect;
export type NewWebApartment = typeof webApartments.$inferInsert;

// ─── Site Config ────────────────────────────────────────────────────────────

export const siteConfig = sqliteTable('site_config', {
  key: text('key').primaryKey(),
  value: text('value'), // JSON text
  updatedAt: text('updated_at').notNull().default(''),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type NewSiteConfig = typeof siteConfig.$inferInsert;
