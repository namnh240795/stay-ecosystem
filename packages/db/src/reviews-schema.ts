import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { properties } from './properties-schema';
import { bookings } from './bookings-schema';

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = sqliteTable('reviews', {
  id: text('id').primaryKey(), // UUID
  propertyId: text('property_id')
    .notNull()
    .references(() => properties.id),
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id),
  guestId: text('guest_id')
    .notNull()
    .references(() => users.id),
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  partnerReply: text('partner_reply'), // partner's response to the review
  partnerRepliedAt: text('partner_replied_at'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
