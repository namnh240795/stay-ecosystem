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
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

// ─── Branch Amenities ───────────────────────────────────────────────────────

export const branchAmenities = sqliteTable('branch_amenities', {
  id: text('id').primaryKey(), // UUID
  branchId: text('branch_id')
    .notNull()
    .references(() => branches.id),
  amenityName: text('amenity_name').notNull(),
});

export type BranchAmenity = typeof branchAmenities.$inferSelect;
export type NewBranchAmenity = typeof branchAmenities.$inferInsert;

// ─── Web Apartments ─────────────────────────────────────────────────────────

export const webApartments = sqliteTable('web_apartments', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  branchId: text('branch_id'),
  type: text('type'),
  location: text('location'),
  address: text('address'),
  description: text('description'),
  imageUrl: text('image_url'),
  pricePerNight: real('price_per_night'),
  maxGuests: integer('max_guests'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  petFriendly: text('pet_friendly'),
  hasVirtualTour: text('has_virtual_tour'),
  virtualTourUrl: text('virtual_tour_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type WebApartment = typeof webApartments.$inferSelect;
export type NewWebApartment = typeof webApartments.$inferInsert;

// ─── Web Apartment Amenities ────────────────────────────────────────────────

export const webApartmentAmenities = sqliteTable('web_apartment_amenities', {
  id: text('id').primaryKey(), // UUID
  apartmentId: text('apartment_id')
    .notNull()
    .references(() => webApartments.id),
  amenityName: text('amenity_name').notNull(),
});

export type WebApartmentAmenity = typeof webApartmentAmenities.$inferSelect;
export type NewWebApartmentAmenity = typeof webApartmentAmenities.$inferInsert;

// ─── Web Apartment Images ───────────────────────────────────────────────────

export const webApartmentImages = sqliteTable('web_apartment_images', {
  id: text('id').primaryKey(), // UUID
  apartmentId: text('apartment_id')
    .notNull()
    .references(() => webApartments.id),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
});

export type WebApartmentImage = typeof webApartmentImages.$inferSelect;
export type NewWebApartmentImage = typeof webApartmentImages.$inferInsert;

// ─── Site Config ────────────────────────────────────────────────────────────

export const siteConfig = sqliteTable('site_config', {
  key: text('key').primaryKey(),
  value: text('value'), // JSON text
  updatedAt: text('updated_at').notNull().default(''),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type NewSiteConfig = typeof siteConfig.$inferInsert;
