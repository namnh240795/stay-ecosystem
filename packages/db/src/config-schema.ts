import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Hero Slides ────────────────────────────────────────────────────────────

export const heroSlides = sqliteTable('hero_slides', {
  heroSlidesId: text('hero_slides_id').primaryKey(), // UUID
  heroSlidesTitle: text('hero_slides_title'),
  heroSlidesSubtitle: text('hero_slides_subtitle'),
  heroSlidesImageUrl: text('hero_slides_image_url'),
  heroSlidesLinkUrl: text('hero_slides_link_url'),
  heroSlidesIsActive: integer('hero_slides_is_active', { mode: 'boolean' }).notNull().default(true),
  heroSlidesSortOrder: integer('hero_slides_sort_order').default(0),
  heroSlidesCreatedAt: text('hero_slides_created_at').notNull().default(''),
  heroSlidesUpdatedAt: text('hero_slides_updated_at').notNull().default(''),
});

export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;

// ─── Footer Settings ────────────────────────────────────────────────────────

export const footerSettings = sqliteTable('footer_settings', {
  footerSettingsId: text('footer_settings_id').primaryKey(), // singleton row
  footerSettingsData: text('footer_settings_data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  footerSettingsUpdatedAt: text('footer_settings_updated_at').notNull().default(''),
});

export type FooterSetting = typeof footerSettings.$inferSelect;
export type NewFooterSetting = typeof footerSettings.$inferInsert;

// ─── About Content ──────────────────────────────────────────────────────────

export const aboutContent = sqliteTable('about_content', {
  aboutContentId: text('about_content_id').primaryKey(), // singleton row
  aboutContentData: text('about_content_data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  aboutContentUpdatedAt: text('about_content_updated_at').notNull().default(''),
});

export type AboutContent = typeof aboutContent.$inferSelect;
export type NewAboutContent = typeof aboutContent.$inferInsert;

// ─── Long-term Content ──────────────────────────────────────────────────────

export const longtermContent = sqliteTable('longterm_content', {
  longtermContentId: text('longterm_content_id').primaryKey(), // singleton row
  longtermContentData: text('longterm_content_data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  longtermContentUpdatedAt: text('longterm_content_updated_at').notNull().default(''),
});

export type LongtermContent = typeof longtermContent.$inferSelect;
export type NewLongtermContent = typeof longtermContent.$inferInsert;

// ─── Refund Policies ────────────────────────────────────────────────────────

export const refundPolicies = sqliteTable('refund_policies', {
  refundPoliciesId: text('refund_policies_id').primaryKey(), // singleton row
  refundPoliciesData: text('refund_policies_data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  refundPoliciesUpdatedAt: text('refund_policies_updated_at').notNull().default(''),
});

export type RefundPolicy = typeof refundPolicies.$inferSelect;
export type NewRefundPolicy = typeof refundPolicies.$inferInsert;
