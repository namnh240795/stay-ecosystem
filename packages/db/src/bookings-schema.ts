import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { properties } from './properties-schema';

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookings = sqliteTable('bookings', {
  bookingsId: text('bookings_id').primaryKey(), // UUID
  bookingsPropertyId: text('bookings_property_id')
    .notNull()
    .references(() => properties.propertiesId),
  bookingsGuestId: text('bookings_guest_id')
    .notNull()
    .references(() => users.usersId),
  bookingsPartnerId: text('bookings_partner_id')
    .notNull()
    .references(() => users.usersId),
  bookingsCheckIn: text('bookings_check_in').notNull(), // ISO date string
  bookingsCheckOut: text('bookings_check_out').notNull(), // ISO date string
  bookingsNights: integer('bookings_nights').notNull(),
  bookingsGuests: integer('bookings_guests').notNull().default(1),
  bookingsTotalPrice: real('bookings_total_price').notNull(),
  bookingsStatus: text('bookings_status').notNull().default('pending'), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  bookingsSpecialRequests: text('bookings_special_requests'),
  bookingsCancellationReason: text('bookings_cancellation_reason'),
  bookingsCancelledAt: text('bookings_cancelled_at'),
  bookingsConfirmedAt: text('bookings_confirmed_at'),
  bookingsCompletedAt: text('bookings_completed_at'),
  bookingsCreatedAt: text('bookings_created_at').notNull().default(''),
  bookingsUpdatedAt: text('bookings_updated_at').notNull().default(''),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
