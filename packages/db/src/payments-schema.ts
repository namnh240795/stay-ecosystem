import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { bookings } from './bookings-schema';

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(), // UUID
  bookingId: text('booking_id')
    .notNull()
    .references(() => bookings.id),
  partnerId: text('partner_id')
    .notNull()
    .references(() => users.id),
  amount: real('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('pending'), // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentMethod: text('payment_method'), // 'credit_card' | 'paypal' | 'bank_transfer'
  transactionId: text('transaction_id'), // external payment provider ID
  metadata: text('metadata'), // JSON string with additional payment info
  paidAt: text('paid_at'),
  refundedAt: text('refunded_at'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
