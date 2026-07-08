import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

// ─── Long-term Apartments ───────────────────────────────────────────────────

export const longtermApartments = sqliteTable('longterm_apartments', {
  longtermApartmentsId: text('longterm_apartments_id').primaryKey(), // UUID
  longtermApartmentsPartnerId: text('longterm_apartments_partner_id'),
  longtermApartmentsName: text('longterm_apartments_name').notNull(),
  longtermApartmentsLocation: text('longterm_apartments_location'),
  longtermApartmentsType: text('longterm_apartments_type'),
  longtermApartmentsArea: text('longterm_apartments_area'),
  longtermApartmentsBedrooms: text('longterm_apartments_bedrooms'),
  longtermApartmentsBathrooms: text('longterm_apartments_bathrooms'),
  longtermApartmentsMonthlyPrice: real('longterm_apartments_monthly_price'),
  longtermApartmentsDescription: text('longterm_apartments_description'),
  longtermApartmentsAvailableFrom: text('longterm_apartments_available_from'),
  longtermApartmentsHasVirtualTour: text('longterm_apartments_has_virtual_tour'),
  longtermApartmentsVirtualTourUrl: text('longterm_apartments_virtual_tour_url'),
  longtermApartmentsPetFriendly: text('longterm_apartments_pet_friendly'),
  longtermApartmentsStatus: text('longterm_apartments_status').notNull().default('available'), // 'available' | 'rented' | 'maintenance' | 'inactive'
  longtermApartmentsCreatedAt: text('longterm_apartments_created_at').notNull().default(''),
  longtermApartmentsUpdatedAt: text('longterm_apartments_updated_at').notNull().default(''),
});

export type LongtermApartment = typeof longtermApartments.$inferSelect;
export type NewLongtermApartment = typeof longtermApartments.$inferInsert;

// ─── Long-term Apartment Amenities ──────────────────────────────────────────

export const longtermAmenities = sqliteTable('longterm_amenities', {
  longtermAmenitiesId: text('longterm_amenities_id').primaryKey(), // UUID
  longtermAmenitiesApartmentId: text('longterm_amenities_apartment_id')
    .notNull()
    .references(() => longtermApartments.longtermApartmentsId),
  longtermAmenitiesAmenityName: text('longterm_amenities_amenity_name').notNull(),
});

export type LongtermAmenity = typeof longtermAmenities.$inferSelect;
export type NewLongtermAmenity = typeof longtermAmenities.$inferInsert;

// ─── Maintenance Records (5NF: extracted from longtermApartments) ─────────────

export const maintenanceRecords = sqliteTable('maintenance_records', {
  maintenanceRecordsId: text('maintenance_records_id').primaryKey(), // UUID
  maintenanceRecordsApartmentId: text('maintenance_records_apartment_id')
    .notNull()
    .references(() => longtermApartments.longtermApartmentsId),
  maintenanceRecordsStatus: text('maintenance_records_status').notNull().default('clean'), // 'clean' | 'needs_repair' | 'under_maintenance'
  maintenanceRecordsEstimatedCost: real('maintenance_records_estimated_cost'),
  maintenanceRecordsNotes: text('maintenance_records_notes'),
  maintenanceRecordsCreatedAt: text('maintenance_records_created_at').notNull().default(''),
  maintenanceRecordsUpdatedAt: text('maintenance_records_updated_at').notNull().default(''),
});

export type MaintenanceRecord = typeof maintenanceRecords.$inferSelect;
export type NewMaintenanceRecord = typeof maintenanceRecords.$inferInsert;

// ─── Long-term Contracts ────────────────────────────────────────────────────

export const longtermContracts = sqliteTable('longterm_contracts', {
  longtermContractsId: text('longterm_contracts_id').primaryKey(), // UUID
  longtermContractsAptId: text('longterm_contracts_apt_id')
    .notNull()
    .references(() => longtermApartments.longtermApartmentsId),
  longtermContractsLeaseTerm: text('longterm_contracts_lease_term'),
  longtermContractsTenantName: text('longterm_contracts_tenant_name'),
  longtermContractsTenantPhone: text('longterm_contracts_tenant_phone'),
  longtermContractsTenantEmail: text('longterm_contracts_tenant_email'),
  longtermContractsSignedDate: text('longterm_contracts_signed_date'),
  longtermContractsStatus: text('longterm_contracts_status').notNull().default('active'), // 'active' | 'expired' | 'terminated' | 'pending'
  longtermContractsCreatedAt: text('longterm_contracts_created_at').notNull().default(''),
  longtermContractsUpdatedAt: text('longterm_contracts_updated_at').notNull().default(''),
});

export type LongtermContract = typeof longtermContracts.$inferSelect;
export type NewLongtermContract = typeof longtermContracts.$inferInsert;
