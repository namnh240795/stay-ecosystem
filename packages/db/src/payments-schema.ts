import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';
import { users } from './users-schema';
import { bookings } from './bookings-schema';

// ─── Payments ────────────────────────────────────────────────────────────────

export const payments = sqliteTable('payments', {
  paymentsId: text('payments_id').primaryKey(), // UUID
  paymentsBookingId: text('payments_booking_id')
    .notNull()
    .references(() => bookings.bookingsId),
  paymentsPartnerId: text('payments_partner_id')
    .notNull()
    .references(() => users.usersId),
  paymentsAmount: real('payments_amount').notNull(),
  paymentsCurrency: text('payments_currency').notNull().default('USD'),
  paymentsStatus: text('payments_status').notNull().default('pending'), // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentsPaymentMethod: text('payments_payment_method'), // 'credit_card' | 'paypal' | 'bank_transfer'
  paymentsTransactionId: text('payments_transaction_id'), // external payment provider ID
  paymentsMetadata: text('payments_metadata'), // JSON string with additional payment info
  paymentsPaidAt: text('payments_paid_at'),
  paymentsRefundedAt: text('payments_refunded_at'),
  paymentsCreatedAt: text('payments_created_at').notNull().default(''),
  paymentsUpdatedAt: text('payments_updated_at').notNull().default(''),
});

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
