import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { properties } from './properties-schema';

// ─── Bookings ────────────────────────────────────────────────────────────────

export const bookings = sqliteTable('bookings', {
  id: text('id').primaryKey(), // UUID
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  guestId: text('guest_id')
    .notNull()
    .references(() => users.id),
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  checkIn: text('check_in').notNull(), // ISO date string
  checkOut: text('check_out').notNull(), // ISO date string
  nights: integer('nights').notNull(),
  guests: integer('guests').notNull().default(1),
  totalPrice: real('total_price').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  specialRequests: text('special_requests'),
  cancellationReason: text('cancellation_reason'),
  cancelledAt: text('cancelled_at'),
  confirmedAt: text('confirmed_at'),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
