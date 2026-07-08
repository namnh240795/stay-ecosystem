import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Branches ───────────────────────────────────────────────────────────────

export const branches = sqliteTable('branches', {
  branchesId: text('branches_id').primaryKey(), // UUID
  branchesName: text('branches_name').notNull(),
  branchesBrand: text('branches_brand'),
  branchesLocation: text('branches_location'),
  branchesAddress: text('branches_address'),
  branchesPhone: text('branches_phone'),
  branchesEmail: text('branches_email'),
  branchesDescription: text('branches_description'),
  branchesImageUrl: text('branches_image_url'),
  branchesIsActive: integer('branches_is_active', { mode: 'boolean' }).notNull().default(true),
  branchesCreatedAt: text('branches_created_at').notNull().default(''),
  branchesUpdatedAt: text('branches_updated_at').notNull().default(''),
});

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;

// ─── Branch Amenities ───────────────────────────────────────────────────────

export const branchAmenities = sqliteTable('branch_amenities', {
  branchAmenitiesId: text('branch_amenities_id').primaryKey(), // UUID
  branchAmenitiesBranchId: text('branch_amenities_branch_id')
    .notNull()
    .references(() => branches.branchesId),
  branchAmenitiesAmenityName: text('branch_amenities_amenity_name').notNull(),
});

export type BranchAmenity = typeof branchAmenities.$inferSelect;
export type NewBranchAmenity = typeof branchAmenities.$inferInsert;

// ─── Web Apartments ─────────────────────────────────────────────────────────

export const webApartments = sqliteTable('web_apartments', {
  webApartmentsId: text('web_apartments_id').primaryKey(), // UUID
  webApartmentsName: text('web_apartments_name').notNull(),
  webApartmentsBranchId: text('web_apartments_branch_id'),
  webApartmentsType: text('web_apartments_type'),
  webApartmentsLocation: text('web_apartments_location'),
  webApartmentsAddress: text('web_apartments_address'),
  webApartmentsDescription: text('web_apartments_description'),
  webApartmentsImageUrl: text('web_apartments_image_url'),
  webApartmentsPricePerNight: real('web_apartments_price_per_night'),
  webApartmentsMaxGuests: integer('web_apartments_max_guests'),
  webApartmentsBedrooms: integer('web_apartments_bedrooms'),
  webApartmentsBathrooms: integer('web_apartments_bathrooms'),
  webApartmentsPetFriendly: text('web_apartments_pet_friendly'),
  webApartmentsHasVirtualTour: text('web_apartments_has_virtual_tour'),
  webApartmentsVirtualTourUrl: text('web_apartments_virtual_tour_url'),
  webApartmentsIsActive: integer('web_apartments_is_active', { mode: 'boolean' }).notNull().default(true),
  webApartmentsCreatedAt: text('web_apartments_created_at').notNull().default(''),
  webApartmentsUpdatedAt: text('web_apartments_updated_at').notNull().default(''),
});

export type WebApartment = typeof webApartments.$inferSelect;
export type NewWebApartment = typeof webApartments.$inferInsert;

// ─── Web Apartment Amenities ────────────────────────────────────────────────

export const webApartmentAmenities = sqliteTable('web_apartment_amenities', {
  webApartmentAmenitiesId: text('web_apartment_amenities_id').primaryKey(), // UUID
  webApartmentAmenitiesApartmentId: text('web_apartment_amenities_apartment_id')
    .notNull()
    .references(() => webApartments.webApartmentsId),
  webApartmentAmenitiesAmenityName: text('web_apartment_amenities_amenity_name').notNull(),
});

export type WebApartmentAmenity = typeof webApartmentAmenities.$inferSelect;
export type NewWebApartmentAmenity = typeof webApartmentAmenities.$inferInsert;

// ─── Web Apartment Images ───────────────────────────────────────────────────

export const webApartmentImages = sqliteTable('web_apartment_images', {
  webApartmentImagesId: text('web_apartment_images_id').primaryKey(), // UUID
  webApartmentImagesApartmentId: text('web_apartment_images_apartment_id')
    .notNull()
    .references(() => webApartments.webApartmentsId),
  webApartmentImagesImageUrl: text('web_apartment_images_image_url').notNull(),
  webApartmentImagesSortOrder: integer('web_apartment_images_sort_order').default(0),
});

export type WebApartmentImage = typeof webApartmentImages.$inferSelect;
export type NewWebApartmentImage = typeof webApartmentImages.$inferInsert;

// ─── Site Config ────────────────────────────────────────────────────────────

export const siteConfig = sqliteTable('site_config', {
  siteConfigKey: text('site_config_key').primaryKey(),
  siteConfigValue: text('site_config_value'), // JSON text
  siteConfigUpdatedAt: text('site_config_updated_at').notNull().default(''),
});

export type SiteConfig = typeof siteConfig.$inferSelect;
export type NewSiteConfig = typeof siteConfig.$inferInsert;
