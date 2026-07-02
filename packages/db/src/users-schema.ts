import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Users (Profiles) ───────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // UUID
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('guest'), // 'guest' | 'partner' | 'admin'
  auth0Sub: text('auth0_sub').notNull().unique(),
  partnerId: text('partner_id'), // set when role is 'partner'
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Partner Applications ────────────────────────────────────────────────────

export const partnerApplications = sqliteTable('partner_applications', {
  id: text('id').primaryKey(), // UUID
  userId: text('user_id')
    .notNull()
    .references(() => users.id),
  businessName: text('business_name').notNull(),
  businessType: text('business_type').notNull(),
  description: text('description'),
  documents: text('documents'), // JSON array of document URLs
  status: text('status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  reviewedBy: text('reviewed_by'), // admin user id
  reviewedAt: text('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type PartnerApplication = typeof partnerApplications.$inferSelect;
export type NewPartnerApplication = typeof partnerApplications.$inferInsert;
