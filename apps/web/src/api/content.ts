import { apiFetch } from './client';

// Raw interfaces matching the API response with prefixed field names
interface RawLongtermContent {
  longterm_content_id?: string;
  longterm_content_title: string;
  longterm_content_content: string;
  longterm_content_benefits?: string[];
  longterm_content_pricing?: Record<string, unknown>;
  longterm_content_updated_at?: string;
}

interface RawRefundPolicy {
  refund_policies_id?: string;
  refund_policies_title: string;
  refund_policies_content: string;
  refund_policies_rules?: string[];
  refund_policies_updated_at?: string;
}

interface RawVoucher {
  vouchers_id: string;
  vouchers_code: string;
  vouchers_description?: string;
  vouchers_discount_percent?: number;
  vouchers_discount_amount?: number;
  vouchers_valid_from: string;
  vouchers_valid_until: string;
  vouchers_min_booking_amount?: number;
  vouchers_max_uses?: number;
  vouchers_used_count: number;
  vouchers_status: string;
}

// Component-facing interfaces with unprefixed field names
export interface LongtermContent {
  id?: string;
  title: string;
  content: string;
  benefits?: string[];
  pricing?: Record<string, unknown>;
  updatedAt?: string;
}

export interface RefundPolicy {
  id?: string;
  title: string;
  content: string;
  rules?: string[];
  updatedAt?: string;
}

export interface Voucher {
  id: string;
  code: string;
  description?: string;
  discountPercent?: number;
  discountAmount?: number;
  validFrom: string;
  validUntil: string;
  minBookingAmount?: number;
  maxUses?: number;
  usedCount: number;
  status: string;
}

function mapLongtermContent(raw: RawLongtermContent): LongtermContent {
  return {
    id: raw.longterm_content_id,
    title: raw.longterm_content_title,
    content: raw.longterm_content_content,
    benefits: raw.longterm_content_benefits,
    pricing: raw.longterm_content_pricing,
    updatedAt: raw.longterm_content_updated_at,
  };
}

function mapRefundPolicy(raw: RawRefundPolicy): RefundPolicy {
  return {
    id: raw.refund_policies_id,
    title: raw.refund_policies_title,
    content: raw.refund_policies_content,
    rules: raw.refund_policies_rules,
    updatedAt: raw.refund_policies_updated_at,
  };
}

function mapVoucher(raw: RawVoucher): Voucher {
  return {
    id: raw.vouchers_id,
    code: raw.vouchers_code,
    description: raw.vouchers_description,
    discountPercent: raw.vouchers_discount_percent,
    discountAmount: raw.vouchers_discount_amount,
    validFrom: raw.vouchers_valid_from,
    validUntil: raw.vouchers_valid_until,
    minBookingAmount: raw.vouchers_min_booking_amount,
    maxUses: raw.vouchers_max_uses,
    usedCount: raw.vouchers_used_count,
    status: raw.vouchers_status,
  };
}

export async function fetchLongtermContent(): Promise<LongtermContent> {
  const raw = await apiFetch<RawLongtermContent>('/api/content/longterm');
  return mapLongtermContent(raw);
}

export async function updateLongtermContent(
  data: Partial<LongtermContent>
): Promise<LongtermContent> {
  const raw = await apiFetch<RawLongtermContent>('/api/content/longterm', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapLongtermContent(raw);
}

export async function fetchRefundPolicy(): Promise<RefundPolicy> {
  const raw = await apiFetch<RawRefundPolicy>('/api/policies/refund');
  return mapRefundPolicy(raw);
}

export async function updateRefundPolicy(
  data: Partial<RefundPolicy>
): Promise<RefundPolicy> {
  const raw = await apiFetch<RawRefundPolicy>('/api/policies/refund', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return mapRefundPolicy(raw);
}

export async function fetchVouchers(): Promise<{ data: Voucher[] }> {
  const result = await apiFetch<{ data: RawVoucher[] }>('/api/vouchers');
  return {
    data: result.data.map(mapVoucher),
  };
}
