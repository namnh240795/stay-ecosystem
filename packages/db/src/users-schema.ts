import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Users (Profiles) ───────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  usersId: text('users_id').primaryKey(), // UUID
  usersEmail: text('users_email').notNull().unique(),
  usersName: text('users_name').notNull(),
  usersPhone: text('users_phone'),
  usersAvatarUrl: text('users_avatar_url'),
  usersRole: text('users_role').notNull().default('guest'), // 'guest' | 'partner' | 'admin'
  usersAuth0Sub: text('users_auth0_sub').notNull().unique(),
  usersPartnerId: text('users_partner_id'), // set when role is 'partner'
  usersCreatedAt: text('users_created_at').notNull().default(''),
  usersUpdatedAt: text('users_updated_at').notNull().default(''),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// ─── Partner Applications ────────────────────────────────────────────────────

export const partnerApplications = sqliteTable('partner_applications', {
  partnerApplicationsId: text('partner_applications_id').primaryKey(), // UUID
  partnerApplicationsUserId: text('partner_applications_user_id')
    .notNull()
    .references(() => users.usersId),
  partnerApplicationsBusinessName: text('partner_applications_business_name').notNull(),
  partnerApplicationsBusinessType: text('partner_applications_business_type').notNull(),
  partnerApplicationsDescription: text('partner_applications_description'),
  partnerApplicationsDocuments: text('partner_applications_documents'), // JSON array of document URLs
  partnerApplicationsStatus: text('partner_applications_status').notNull().default('pending'), // 'pending' | 'approved' | 'rejected'
  partnerApplicationsReviewedBy: text('partner_applications_reviewed_by'), // admin user id
  partnerApplicationsReviewedAt: text('partner_applications_reviewed_at'),
  partnerApplicationsRejectionReason: text('partner_applications_rejection_reason'),
  partnerApplicationsCreatedAt: text('partner_applications_created_at').notNull().default(''),
  partnerApplicationsUpdatedAt: text('partner_applications_updated_at').notNull().default(''),
});

export type PartnerApplication = typeof partnerApplications.$inferSelect;
export type NewPartnerApplication = typeof partnerApplications.$inferInsert;
