import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';

// ─── Properties ──────────────────────────────────────────────────────────────

export const properties = sqliteTable('properties', {
  propertiesId: text('properties_id').primaryKey(), // UUID
  propertiesPartnerId: text('properties_partner_id')
    .notNull()
    .references(() => users.usersId),
  propertiesTitle: text('properties_title').notNull(),
  propertiesDescription: text('properties_description').notNull(),
  propertiesAddress: text('properties_address').notNull(),
  propertiesCity: text('properties_city').notNull(),
  propertiesCountry: text('properties_country').notNull(),
  propertiesLatitude: real('properties_latitude'),
  propertiesLongitude: real('properties_longitude'),
  propertiesPricePerNight: real('properties_price_per_night').notNull(),
  propertiesMaxGuests: integer('properties_max_guests').notNull().default(2),
  propertiesBedrooms: integer('properties_bedrooms').notNull().default(1),
  propertiesBathrooms: integer('properties_bathrooms').notNull().default(1),
  propertiesPropertyType: text('properties_property_type').notNull().default('apartment'), // 'apartment' | 'house' | 'condo' | 'villa'
  propertiesStatus: text('properties_status').notNull().default('active'), // 'active' | 'inactive' | 'maintenance'
  propertiesRules: text('properties_rules'), // house rules text
  propertiesCreatedAt: text('properties_created_at').notNull().default(''),
  propertiesUpdatedAt: text('properties_updated_at').notNull().default(''),
});

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;

// ─── Property Images ────────────────────────────────────────────────────────

export const propertyImages = sqliteTable('property_images', {
  propertyImagesId: text('property_images_id').primaryKey(), // UUID
  propertyImagesPropertyId: text('property_images_property_id')
    .notNull()
    .references(() => properties.propertiesId),
  propertyImagesImageUrl: text('property_images_image_url').notNull(),
  propertyImagesSortOrder: integer('property_images_sort_order').default(0),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;

// ─── Amenities ───────────────────────────────────────────────────────────────

export const amenities = sqliteTable('amenities', {
  amenitiesId: text('amenities_id').primaryKey(), // UUID
  amenitiesName: text('amenities_name').notNull().unique(),
  amenitiesIcon: text('amenities_icon'),
  amenitiesCategory: text('amenities_category'), // 'basic' | 'comfort' | 'entertainment' | 'outdoor'
});

export type Amenity = typeof amenities.$inferSelect;
export type NewAmenity = typeof amenities.$inferInsert;

// ─── Property Amenities (junction) ───────────────────────────────────────────

export const propertyAmenities = sqliteTable('property_amenities', {
  propertyAmenitiesPropertyId: text('property_amenities_property_id')
    .notNull()
    .references(() => properties.propertiesId),
  propertyAmenitiesAmenityId: text('property_amenities_amenity_id')
    .notNull()
    .references(() => amenities.amenitiesId),
});

export type PropertyAmenity = typeof propertyAmenities.$inferSelect;

// ─── Availability ────────────────────────────────────────────────────────────

export const availability = sqliteTable('availability', {
  availabilityId: text('availability_id').primaryKey(), // UUID
  availabilityPropertyId: text('availability_property_id')
    .notNull()
    .references(() => properties.propertiesId),
  availabilityDate: text('availability_date').notNull(), // ISO date string (YYYY-MM-DD)
  availabilityIsAvailable: integer('availability_is_available', { mode: 'boolean' }).notNull().default(true),
  availabilityPriceOverride: real('availability_price_override'), // if null, uses property.pricePerNight
  availabilityMinStay: integer('availability_min_stay').default(1),
  availabilityCreatedAt: text('availability_created_at').notNull().default(''),
  availabilityUpdatedAt: text('availability_updated_at').notNull().default(''),
});

export type Availability = typeof availability.$inferSelect;
export type NewAvailability = typeof availability.$inferInsert;
