import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

// ─── Long-term Apartments ───────────────────────────────────────────────────

export const longtermApartments = sqliteTable('longterm_apartments', {
  id: text('id').primaryKey(), // UUID
  partnerId: text('partner_id'),
  name: text('name').notNull(),
  location: text('location'),
  type: text('type'),
  area: text('area'),
  bedrooms: text('bedrooms'),
  bathrooms: text('bathrooms'),
  monthlyPrice: real('monthly_price'),
  description: text('description'),
  availableFrom: text('available_from'),
  hasVirtualTour: text('has_virtual_tour'),
  virtualTourUrl: text('virtual_tour_url'),
  petFriendly: text('pet_friendly'),
  status: text('status').notNull().default('available'), // 'available' | 'rented' | 'maintenance' | 'inactive'
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type LongtermApartment = typeof longtermApartments.$inferSelect;
export type NewLongtermApartment = typeof longtermApartments.$inferInsert;

// ─── Long-term Apartment Amenities ──────────────────────────────────────────

export const longtermAmenities = sqliteTable('longterm_amenities', {
  id: text('id').primaryKey(), // UUID
  apartmentId: text('apartment_id')
    .notNull()
    .references(() => longtermApartments.id),
  amenityName: text('amenity_name').notNull(),
});

export type LongtermAmenity = typeof longtermAmenities.$inferSelect;
export type NewLongtermAmenity = typeof longtermAmenities.$inferInsert;

// ─── Maintenance Records (5NF: extracted from longtermApartments) ─────────────

export const maintenanceRecords = sqliteTable('maintenance_records', {
  id: text('id').primaryKey(), // UUID
  apartmentId: text('apartment_id')
    .notNull()
    .references(() => longtermApartments.id),
  status: text('status').notNull().default('clean'), // 'clean' | 'needs_repair' | 'under_maintenance'
  estimatedCost: real('estimated_cost'),
  notes: text('notes'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

// ─── Long-term Contracts ────────────────────────────────────────────────────

export const longtermContracts = sqliteTable('longterm_contracts', {
  id: text('id').primaryKey(), // UUID
  aptId: text('apt_id')
    .notNull()
    .references(() => longtermApartments.id),
  leaseTerm: text('lease_term'),
  tenantName: text('tenant_name'),
  tenantPhone: text('tenant_phone'),
  tenantEmail: text('tenant_email'),
  signedDate: text('signed_date'),
  status: text('status').notNull().default('active'), // 'active' | 'expired' | 'terminated' | 'pending'
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type LongtermContract = typeof longtermContracts.$inferSelect;
export type NewLongtermContract = typeof longtermContracts.$inferInsert;
