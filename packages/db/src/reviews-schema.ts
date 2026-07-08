import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { properties } from './properties-schema';
import { bookings } from './bookings-schema';

// ─── Reviews ─────────────────────────────────────────────────────────────────

export const reviews = sqliteTable('reviews', {
  reviewsId: text('reviews_id').primaryKey(), // UUID
  reviewsPropertyId: text('reviews_property_id')
    .notNull()
    .references(() => properties.propertiesId),
  reviewsBookingId: text('reviews_booking_id')
    .notNull()
    .references(() => bookings.bookingsId),
  reviewsGuestId: text('reviews_guest_id')
    .notNull()
    .references(() => users.usersId),
  reviewsPartnerId: text('reviews_partner_id')
    .notNull()
    .references(() => users.usersId),
  reviewsRating: integer('reviews_rating').notNull(), // 1-5
  reviewsComment: text('reviews_comment'),
  reviewsPartnerReply: text('reviews_partner_reply'), // partner's response to the review
  reviewsPartnerRepliedAt: text('reviews_partner_replied_at'),
  reviewsCreatedAt: text('reviews_created_at').notNull().default(''),
  reviewsUpdatedAt: text('reviews_updated_at').notNull().default(''),
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
