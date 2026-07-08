import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ─── Tours ──────────────────────────────────────────────────────────────────

export const tours = sqliteTable('tours', {
  id: text('id').primaryKey(), // UUID
  name: text('name').notNull(),
  region: text('region'),
  image: text('image'),
  pricePerSlot: real('price_per_slot'),
  maxSlots: integer('max_slots'),
  bookedSlots: integer('booked_slots').default(0),
  duration: text('duration'),
  rating: real('rating'),
  description: text('description'),
  highlights: text('highlights'), // JSON text
  tourType: text('tour_type'),
  itinerary: text('itinerary'), // JSON text
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Tour = typeof tours.$inferSelect;
export type NewTour = typeof tours.$inferInsert;

// ─── Tour Bookings ──────────────────────────────────────────────────────────

export const tourBookings = sqliteTable('tour_bookings', {
  id: text('id').primaryKey(), // UUID
  tourId: text('tour_id'),
  tourName: text('tour_name'),
  image: text('image'),
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
  tourName: text('tour_name'),
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
