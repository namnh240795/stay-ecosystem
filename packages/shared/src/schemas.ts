import { z } from 'zod';

// ─── Common Field Validators ─────────────────────────────────────────────────

export const emailSchema = z.string().email('Invalid email address');

export const uuidSchema = z.string().uuid('Invalid UUID');

export const phoneSchema = z
  .string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must be at most 20 characters');

export const positiveIntSchema = z.number().int().positive();

// ─── Pagination Schemas ─────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

// ─── Sorting ─────────────────────────────────────────────────────────────────

export const sortOrderSchema = z.enum(['asc', 'desc']);

// ─── Date Range ──────────────────────────────────────────────────────────────

export const dateRangeSchema = z
  .object({
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: 'Check-out date must be after check-in date',
  });
