import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ─── Hero Slides ────────────────────────────────────────────────────────────

export const heroSlides = sqliteTable('hero_slides', {
  id: text('id').primaryKey(), // UUID
  title: text('title'),
  subtitle: text('subtitle'),
  imageUrl: text('image_url'),
  linkUrl: text('link_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at').notNull().default(''),
  updatedAt: text('updated_at').notNull().default(''),
});

export type HeroSlide = typeof heroSlides.$inferSelect;
export type NewHeroSlide = typeof heroSlides.$inferInsert;

// ─── Footer Settings ────────────────────────────────────────────────────────

export const footerSettings = sqliteTable('footer_settings', {
  id: text('id').primaryKey(), // singleton row
  data: text('data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  updatedAt: text('updated_at').notNull().default(''),
});

export type FooterSetting = typeof footerSettings.$inferSelect;
export type NewFooterSetting = typeof footerSettings.$inferInsert;

// ─── About Content ──────────────────────────────────────────────────────────

export const aboutContent = sqliteTable('about_content', {
  id: text('id').primaryKey(), // singleton row
  data: text('data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  updatedAt: text('updated_at').notNull().default(''),
});

export type AboutContent = typeof aboutContent.$inferSelect;
export type NewAboutContent = typeof aboutContent.$inferInsert;

// ─── Long-term Content ──────────────────────────────────────────────────────

export const longtermContent = sqliteTable('longterm_content', {
  id: text('id').primaryKey(), // singleton row
  data: text('data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  updatedAt: text('updated_at').notNull().default(''),
});

export type LongtermContent = typeof longtermContent.$inferSelect;
export type NewLongtermContent = typeof longtermContent.$inferInsert;

// ─── Refund Policies ────────────────────────────────────────────────────────

export const refundPolicies = sqliteTable('refund_policies', {
  id: text('id').primaryKey(), // singleton row
  data: text('data'), // JSON text — CMS/config data, intentionally denormalized as singleton JSON
  updatedAt: text('updated_at').notNull().default(''),
});

export type RefundPolicy = typeof refundPolicies.$inferSelect;
export type NewRefundPolicy = typeof refundPolicies.$inferInsert;
