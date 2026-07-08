import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';

// ─── Properties ──────────────────────────────────────────────────────────────

export const properties = sqliteTable('properties', {
  id: text('id').primaryKey(), // UUID
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  title: text('title').notNull(),
  description: text('description').notNull(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  pricePerNight: real('price_per_night').notNull(),
  maxGuests: integer('max_guests').notNull().default(2),
  bedrooms: integer('bedrooms').notNull().default(1),
  bathrooms: integer('bathrooms').notNull().default(1),
  propertyType: text('property_type').notNull().default('apartment'), // 'apartment' | 'house' | 'condo' | 'villa'
  status: text('status').notNull().default('active'), // 'active' | 'inactive' | 'maintenance'
  rules: text('rules'), // house rules text
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

// ─── Property Images ────────────────────────────────────────────────────────

export const propertyImages = sqliteTable('property_images', {
  id: text('id').primaryKey(), // UUID
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  imageUrl: text('image_url').notNull(),
  sortOrder: integer('sort_order').default(0),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;

// ─── Amenities ───────────────────────────────────────────────────────────────

export const amenities = sqliteTable('amenities', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull().unique(),
  icon: text('icon'),
  category: text('category'), // 'basic' | 'comfort' | 'entertainment' | 'outdoor'
});

export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;

// ─── Property Amenities (junction) ───────────────────────────────────────────

export const propertyAmenities = sqliteTable('property_amenities', {
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  amenityId: text('amenity_id')
    .notNull()
    .references(() => amenities.id),
});

export type PropertyAmenity = typeof propertyAmenities.$inferSelect;

// ─── Availability ────────────────────────────────────────────────────────────

export const availability = sqliteTable('availability', {
  id: text('id').primaryKey(), // UUID
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  date: text('date').notNull(), // ISO date string (YYYY-MM-DD)
  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
  priceOverride: real('price_override'), // if null, uses property.pricePerNight
  minStay: integer('min_stay').default(1),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Availability = typeof availability.$inferSelect;
export type NewAvailability = typeof availability.$inferInsert;
