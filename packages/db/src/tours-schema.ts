import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Tours ──────────────────────────────────────────────────────────────────

export const tours = sqliteTable('tours', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  region: text('region'),
  image: text('image'),
  pricePerSlot: real('price_per_slot'),
  maxSlots: integer('max_slots'),
  duration: text('duration'),
  rating: real('rating'),
  description: text('description'),
  tourType: text('tour_type'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Tour = typeof tours.$inferSelect;
export type NewTour = typeof tours.$inferInsert;

// ─── Tour Highlights ────────────────────────────────────────────────────────

export const tourHighlights = sqliteTable('tour_highlights', {
  id: text('id').primaryKey(), // UUID
  tourId: text('tour_id')
    .notNull()
    .references(() => tours.id),
  highlightText: text('highlight_text').notNull(),
  sortOrder: integer('sort_order').default(0),
});

export type TourHighlight = typeof tourHighlights.$inferSelect;
export type NewTourHighlight = typeof tourHighlights.$inferInsert;

// ─── Tour Itinerary ─────────────────────────────────────────────────────────

export const tourItinerary = sqliteTable('tour_itinerary', {
  id: text('id').primaryKey(), // UUID
  tourId: text('tour_id')
    .notNull()
    .references(() => tours.id),
  dayNumber: integer('day_number').notNull(),
  title: text('title'),
  activities: text('activities'), // JSON array of strings for a single day
});

export type TourItinerary = typeof tourItinerary.$inferSelect;
export type NewTourItinerary = typeof tourItinerary.$inferInsert;

// ─── Tour Bookings ──────────────────────────────────────────────────────────

export const tourBookings = sqliteTable('tour_bookings', {
  id: text('id').primaryKey(), // UUID
  tourId: text('tour_id'),
  guestName: text('guest_name'),
  guestPhone: text('guest_phone'),
  guestEmail: text('guest_email'),
  slots: integer('slots'),
  totalPrice: real('total_price'),
  bookingCode: text('booking_code'),
  status: text('status').notNull().default('pending'), // 'pending' | 'confirmed' | 'cancelled' | 'completed'
  isGroupTour: text('is_group_tour'),
  groupId: text('group_id'),
  date: text('date'),
  paymentMethod: text('payment_method'),
  cardNumberLast4: text('card_number_last4'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type TourBooking = typeof tourBookings.$inferSelect;
export type NewTourBooking = typeof tourBookings.$inferInsert;

// ─── Group Tours ────────────────────────────────────────────────────────────

export const groupTours = sqliteTable('group_tours', {
  id: text('id').primaryKey(), // UUID
  tourId: text('tour_id'),
  creatorName: text('creator_name'),
  creatorEmail: text('creator_email'),
  currentMembers: integer('current_members').default(0),
  requiredMembers: integer('required_members'),
  status: text('status').notNull().default('forming'), // 'forming' | 'ready' | 'confirmed' | 'cancelled'
  members: text('members'), // JSON text
  date: text('date'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type GroupTour = typeof groupTours.$inferSelect;
export type NewGroupTour = typeof groupTours.$inferInsert;
