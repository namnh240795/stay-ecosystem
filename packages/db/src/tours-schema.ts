import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Tours ──────────────────────────────────────────────────────────────────

export const tours = sqliteTable('tours', {
  toursId: text('tours_id').primaryKey(), // UUID
  toursName: text('tours_name').notNull(),
  toursRegion: text('tours_region'),
  toursImage: text('tours_image'),
  toursPricePerSlot: real('tours_price_per_slot'),
  toursMaxSlots: integer('tours_max_slots'),
  toursDuration: text('tours_duration'),
  toursRating: real('tours_rating'),
  toursDescription: text('tours_description'),
  toursTourType: text('tours_tour_type'),
  toursCreatedAt: text('tours_created_at').notNull().default(''),
  toursUpdatedAt: text('tours_updated_at').notNull().default(''),
});

export type Tour = typeof tours.$inferSelect;
export type NewTour = typeof tours.$inferInsert;

// ─── Tour Highlights ────────────────────────────────────────────────────────

export const tourHighlights = sqliteTable('tour_highlights', {
  tourHighlightsId: text('tour_highlights_id').primaryKey(), // UUID
  tourHighlightsTourId: text('tour_highlights_tour_id')
    .notNull()
    .references(() => tours.toursId),
  tourHighlightsHighlightText: text('tour_highlights_highlight_text').notNull(),
  tourHighlightsSortOrder: integer('tour_highlights_sort_order').default(0),
});

export type TourHighlight = typeof tourHighlights.$inferSelect;
export type NewTourHighlight = typeof tourHighlights.$inferInsert;

// ─── Tour Itinerary ─────────────────────────────────────────────────────────

export const tourItinerary = sqliteTable('tour_itinerary', {
  tourItineraryId: text('tour_itinerary_id').primaryKey(), // UUID
  tourItineraryTourId: text('tour_itinerary_tour_id')
    .notNull()
    .references(() => tours.toursId),
  tourItineraryDayNumber: integer('tour_itinerary_day_number').notNull(),
  tourItineraryTitle: text('tour_itinerary_title'),
  tourItineraryActivities: text('tour_itinerary_activities'), // JSON array of strings for a single day
});

export type TourItinerary = typeof tourItinerary.$inferSelect;
export type NewTourItinerary = typeof tourItinerary.$inferInsert;

// ─── Tour Bookings ──────────────────────────────────────────────────────────

export const tourBookings = sqliteTable('tour_bookings', {
  tourBookingsId: text('tour_bookings_id').primaryKey(), // UUID
  tourBookingsTourId: text('tour_bookings_tour_id'),
  tourBookingsGuestName: text('tour_bookings_guest_name'),
  tourBookingsGuestPhone: text('tour_bookings_guest_phone'),
  tourBookingsGuestEmail: text('tour_bookings_guest_email'),
  tourBookingsSlots: integer('tour_bookings_slots'),
  tourBookingsTotalPrice: real('tour_bookings_total_price'),
  tourBookingsBookingCode: text('tour_bookings_booking_code'),
  tourBookingsStatus: text('tour_bookings_status').notNull().default('pending'), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  tourBookingsIsGroupTour: text('tour_bookings_is_group_tour'),
  tourBookingsGroupId: text('tour_bookings_group_id'),
  tourBookingsDate: text('tour_bookings_date'),
  tourBookingsPaymentMethod: text('tour_bookings_payment_method'),
  tourBookingsCardNumberLast4: text('tour_bookings_card_number_last4'),
  tourBookingsCreatedAt: text('tour_bookings_created_at').notNull().default(''),
  tourBookingsUpdatedAt: text('tour_bookings_updated_at').notNull().default(''),
});

export type TourBooking = typeof tourBookings.$inferSelect;
export type NewTourBooking = typeof tourBookings.$inferInsert;

// ─── Group Tours ────────────────────────────────────────────────────────────

export const groupTours = sqliteTable('group_tours', {
  groupToursId: text('group_tours_id').primaryKey(), // UUID
  groupToursTourId: text('group_tours_tour_id'),
  groupToursCreatorName: text('group_tours_creator_name'),
  groupToursCreatorEmail: text('group_tours_creator_email'),
  groupToursCurrentMembers: integer('group_tours_current_members').default(0),
  groupToursRequiredMembers: integer('group_tours_required_members'),
  groupToursStatus: text('group_tours_status').notNull().default('forming'), // 'forming' | 'ready' | 'confirmed' | 'cancelled'
  groupToursMembers: text('group_tours_members'), // JSON text
  groupToursDate: text('group_tours_date'),
  groupToursCreatedAt: text('group_tours_created_at').notNull().default(''),
  groupToursUpdatedAt: text('group_tours_updated_at').notNull().default(''),
});

export type GroupTour = typeof groupTours.$inferSelect;
export type NewGroupTour = typeof groupTours.$inferInsert;
